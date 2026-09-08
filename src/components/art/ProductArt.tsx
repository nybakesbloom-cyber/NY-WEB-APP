import type { ArtKind } from "@/lib/catalog";

/* ------------------------------------------------------------------ *
 * Every product picture on the site is drawn here. No photography, no
 * remote assets — the whole catalogue renders offline and on-brand.
 * ------------------------------------------------------------------ */

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * A fixed sequence of pseudo-random numbers for a seed. It has to be a plain
 * array rather than a generator closure: React renders these components twice
 * under Strict Mode, and a generator that advances on each call hands the
 * second render different numbers than the server used — which is a hydration
 * mismatch. Callers take a fresh cursor over this array on every render.
 */
function randoms(seed: number, n: number) {
  let s = seed || 1;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    out.push(s / 4294967296);
  }
  return out;
}

function cursor(values: number[]) {
  let i = 0;
  return () => values[i++ % values.length];
}

function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const r = clamp(((n >> 16) & 255) + amount);
  const g = clamp(((n >> 8) & 255) + amount);
  const b = clamp((n & 255) + amount);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/** Blend a colour towards white — used for the pale grounds behind each piece. */
function wash(hex: string, amount = 0.87) {
  const n = parseInt(hex.slice(1), 16);
  const mix = (v: number) => Math.round(v + (255 - v) * amount);
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

const GOLD = "#C9A227";
const GOLD_LIGHT = "#EBD489";
const LEAF = "#2E6B4B";
const LEAF_DARK = "#164F35";

function Bloom({
  x,
  y,
  r,
  fill,
  accent,
  petals = 8,
  rot = 0,
}: {
  x: number;
  y: number;
  r: number;
  fill: string;
  accent: string;
  petals?: number;
  rot?: number;
}) {
  const idx = Array.from({ length: petals }, (_, i) => i);
  const step = 360 / petals;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {idx.map((i) => (
        <ellipse
          key={`o${i}`}
          rx={r * 0.44}
          ry={r * 0.9}
          cy={-r * 0.4}
          fill={shade(fill, -18)}
          transform={`rotate(${step * i})`}
        />
      ))}
      {idx.map((i) => (
        <ellipse
          key={`i${i}`}
          rx={r * 0.36}
          ry={r * 0.68}
          cy={-r * 0.3}
          fill={fill}
          transform={`rotate(${step * i + step / 2})`}
        />
      ))}
      <circle r={r * 0.34} fill={shade(fill, 26)} />
      <circle r={r * 0.2} fill={accent} />
    </g>
  );
}

function Leaf({
  x,
  y,
  rot,
  len,
  fill = LEAF,
}: {
  x: number;
  y: number;
  rot: number;
  len: number;
  fill?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path
        d={`M0 0 C ${len * 0.35} ${-len * 0.28}, ${len * 0.8} ${-len * 0.22}, ${len} 0
            C ${len * 0.8} ${len * 0.22}, ${len * 0.35} ${len * 0.28}, 0 0 Z`}
        fill={fill}
      />
      <path d={`M0 0 L ${len} 0`} stroke={shade(fill, -34)} strokeWidth={1.4} fill="none" />
    </g>
  );
}

function Backdrop({ uid, tint }: { uid: string; tint: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#FFFDF7" />
          <stop offset="100%" stopColor={wash(tint)} />
        </linearGradient>
        <radialGradient id={`glow-${uid}`} cx="0.5" cy="0.42" r="0.62">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="400" fill={`url(#bg-${uid})`} />
      <circle cx="200" cy="168" r="132" fill={`url(#glow-${uid})`} />
      <circle cx="200" cy="168" r="128" fill="none" stroke={GOLD} strokeOpacity="0.35" strokeWidth="1" />
      <circle cx="200" cy="168" r="139" fill="none" stroke={GOLD} strokeOpacity="0.18" strokeWidth="1" />
      <ellipse cx="200" cy="352" rx="128" ry="16" fill={LEAF_DARK} opacity="0.1" />
    </>
  );
}

