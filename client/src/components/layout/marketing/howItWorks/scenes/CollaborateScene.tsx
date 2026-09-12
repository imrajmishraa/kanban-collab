import React from "react";

interface CollabrateSceneProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export const CollaborateScene: React.FC<CollabrateSceneProps> = ({
  className,
  width,
  height,
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3840 2160"
      className={className}
      width={width}
      height={height}
      {...props}
    >
      <defs>
        <radialGradient id="col-bg" cx="0.5" cy="0" r="0.9">
          <stop offset="0%" stop-color="#17110D" />
          <stop offset="60%" stop-color="#0D0B0A" />
          <stop offset="100%" stop-color="#08080A" />
        </radialGradient>
        <radialGradient id="col-halo" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.10" />
          <stop offset="100%" stop-color="#38BDF8" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="col-card" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1A1A1F" />
          <stop offset="100%" stop-color="#121216" />
        </linearGradient>
        <filter id="col-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow
            dx="0"
            dy="20"
            stdDeviation="30"
            flood-color="#000"
            flood-opacity="0.55"
          />
        </filter>
      </defs>

      <rect width="3840" height="2160" fill="url(#col-bg)" />
      <ellipse cx="1920" cy="1080" rx="1600" ry="1000" fill="url(#col-halo)" />

      <rect
        x="200"
        y="240"
        width="3440"
        height="1680"
        rx="40"
        fill="#0E0E12"
        stroke="#FFFFFF"
        stroke-opacity="0.06"
        strokeWidth="2"
      />
      <line
        x1="1340"
        y1="360"
        x2="1340"
        y2="1850"
        stroke="#FFFFFF"
        stroke-opacity="0.06"
        strokeWidth="2"
      />
      <line
        x1="2500"
        y1="360"
        x2="2500"
        y2="1850"
        stroke="#FFFFFF"
        stroke-opacity="0.06"
        strokeWidth="2"
      />

      <g filter="url(#col-shadow)">
        <rect
          x="340"
          y="500"
          width="920"
          height="220"
          rx="20"
          fill="url(#col-card)"
          stroke="#FFFFFF"
          stroke-opacity="0.08"
          strokeWidth="2"
        />
        <rect
          x="390"
          y="550"
          width="500"
          height="16"
          rx="8"
          fill="#FFFFFF"
          fill-opacity="0.5"
        />
        <rect
          x="390"
          y="594"
          width="340"
          height="16"
          rx="8"
          fill="#FFFFFF"
          fill-opacity="0.2"
        />

        <rect
          x="340"
          y="780"
          width="920"
          height="220"
          rx="20"
          fill="url(#col-card)"
          stroke="#FFFFFF"
          stroke-opacity="0.08"
          strokeWidth="2"
        />
        <rect
          x="390"
          y="830"
          width="420"
          height="16"
          rx="8"
          fill="#FFFFFF"
          fill-opacity="0.5"
        />

        <rect
          x="1460"
          y="500"
          width="920"
          height="220"
          rx="20"
          fill="url(#col-card)"
          stroke="#FF8C42"
          stroke-opacity="0.35"
          strokeWidth="3"
        />
        <rect
          x="1510"
          y="550"
          width="460"
          height="16"
          rx="8"
          fill="#FF8C42"
          fill-opacity="0.65"
        />
        <rect
          x="1510"
          y="594"
          width="300"
          height="16"
          rx="8"
          fill="#FF8C42"
          fill-opacity="0.28"
        />

        <rect
          x="1460"
          y="780"
          width="920"
          height="220"
          rx="20"
          fill="url(#col-card)"
          stroke="#FFFFFF"
          stroke-opacity="0.08"
          strokeWidth="2"
        />
        <rect
          x="1510"
          y="830"
          width="520"
          height="16"
          rx="8"
          fill="#FFFFFF"
          fill-opacity="0.5"
        />

        <rect
          x="2580"
          y="500"
          width="920"
          height="220"
          rx="20"
          fill="url(#col-card)"
          stroke="#34D399"
          stroke-opacity="0.3"
          strokeWidth="2"
        />
        <rect
          x="2630"
          y="550"
          width="400"
          height="16"
          rx="8"
          fill="#34D399"
          fill-opacity="0.55"
        />
        <circle
          cx="3340"
          cy="610"
          r="28"
          fill="#34D399"
          fill-opacity="0.15"
          stroke="#34D399"
          stroke-opacity="0.5"
          strokeWidth="2"
        />
        <path
          d="M 3327 610 L 3336 620 L 3353 601"
          fill="none"
          stroke="#34D399"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1500 800; 1700 1000; 1400 1200; 900 950; 1500 800"
          dur="8s"
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"
        />
        <path
          d="M 0 0 L 34 34 L 24 37 L 27 58 L 17 61 L 14 41 L 3 51 Z"
          fill="#FF8C42"
          stroke="#0B0B0F"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <rect x="40" y="34" width="140" height="48" rx="10" fill="#FF8C42" />
        <text
          x="110"
          y="66"
          text-anchor="middle"
          font-family="ui-monospace, monospace"
          font-size="24"
          font-weight="600"
          fill="#FFFFFF"
        >
          Maya
        </text>
      </g>

      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="2600 1100; 2200 900; 2400 1300; 3000 1000; 2600 1100"
          dur="9s"
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"
        />
        <path
          d="M 0 0 L 34 34 L 24 37 L 27 58 L 17 61 L 14 41 L 3 51 Z"
          fill="#38BDF8"
          stroke="#0B0B0F"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <rect x="40" y="34" width="120" height="48" rx="10" fill="#38BDF8" />
        <text
          x="100"
          y="66"
          text-anchor="middle"
          font-family="ui-monospace, monospace"
          font-size="24"
          font-weight="600"
          fill="#0B0B0F"
        >
          Rio
        </text>
      </g>

      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="3200 1400; 2800 1300; 3200 1100; 3400 1400; 3200 1400"
          dur="7s"
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"
        />
        <path
          d="M 0 0 L 34 34 L 24 37 L 27 58 L 17 61 L 14 41 L 3 51 Z"
          fill="#F472B6"
          stroke="#0B0B0F"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <rect x="40" y="34" width="130" height="48" rx="10" fill="#F472B6" />
        <text
          x="105"
          y="66"
          text-anchor="middle"
          font-family="ui-monospace, monospace"
          font-size="24"
          font-weight="600"
          fill="#0B0B0F"
        >
          Sam
        </text>
      </g>

      <g transform="translate(3200 260)">
        <rect
          width="380"
          height="64"
          rx="32"
          fill="#34D399"
          fill-opacity="0.12"
          stroke="#34D399"
          stroke-opacity="0.35"
          strokeWidth="2"
        />
        <circle cx="44" cy="32" r="9" fill="#34D399">
          <animate
            attributeName="opacity"
            values="1;0.3;1"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        <text
          x="200"
          y="41"
          text-anchor="middle"
          font-family="ui-monospace, monospace"
          font-size="22"
          letter-spacing="5"
          fill="#34D399"
        >
          3 ONLINE
        </text>
      </g>

      <text
        x="1920"
        y="2060"
        text-anchor="middle"
        font-family="ui-monospace, monospace"
        font-size="24"
        letter-spacing="12"
        fill="#FFFFFF"
        fill-opacity="0.2"
      >
        SHARED · LIVE · SYNCED
      </text>
    </svg>
  );
};
