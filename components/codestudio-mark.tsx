/**
 * CodeStudio logo mark — the rounded gradient tile + `</>` glyph from the
 * brand icon, drawn as inline SVG so it's crisp at any size, has no baked
 * white background, and stays in sync with the --brand-* stops in globals.
 */
export function CodeStudioMark({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient
          id="cs-mark-grad"
          x1="0"
          y1="0"
          x2="64"
          y2="64"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#1E1B4B" />
          <stop offset="0.5" stopColor="#312E81" />
          <stop offset="1" stopColor="#4338CA" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill="url(#cs-mark-grad)" />
      {/* </> glyph */}
      <g
        stroke="white"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M24 22 L14 32 L24 42" />
        <path d="M40 22 L50 32 L40 42" />
        <path d="M36 19 L28 45" />
      </g>
    </svg>
  );
}
