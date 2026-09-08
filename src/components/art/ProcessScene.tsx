const GOLD = "#C9A227";
const GOLD_LIGHT = "#EBD489";
const GOLD_PALE = "#F7EFD6";
const EMERALD = "#0B3D2E";
const EMERALD_MID = "#14684A";
const LEAF = "#2E6B4B";
const CREAM = "#FBF6E9";
const ROSE = "#A6122B";
const CHOC = "#3E2417";

export type SceneName = "order" | "market" | "kitchen" | "boxed" | "doorstep";

function Ground({ id, tint }: { id: string; tint: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#FFFDF7" />
          <stop offset="100%" stopColor={tint} />
        </linearGradient>
      </defs>
      <rect width="420" height="420" rx="26" fill={`url(#sky-${id})`} />
      <circle cx="210" cy="190" r="136" fill="#FFFFFF" opacity="0.55" />
      <circle cx="210" cy="190" r="136" fill="none" stroke={GOLD} strokeOpacity="0.3" />
      <circle cx="210" cy="190" r="148" fill="none" stroke={GOLD} strokeOpacity="0.15" />
      <ellipse cx="210" cy="366" rx="132" ry="14" fill={EMERALD} opacity="0.09" />
    </>
  );
}

/* --------------------------------------------------------------- 01 order */
function Order() {
  return (
    <g>
      {/* phone */}
      <g transform="rotate(-7 210 210)">
        <rect x="140" y="78" width="140" height="248" rx="22" fill={EMERALD} />
        <rect x="148" y="90" width="124" height="224" rx="15" fill={CREAM} />
        <rect x="190" y="82" width="40" height="7" rx="3.5" fill="#0A2E22" />

        {/* card on screen */}
        <rect x="158" y="102" width="104" height="96" rx="10" fill={GOLD_PALE} />
        <ellipse cx="210" cy="176" rx="34" ry="6" fill={GOLD} />
        <rect x="184" y="146" width="52" height="28" rx="4" fill={CHOC} />
        <rect x="192" y="128" width="36" height="20" rx="4" fill="#6B3B22" />
        <path d="M184 152 q6 9 12 4 q6 9 12 4 q6 9 12 4 q6 9 12 3 v-10 h-48 Z" fill={CREAM} />
        {[198, 210, 222].map((x) => (
          <rect key={x} x={x - 1.5} y="118" width="3" height="12" rx="1.5" fill={GOLD} />
        ))}

        <rect x="158" y="208" width="70" height="7" rx="3.5" fill={EMERALD} opacity="0.5" />
        <rect x="158" y="222" width="46" height="6" rx="3" fill={EMERALD} opacity="0.25" />
        <rect x="158" y="248" width="104" height="30" rx="15" fill={GOLD} />
        <rect x="186" y="260" width="48" height="6" rx="3" fill={EMERALD} opacity="0.6" />
      </g>

      {/* tap ripple */}
      <circle cx="238" cy="284" r="16" fill="none" stroke={GOLD} strokeWidth="2.5" opacity="0.75" />
      <circle cx="238" cy="284" r="26" fill="none" stroke={GOLD} strokeWidth="2" opacity="0.4" />
      <circle cx="238" cy="284" r="36" fill="none" stroke={GOLD} strokeWidth="1.5" opacity="0.18" />

      {/* confirmation chip */}
      <g transform="translate(268 118)">
        <rect x="0" y="0" width="112" height="46" rx="14" fill={EMERALD_MID} />
        <circle cx="26" cy="23" r="12" fill={GOLD_LIGHT} />
        <path d="M20 23 l4.5 5 l8-10" stroke={EMERALD} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="46" y="14" width="50" height="6" rx="3" fill={GOLD_PALE} opacity="0.9" />
        <rect x="46" y="26" width="34" height="5" rx="2.5" fill={GOLD_PALE} opacity="0.55" />
      </g>
    </g>
  );
}

