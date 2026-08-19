import type { Product } from "@/lib/types";

/**
 * Flat pack artwork, drawn as SVG from the product's own colours and pack
 * size. This is what fills every product card — it loads instantly, scales to
 * any screen and stays correct when the store owner adds a new product.
 */
export function PackVisual({
  product,
  className = "",
  detailed = true,
}: {
  product: Product;
  className?: string;
  detailed?: boolean;
}) {
  const { theme } = product;
  const id = `pack-${product.id}`;

  return (
    <svg
      viewBox="0 0 320 220"
      role="img"
      aria-label={`${product.name} pack — ${product.padCount} pads, ${product.size}, ${product.length}`}
      className={className}
    >
      <defs>
        <linearGradient id={`${id}-base`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.base} stopOpacity="1" />
          <stop offset="65%" stopColor={theme.base} stopOpacity="1" />
          <stop offset="100%" stopColor={theme.base} stopOpacity="0.82" />
        </linearGradient>
        <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="45%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <rect x="8" y="14" width="304" height="192" rx="14" />
        </clipPath>
      </defs>

      {/* soft ground shadow */}
      <ellipse cx="160" cy="210" rx="120" ry="9" fill={theme.tab} opacity="0.14" />

      <g clipPath={`url(#${id}-clip)`}>
        <rect x="8" y="14" width="304" height="192" fill={`url(#${id}-base)`} />

        {/* technology band */}
        <rect x="176" y="14" width="52" height="192" fill={theme.band} />

        {/* open tab */}
        <path d="M244 14 C233 60 233 160 244 206 L312 206 L312 14 Z" fill={theme.tab} />

        {/* wordmark */}
        <text
          x="26"
          y="60"
          fill={theme.ink}
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="34"
          fontStyle="italic"
          fontWeight="700"
        >
          Femi
        </text>
        <circle cx="112" cy="49" r="12" fill={theme.ink} />
        <text
          x="112"
          y="55"
          fill={theme.base}
          fontFamily="system-ui, sans-serif"
          fontSize="14"
          fontWeight="700"
          textAnchor="middle"
        >
          9
        </text>

        {detailed && (
          <>
            <text x="26" y="78" fill={theme.ink} fontFamily="system-ui, sans-serif" fontSize="9" opacity="0.85">
              Ultra-thin soft cotton finish pads
            </text>
            <text x="26" y="100" fill={theme.ink} fontFamily="system-ui, sans-serif" fontSize="13" fontWeight="700">
              Natural. Comfortable.
            </text>
            <text x="26" y="116" fill={theme.ink} fontFamily="system-ui, sans-serif" fontSize="13" fontWeight="700">
              Breathable.
            </text>
            <text x="26" y="140" fill={theme.tab} fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="700">
              Eco-friendly
            </text>
            <text x="26" y="154" fill={theme.tab} fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="700">
              Sanitary Napkins
            </text>
          </>
        )}

        {/* pack spec */}
        <text x="26" y="184" fill={theme.ink} fontFamily="system-ui, sans-serif" fontSize="12" fontWeight="700">
          {product.padCount} Pads
        </text>
        <text x="26" y="197" fill={theme.ink} fontFamily="system-ui, sans-serif" fontSize="10" opacity="0.8">
          {product.size} · {product.length}
        </text>

        {/* pad illustration */}
        <g transform="translate(202 112) scale(0.62)">
          <path
            d="M0 -78 C16 -78 19 -50 19 -24 C19 0 19 22 19 50 C19 74 14 81 0 81 C-14 81 -19 74 -19 50 C-19 22 -19 0 -19 -24 C-19 -50 -16 -78 0 -78 Z"
            fill="#ffffff"
          />
          <path d="M-18 -16 C-42 -24 -52 -3 -36 11 C-28 17 -21 13 -18 8 Z" fill="#ffffff" />
          <path d="M18 -16 C42 -24 52 -3 36 11 C28 17 21 13 18 8 Z" fill="#ffffff" />
          <rect x="-9" y="-18" width="18" height="40" rx="4" fill="#cfe8a8" />
        </g>

        {/* vertical script on the tab */}
        <text
          x="278"
          y="110"
          fill={theme.base}
          fontFamily="Georgia, serif"
          fontSize="20"
          fontStyle="italic"
          fontWeight="700"
          textAnchor="middle"
          transform="rotate(90 278 110)"
          opacity="0.95"
        >
          everyday
        </text>

        <rect x="8" y="14" width="304" height="192" fill={`url(#${id}-sheen)`} />
      </g>

      <rect
        x="8"
        y="14"
        width="304"
        height="192"
        rx="14"
        fill="none"
        stroke={theme.tab}
        strokeOpacity="0.18"
        strokeWidth="1.5"
      />
    </svg>
  );
}