function Cake({ uid, hues, rnd }: { uid: string; hues: [string, string]; rnd: number[] }) {
  const [base, cream] = hues;
  const rng = cursor(rnd);
  const drip = (y: number, x0: number, x1: number) => {
    const pts: string[] = [`M${x0} ${y}`];
    const n = 7;
    for (let i = 0; i < n; i++) {
      const w = (x1 - x0) / n;
      const d = 10 + rng() * 16;
      pts.push(`q ${w * 0.25} ${d}, ${w * 0.5} ${d * 0.55} q ${w * 0.25} ${-d * 0.55}, ${w * 0.5} ${-d * 0.5}`);
    }
    pts.push(`L${x1} ${y - 18} L${x0} ${y - 18} Z`);
    return pts.join(" ");
  };

  return (
    <g>
      <defs>
        <linearGradient id={`tier-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={shade(base, -26)} />
          <stop offset="45%" stopColor={base} />
          <stop offset="100%" stopColor={shade(base, -40)} />
        </linearGradient>
        <linearGradient id={`cream-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={shade(cream, -14)} />
          <stop offset="50%" stopColor={shade(cream, 16)} />
          <stop offset="100%" stopColor={shade(cream, -24)} />
        </linearGradient>
      </defs>

      {/* stand */}
      <ellipse cx="200" cy="330" rx="118" ry="20" fill={GOLD_LIGHT} />
      <ellipse cx="200" cy="325" rx="118" ry="19" fill={GOLD} />
      <path d="M182 325 L186 292 L214 292 L218 325 Z" fill={shade(GOLD, -30)} />
      <ellipse cx="200" cy="292" rx="98" ry="17" fill={GOLD_LIGHT} />

      {/* lower tier */}
      <rect x="104" y="216" width="192" height="76" rx="8" fill={`url(#tier-${uid})`} />
      <ellipse cx="200" cy="292" rx="96" ry="16" fill={shade(base, -46)} />
      <path d={drip(232, 104, 296)} fill={`url(#cream-${uid})`} />
      <ellipse cx="200" cy="216" rx="96" ry="16" fill={shade(cream, 12)} />

      {/* upper tier */}
      <rect x="142" y="150" width="116" height="66" rx="7" fill={`url(#tier-${uid})`} />
      <path d={drip(172, 142, 258)} fill={`url(#cream-${uid})`} />
      <ellipse cx="200" cy="150" rx="58" ry="12" fill={shade(cream, 18)} />

      {/* piped rosettes on top */}
      {[-38, -19, 0, 19, 38].map((dx, i) => (
        <g key={i}>
          <circle cx={200 + dx} cy={146 - (i % 2 ? 3 : 0)} r={9} fill={shade(cream, 22)} />
          <circle cx={200 + dx} cy={144 - (i % 2 ? 3 : 0)} r={5} fill={GOLD_LIGHT} />
          <circle cx={200 + dx} cy={143 - (i % 2 ? 3 : 0)} r={2.4} fill={GOLD} />
        </g>
      ))}

      {/* candles */}
      {[-22, 0, 22].map((dx, i) => (
        <g key={`c${i}`}>
          <rect x={198 + dx} y={112} width={5} height={30} rx={2.5} fill={i === 1 ? GOLD : shade(cream, -10)} />
          <path
            d={`M${200.5 + dx} ${104} c 6 5, 5 10, 0 12 c -5 -2, -6 -7, 0 -12 Z`}
            fill={GOLD}
          />
          <circle cx={200.5 + dx} cy={110} r={2} fill="#FFF3C4" />
        </g>
      ))}

      {/* gold band */}
      <rect x="104" y="264" width="192" height="4" fill={GOLD} opacity="0.75" />
    </g>
  );
}

function Bouquet({ uid, hues, rnd }: { uid: string; hues: [string, string]; rnd: number[] }) {
  const main = hues[0];
  const soft = shade(main, 44);
  const rng = cursor(rnd);
  const heads = [
    { x: 200, y: 128, r: 32, f: main },
    { x: 152, y: 156, r: 27, f: soft },
    { x: 248, y: 154, r: 28, f: soft },
    { x: 176, y: 196, r: 25, f: main },
    { x: 226, y: 198, r: 24, f: main },
    { x: 200, y: 168, r: 22, f: shade(main, 30) },
    { x: 126, y: 202, r: 19, f: soft },
    { x: 274, y: 200, r: 20, f: soft },
  ];

  return (
    <g>
      <defs>
        <linearGradient id={`wrap-${uid}`} x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0%" stopColor="#EFE6D2" />
          <stop offset="45%" stopColor="#FBF6E9" />
          <stop offset="100%" stopColor="#DFD3B8" />
        </linearGradient>
      </defs>

      {/* stems */}
      {Array.from({ length: 9 }, (_, i) => {
        const sx = 200 + (i - 4) * 3;
        const ex = 120 + i * 20 + rng() * 6;
        return (
          <path
            key={i}
            d={`M${sx} 300 C ${sx} 250, ${ex} 240, ${ex} 190`}
            stroke={i % 2 ? LEAF : LEAF_DARK}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
          />
        );
      })}

      {/* foliage */}
      <Leaf x={128} y={186} rot={-152} len={58} fill={LEAF_DARK} />
      <Leaf x={272} y={186} rot={-28} len={58} fill={LEAF_DARK} />
      <Leaf x={150} y={128} rot={-118} len={52} />
      <Leaf x={250} y={128} rot={-62} len={52} />
      <Leaf x={200} y={100} rot={-90} len={46} fill={LEAF} />

      {heads.map((h, i) => (
        <Bloom
          key={i}
          x={h.x}
          y={h.y}
          r={h.r}
          fill={h.f}
          accent={GOLD_LIGHT}
          petals={i % 3 === 0 ? 9 : 7}
          rot={i * 23}
        />
      ))}

      {/* paper wrap */}
      <path d="M148 226 L252 226 L282 336 L118 336 Z" fill={`url(#wrap-${uid})`} />
      <path d="M148 226 L200 236 L252 226 L236 336 L164 336 Z" fill="#FFFFFF" opacity="0.45" />
      <path d="M148 226 L252 226 L282 336 L118 336 Z" fill="none" stroke={GOLD} strokeOpacity="0.5" strokeWidth="1.5" />

      {/* ribbon */}
      <rect x="140" y="268" width="120" height="14" rx="7" fill={GOLD} />
      <path d="M200 275 l-28 -16 l0 32 Z" fill={shade(GOLD, -34)} />
      <path d="M200 275 l28 -16 l0 32 Z" fill={shade(GOLD, -34)} />
      <circle cx="200" cy="275" r="8" fill={GOLD_LIGHT} />
    </g>
  );
}

function Basket({ uid, hues }: { uid: string; hues: [string, string]; rnd: number[] }) {
  const main = hues[0];
  const soft = shade(main, 44);
  return (
    <g>
      <defs>
        <linearGradient id={`cane-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#A87B45" />
          <stop offset="50%" stopColor="#D3A76B" />
          <stop offset="100%" stopColor="#8E6435" />
        </linearGradient>
      </defs>

      {/* handle */}
      <path d="M132 258 C 140 148, 260 148, 268 258" fill="none" stroke="#A87B45" strokeWidth="10" strokeLinecap="round" />
      <path d="M132 258 C 140 148, 260 148, 268 258" fill="none" stroke={GOLD} strokeOpacity="0.4" strokeWidth="3" />

      {/* foliage + blooms */}
      <Leaf x={126} y={230} rot={-166} len={54} fill={LEAF_DARK} />
      <Leaf x={274} y={230} rot={-14} len={54} fill={LEAF_DARK} />
      <Leaf x={160} y={196} rot={-128} len={46} />
      <Leaf x={240} y={196} rot={-52} len={46} />

      {[
        { x: 200, y: 190, r: 30, f: main },
        { x: 154, y: 216, r: 25, f: soft },
        { x: 246, y: 214, r: 26, f: soft },
        { x: 178, y: 240, r: 21, f: shade(main, 24) },
        { x: 224, y: 242, r: 20, f: main },
      ].map((h, i) => (
        <Bloom key={i} x={h.x} y={h.y} r={h.r} fill={h.f} accent={GOLD_LIGHT} petals={i % 2 ? 8 : 10} rot={i * 31} />
      ))}

      {/* basket body */}
      <path d="M118 258 L282 258 L262 336 L138 336 Z" fill={`url(#cane-${uid})`} />
      {[0, 1, 2, 3].map((i) => (
        <path
          key={i}
          d={`M${120 + i * 1.6 + 2} ${272 + i * 16} L${280 - i * 1.6 - 2} ${272 + i * 16}`}
          stroke="#7A5228"
          strokeOpacity="0.55"
          strokeWidth="2.5"
        />
      ))}
      <rect x="112" y="248" width="176" height="16" rx="8" fill="#B98A50" />
      <rect x="112" y="248" width="176" height="4" rx="2" fill={GOLD} opacity="0.7" />
    </g>
  );
}

function Combo({ uid, hues, rnd }: { uid: string; hues: [string, string]; rnd: number[] }) {
  const [flower, cake] = hues;
  const rng = cursor(rnd);
  return (
    <g>
      <defs>
        <linearGradient id={`ctier-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={shade(cake, -26)} />
          <stop offset="50%" stopColor={cake} />
          <stop offset="100%" stopColor={shade(cake, -42)} />
        </linearGradient>
      </defs>

      {/* bouquet, left */}
      <g transform="translate(-42 22) scale(0.72)">
        {Array.from({ length: 6 }, (_, i) => {
          const ex = 150 + i * 20 + rng() * 5;
          return (
            <path
              key={i}
              d={`M${196 + i * 3} 300 C ${196 + i * 3} 252, ${ex} 242, ${ex} 196`}
              stroke={i % 2 ? LEAF : LEAF_DARK}
              strokeWidth={4}
              fill="none"
              strokeLinecap="round"
            />
          );
        })}
        <Leaf x={148} y={190} rot={-142} len={56} fill={LEAF_DARK} />
        <Leaf x={252} y={190} rot={-38} len={56} fill={LEAF_DARK} />
        {[
          { x: 200, y: 134, r: 34, f: flower },
          { x: 154, y: 168, r: 29, f: shade(flower, 34) },
          { x: 248, y: 166, r: 29, f: shade(flower, 34) },
          { x: 200, y: 196, r: 26, f: flower },
        ].map((h, i) => (
          <Bloom key={i} x={h.x} y={h.y} r={h.r} fill={h.f} accent={GOLD_LIGHT} petals={8} rot={i * 27} />
        ))}
        <path d="M152 224 L248 224 L276 330 L124 330 Z" fill="#FBF6E9" />
        <path d="M152 224 L248 224 L276 330 L124 330 Z" fill="none" stroke={GOLD} strokeOpacity="0.55" strokeWidth="2" />
        <rect x="146" y="262" width="108" height="16" rx="8" fill={GOLD} />
      </g>

      {/* cake, right */}
      <g transform="translate(96 74) scale(0.62)">
        <ellipse cx="200" cy="330" rx="112" ry="19" fill={GOLD_LIGHT} />
        <ellipse cx="200" cy="324" rx="112" ry="18" fill={GOLD} />
        <rect x="110" y="212" width="180" height="112" rx="8" fill={`url(#ctier-${uid})`} />
        <ellipse cx="200" cy="324" rx="90" ry="15" fill={shade(cake, -48)} />
        <ellipse cx="200" cy="212" rx="90" ry="16" fill="#FBF3E2" />
        <rect x="110" y="266" width="180" height="6" fill={GOLD} opacity="0.8" />
        {[-44, -22, 0, 22, 44].map((dx, i) => (
          <circle key={i} cx={200 + dx} cy={206 - (i % 2 ? 4 : 0)} r={10} fill="#FBF3E2" />
        ))}
        {[-44, -22, 0, 22, 44].map((dx, i) => (
          <circle key={`g${i}`} cx={200 + dx} cy={204 - (i % 2 ? 4 : 0)} r={4.5} fill={GOLD} />
        ))}
        <rect x="196" y="152" width="8" height="46" rx="4" fill="#FBF3E2" />
        <path d="M200 138 c 9 8, 8 16, 0 20 c -8 -4, -9 -12, 0 -20 Z" fill={GOLD} />
      </g>
    </g>
  );
}

function Plant({ uid, hues }: { uid: string; hues: [string, string]; rnd: number[] }) {
  const [green, pot] = hues;
  return (
    <g>
      <defs>
        <linearGradient id={`pot-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={shade(pot, -34)} />
          <stop offset="45%" stopColor={shade(pot, 22)} />
          <stop offset="100%" stopColor={shade(pot, -46)} />
        </linearGradient>
      </defs>

      {/* stems + leaves */}
      {[
        { rot: -90, len: 150, x: 200 },
        { rot: -122, len: 130, x: 200 },
        { rot: -58, len: 132, x: 200 },
        { rot: -146, len: 104, x: 200 },
        { rot: -34, len: 106, x: 200 },
      ].map((s, i) => {
        const rad = (s.rot * Math.PI) / 180;
        const ex = s.x + Math.cos(rad) * s.len;
        const ey = 268 + Math.sin(rad) * s.len;
        return (
          <g key={i}>
            <path
              d={`M${s.x} 268 Q ${(s.x + ex) / 2 + (i % 2 ? 16 : -16)} ${(268 + ey) / 2}, ${ex} ${ey}`}
              stroke={LEAF_DARK}
              strokeWidth={4}
              fill="none"
              strokeLinecap="round"
            />
            <Leaf x={ex} y={ey} rot={s.rot + 12} len={52} fill={i % 2 ? green : shade(green, -22)} />
            <Leaf
              x={s.x + Math.cos(rad) * s.len * 0.6}
              y={268 + Math.sin(rad) * s.len * 0.6}
              rot={s.rot - 40}
              len={40}
              fill={shade(green, 18)}
            />
          </g>
        );
      })}

      {/* soil + pot */}
      <ellipse cx="200" cy="262" rx="66" ry="12" fill="#4A3524" />
      <path d="M134 258 L266 258 L246 340 L154 340 Z" fill={`url(#pot-${uid})`} />
      <rect x="126" y="246" width="148" height="20" rx="10" fill={shade(pot, 12)} />
      <rect x="126" y="246" width="148" height="5" rx="2.5" fill={GOLD_LIGHT} opacity="0.8" />
      <path d="M160 288 L240 288" stroke={GOLD} strokeOpacity="0.55" strokeWidth="3" />
      <path d="M166 306 L234 306" stroke={GOLD} strokeOpacity="0.35" strokeWidth="2" />
    </g>
  );
}

function Hamper({ uid, hues }: { uid: string; hues: [string, string]; rnd: number[] }) {
  const [wood, trim] = hues;
  return (
    <g>
      <defs>
        <linearGradient id={`crate-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={shade(wood, -22)} />
          <stop offset="50%" stopColor={shade(wood, 34)} />
          <stop offset="100%" stopColor={shade(wood, -34)} />
        </linearGradient>
      </defs>

      {/* contents poking out */}
      <g transform="translate(0 -6)">
        <rect x="126" y="176" width="46" height="76" rx="5" fill="#5C3317" />
        <rect x="132" y="184" width="34" height="60" rx="3" fill={GOLD} opacity="0.85" />
        <rect x="136" y="196" width="26" height="4" rx="2" fill="#5C3317" opacity="0.6" />
        <rect x="136" y="208" width="26" height="4" rx="2" fill="#5C3317" opacity="0.6" />

        <rect x="180" y="160" width="52" height="92" rx="6" fill={shade(trim, -8)} />
        <rect x="180" y="160" width="52" height="18" rx="6" fill={GOLD} />
        <circle cx="206" cy="208" r="17" fill="#FFFDF5" opacity="0.75" />
        <circle cx="206" cy="208" r="10" fill={GOLD} opacity="0.7" />

        <rect x="240" y="186" width="42" height="66" rx="5" fill="#3E2417" />
        <rect x="246" y="194" width="30" height="50" rx="3" fill={GOLD_LIGHT} opacity="0.8" />
      </g>

      {/* single rose */}
      <path d="M300 250 C 300 214, 292 196, 288 176" stroke={LEAF_DARK} strokeWidth="4" fill="none" strokeLinecap="round" />
      <Leaf x={292} y={212} rot={-24} len={34} />
      <Bloom x={286} y={162} r={26} fill="#A6122B" accent={GOLD_LIGHT} petals={9} />

      {/* crate */}
      <path d="M112 250 L288 250 L272 340 L128 340 Z" fill={`url(#crate-${uid})`} />
      <rect x="106" y="242" width="188" height="18" rx="6" fill={shade(wood, 18)} />
      <rect x="106" y="242" width="188" height="5" rx="2.5" fill={GOLD} opacity="0.85" />
      <path d="M124 286 L276 286" stroke={shade(wood, -44)} strokeOpacity="0.5" strokeWidth="3" />
      <path d="M120 312 L280 312" stroke={shade(wood, -44)} strokeOpacity="0.5" strokeWidth="3" />
      {/* wax seal */}
      <circle cx="200" cy="300" r="20" fill={GOLD} />
      <circle cx="200" cy="300" r="14" fill="none" stroke={shade(GOLD, -50)} strokeWidth="1.5" />
      <path d="M193 300 l5 6 l9 -12" stroke={shade(GOLD, -60)} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

export default function ProductArt({
  kind,
  hues,
  seed,
  className = "",
}: {
  kind: ArtKind;
  hues: [string, string];
  seed: string;
  className?: string;
}) {
  const uid = hash(seed).toString(36);
  const rnd = randoms(hash(seed), 48);
  const tint = hues[1];

  const body = {
    cake: <Cake uid={uid} hues={hues} rnd={rnd} />,
    bouquet: <Bouquet uid={uid} hues={hues} rnd={rnd} />,
    basket: <Basket uid={uid} hues={hues} rnd={rnd} />,
    combo: <Combo uid={uid} hues={hues} rnd={rnd} />,
    plant: <Plant uid={uid} hues={hues} rnd={rnd} />,
    hamper: <Hamper uid={uid} hues={hues} rnd={rnd} />,
  }[kind];

  return (
    <svg viewBox="0 0 400 400" className={className} role="img" aria-hidden="true">
      <Backdrop uid={uid} tint={tint} />
      {body}
    </svg>
  );
}