/* -------------------------------------------------------------- 02 market */
function Market() {
  const buckets: [number, string, string][] = [
    [116, ROSE, "#D6485F"],
    [210, GOLD, "#EBD489"],
    [304, "#6B3FA0", "#B48FD6"],
  ];
  return (
    <g>
      {/* awning */}
      <path d="M52 96 h316 l-16 40 H68 Z" fill={EMERALD} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <path
          key={i}
          d={`M${68 + i * 44} 96 h22 l-9 40 h-22 Z`}
          fill={GOLD}
          opacity={0.85}
        />
      ))}
      <rect x="46" y="86" width="328" height="12" rx="6" fill="#0A2E22" />
      <path d="M64 136 h292 v6 H64 Z" fill={GOLD_LIGHT} />

      {buckets.map(([x, dark, light], i) => (
        <g key={x}>
          {/* stems */}
          {[-16, -6, 4, 14].map((dx, j) => (
            <path
              key={j}
              d={`M${x + dx * 0.35} 300 C ${x + dx * 0.35} 268, ${x + dx} 254, ${x + dx} 232`}
              stroke={j % 2 ? LEAF : "#164F35"}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          ))}
          {/* heads */}
          {[
            [0, 206, 20],
            [-24, 220, 16],
            [24, 218, 16],
            [-12, 238, 13],
            [13, 240, 13],
          ].map(([dx, cy, r], j) => (
            <g key={j}>
              <circle cx={x + dx} cy={cy} r={r} fill={j % 2 ? light : dark} />
              <circle cx={x + dx} cy={cy} r={r * 0.42} fill={GOLD_LIGHT} />
              <ellipse
                cx={x + dx - r * 0.35}
                cy={cy - r * 0.4}
                rx={r * 0.3}
                ry={r * 0.18}
                fill="#FFFFFF"
                opacity="0.35"
              />
            </g>
          ))}
          {/* bucket */}
          <path
            d={`M${x - 34} 298 h68 l-9 60 h-50 Z`}
            fill={i === 1 ? "#8E7B4A" : "#5E7B70"}
          />
          <rect x={x - 38} y="290" width="76" height="12" rx="6" fill={i === 1 ? "#A8935A" : "#6E8E82"} />
          <rect x={x - 38} y="290" width="76" height="3.5" rx="1.75" fill={GOLD_LIGHT} opacity="0.7" />
        </g>
      ))}

      {/* crate + clock */}
      <rect x="60" y="330" width="80" height="30" rx="5" fill="#A87B45" />
      <path d="M64 342 h72 M64 352 h72" stroke="#7A5228" strokeWidth="2.5" opacity="0.6" />
      <g transform="translate(322 306)">
        <circle r="26" fill={EMERALD} />
        <circle r="26" fill="none" stroke={GOLD} strokeWidth="2" />
        <path d="M0 -14 V0 l10 6" stroke={GOLD_LIGHT} strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
}

/* ------------------------------------------------------------- 03 kitchen */
function Kitchen() {
  return (
    <g>
      {/* cooling rack above */}
      <rect x="96" y="82" width="228" height="8" rx="4" fill="#9AA5A0" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <rect key={i} x={104 + i * 28} y="72" width="4" height="12" rx="2" fill="#B7C0BB" />
      ))}
      {[130, 210, 290].map((x, i) => (
        <g key={x}>
          <ellipse cx={x} cy="70" rx="34" ry="11" fill="#C88A4E" />
          <path d={`M${x - 34} 70 v-14 a34 14 0 0 1 68 0 v14 Z`} fill="#D89A5C" />
          <ellipse cx={x} cy="56" rx="34" ry="12" fill="#E5AE72" />
          {i === 1 && <ellipse cx={x - 10} cy="52" rx="9" ry="4" fill="#FFFFFF" opacity="0.25" />}
        </g>
      ))}

      {/* heat */}
      {[168, 210, 252].map((x, i) => (
        <path
          key={x}
          d={`M${x} 168 c -9 -14, 9 -22, 0 -36 c -9 -14, 9 -20, 0 -32`}
          stroke={GOLD}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          opacity={i === 1 ? 0.5 : 0.28}
        />
      ))}

      {/* oven */}
      <rect x="96" y="176" width="228" height="184" rx="16" fill={EMERALD} />
      <rect x="96" y="176" width="228" height="34" rx="16" fill="#0A2E22" />
      {[128, 158, 188].map((x) => (
        <circle key={x} cx={x} cy="193" r="7" fill={GOLD} />
      ))}
      <rect x="238" y="188" width="66" height="10" rx="5" fill={GOLD_LIGHT} opacity="0.5" />

      <rect x="112" y="222" width="196" height="120" rx="10" fill="#0A2E22" />
      <rect x="120" y="230" width="180" height="104" rx="7" fill="#F0C462" />
      <rect x="120" y="230" width="180" height="104" rx="7" fill="url(#oven-glow)" />
      <defs>
        <radialGradient id="oven-glow" cx="0.5" cy="0.65" r="0.7">
          <stop offset="0%" stopColor="#FFF0B8" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#E09B2A" stopOpacity="0.35" />
        </radialGradient>
      </defs>

      {/* cake in the oven */}
      <ellipse cx="210" cy="322" rx="52" ry="9" fill="#B5761F" opacity="0.55" />
      <rect x="166" y="272" width="88" height="48" rx="7" fill={CHOC} />
      <ellipse cx="210" cy="272" rx="44" ry="10" fill="#6B3B22" />
      <ellipse cx="210" cy="320" rx="44" ry="9" fill="#2A170E" />
      <rect x="112" y="350" width="196" height="10" rx="5" fill={GOLD} />
    </g>
  );
}

