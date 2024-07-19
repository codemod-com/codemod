import { cx } from "cva";

export default function Burger({ open = false }) {
  return (
    <svg
      width="52"
      height="25"
      viewBox="0 0 52 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cx(
        "z-[2] -mb-[9px] rounded-[8px] transition-transform",
        open ? "open" : "",
      )}
    >
      <g
        filter="url(#filter0_d_1497_9515)"
        className="opacity-0 dark:opacity-100"
      >
        <line
          x1="7"
          y1="24.5"
          x2="45"
          y2="24.5"
          stroke="url(#paint0_linear_1497_9515)"
          shapeRendering="crispEdges"
        />
      </g>
      <g opacity="0.6" filter="url(#filter1_f_1497_9515)">
        <ellipse
          cx="21"
          cy="10"
          rx="21"
          ry="10"
          transform="matrix(-1 -8.74228e-08 -8.74228e-08 1 47 20)"
          fill="url(#paint1_linear_1497_9515)"
        />
      </g>
      <rect
        id="rect-top"
        x="16"
        y="4"
        width="20"
        height="1.5"
        fill="currentColor"
      />
      <rect
        id="rect-bottom"
        x="16"
        y="10.5"
        width="20"
        height="1.5"
        fill="currentColor"
      />
      <defs>
        <filter
          id="filter0_d_1497_9515"
          x="-1"
          y="16"
          width="54"
          height="17"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="4" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_1497_9515"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_1497_9515"
            result="shape"
          />
        </filter>
        <filter
          id="filter1_f_1497_9515"
          x="-15"
          y="0"
          width="82"
          height="60"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="10"
            result="effect1_foregroundBlur_1497_9515"
          />
        </filter>
        <linearGradient
          id="paint0_linear_1497_9515"
          x1="8.9"
          y1="26"
          x2="43.1"
          y2="26"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#565C63" stopOpacity="0" />
          <stop offset="0.475" stopColor="white" />
          <stop offset="1" stopColor="#535B61" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_1497_9515"
          x1="21"
          y1="0"
          x2="21"
          y2="20"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
