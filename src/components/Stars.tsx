export default function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-[1px]" aria-label={`${rating} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, rating - i));
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
            <defs>
              <linearGradient id={`s${i}-${Math.round(rating * 10)}`}>
                <stop offset={`${fill * 100}%`} stopColor="#C9A227" />
                <stop offset={`${fill * 100}%`} stopColor="#DCD6C4" />
              </linearGradient>
            </defs>
            <path
              d="M10 1.6l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.2l-4.94 2.6.94-5.5-4-3.9 5.53-.8L10 1.6z"
              fill={`url(#s${i}-${Math.round(rating * 10)})`}
            />
          </svg>
        );
      })}
    </span>
  );
}