/* --------------------------------------------------------------- 04 boxed */
function Boxed() {
  return (
    <g>
      {/* camera frame corners — the sealed-box photo */}
      {[
        [58, 74, 1, 1],
        [362, 74, -1, 1],
        [58, 346, 1, -1],
        [362, 346, -1, -1],
      ].map(([x, y, sx, sy], i) => (
        <path
          key={i}
          d={`M${x} ${y + 30 * (sy as number)} V${y} H${x + 30 * (sx as number)}`}
          stroke={GOLD}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          opacity="0.65"
        />
      ))}

      {/* tissue */}
      <path d="M132 236 l24 -46 l40 26 l34 -34 l38 40 l22 -30 l14 46 Z" fill={GOLD_PALE} />
      <path d="M148 236 l22 -34 l32 22 l30 -26 l30 32 l18 -22 l10 28 Z" fill="#FFFFFF" opacity="0.7" />

      {/* cake inside */}
      <ellipse cx="210" cy="222" rx="46" ry="10" fill={GOLD} />
      <rect x="172" y="176" width="76" height="44" rx="6" fill={ROSE} />
      <path
        d="M172 190 q7 12 13 6 q7 12 13 6 q7 12 13 6 q7 12 13 5 q7 12 11 4 v-16 h-76 Z"
        fill={CREAM}
      />
      <ellipse cx="210" cy="176" rx="38" ry="9" fill="#F2DDE0" />

      {/* box body */}
      <path d="M118 236 h184 l-14 122 H132 Z" fill={EMERALD} />
      <path d="M118 236 h184 l-6 22 H124 Z" fill="#0A2E22" />
      <rect x="110" y="226" width="200" height="16" rx="8" fill={EMERALD_MID} />

      {/* ribbon */}
      <rect x="198" y="242" width="24" height="116" fill={GOLD} />
      <rect x="126" y="282" width="168" height="22" fill={GOLD} />
      <path d="M210 282 l-34 -22 v40 Z" fill="#A6821A" />
      <path d="M210 282 l34 -22 v40 Z" fill="#A6821A" />
      <circle cx="210" cy="286" r="13" fill={GOLD_LIGHT} />
      <circle cx="210" cy="286" r="7" fill={GOLD} />

      {/* seal */}
      <circle cx="286" cy="330" r="19" fill={GOLD_LIGHT} />
      <circle cx="286" cy="330" r="13" fill="none" stroke="#8A6A16" strokeWidth="1.6" />
      <path d="M279 330 l5 6 l9 -12" stroke="#8A6A16" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/* ------------------------------------------------------------ 05 doorstep */
function Doorstep() {
  return (
    <g>
      {/* wall + door */}
      <rect x="118" y="74" width="184" height="252" rx="8" fill="#E4E0D4" />
      <rect x="134" y="90" width="152" height="236" rx="6" fill={EMERALD} />
      <rect x="146" y="102" width="128" height="94" rx="4" fill="#0A2E22" />
      <rect x="146" y="208" width="128" height="106" rx="4" fill="#0A2E22" />
      <rect x="146" y="102" width="128" height="94" rx="4" fill="none" stroke={GOLD} strokeOpacity="0.4" strokeWidth="1.5" />
      <rect x="146" y="208" width="128" height="106" rx="4" fill="none" stroke={GOLD} strokeOpacity="0.4" strokeWidth="1.5" />
      <circle cx="262" cy="212" r="7" fill={GOLD} />
      <rect x="118" y="66" width="184" height="14" rx="6" fill="#CFC9B8" />

      {/* number plate */}
      <rect x="308" y="118" width="34" height="46" rx="6" fill={GOLD} />
      <path d="M318 152 v-24 l8 -6 v30" stroke={EMERALD} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* step + mat */}
      <rect x="94" y="326" width="232" height="18" rx="4" fill="#D3CDBC" />
      <rect x="106" y="344" width="208" height="16" rx="4" fill="#C2BBA8" />
      <rect x="196" y="308" width="96" height="20" rx="4" fill="#8E6A3C" />
      <path d="M204 318 h80" stroke="#6E4F2A" strokeWidth="3" />

      {/* the box, delivered */}
      <path d="M104 246 h94 l-8 62 h-78 Z" fill={EMERALD_MID} />
      <rect x="98" y="238" width="106" height="14" rx="7" fill="#1C8560" />
      <rect x="142" y="252" width="16" height="56" fill={GOLD} />
      <rect x="104" y="268" width="92" height="14" fill={GOLD} />
      <circle cx="150" cy="275" r="10" fill={GOLD_LIGHT} />

      {/* potted plant */}
      <g transform="translate(330 250)">
        {[-52, -26, 0, 26, 52].map((rot, i) => (
          <g key={i} transform={`rotate(${rot - 90})`}>
            <path d="M0 0 L44 0" stroke="#164F35" strokeWidth="3.5" strokeLinecap="round" />
            <path
              d="M44 0 C 56 -11, 74 -9, 84 0 C 74 9, 56 11, 44 0 Z"
              fill={i % 2 ? LEAF : "#1C8560"}
              transform="scale(0.62) translate(26 0)"
            />
          </g>
        ))}
        <path d="M-26 4 h52 l-8 44 h-36 Z" fill={GOLD} />
        <rect x="-30" y="-4" width="60" height="12" rx="6" fill={GOLD_LIGHT} />
      </g>

      {/* handover photo chip */}
      <g transform="translate(46 92)">
        <rect width="96" height="72" rx="12" fill="#FFFFFF" stroke={GOLD} strokeOpacity="0.6" />
        <rect x="8" y="8" width="80" height="44" rx="7" fill={GOLD_PALE} />
        <circle cx="34" cy="30" r="10" fill={EMERALD_MID} />
        <path d="M52 42 l12 -14 l14 16 h-40 Z" fill={LEAF} />
        <rect x="8" y="58" width="46" height="6" rx="3" fill={EMERALD} opacity="0.35" />
      </g>
    </g>
  );
}

const SCENES: Record<SceneName, { node: React.ReactNode; tint: string }> = {
  order: { node: <Order />, tint: "#EDF3EE" },
  market: { node: <Market />, tint: "#FBEEF1" },
  kitchen: { node: <Kitchen />, tint: "#FBF0DC" },
  boxed: { node: <Boxed />, tint: "#F3EFE1" },
  doorstep: { node: <Doorstep />, tint: "#EAF1EC" },
};

export default function ProcessScene({
  name,
  className = "",
}: {
  name: SceneName;
  className?: string;
}) {
  const scene = SCENES[name];
  return (
    <svg viewBox="0 0 420 420" className={className} role="img" aria-hidden="true">
      <Ground id={name} tint={scene.tint} />
      {scene.node}
    </svg>
  );
}
