import React from "react";

interface OrganizeSceneProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export const OrganizeScene: React.FC<OrganizeSceneProps> = ({
  className,
  width,
  height,
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width ?? 3840}
      height={height ?? 2160}
      viewBox="0 0 3840 2160"
      className={className}
      {...props}
    >
      <defs>
        <radialGradient id="org-bg" cx="0.5" cy="0" r="0.9">
          <stop offset="0%" stop-color="#17110D" />
          <stop offset="60%" stop-color="#0D0B0A" />
          <stop offset="100%" stop-color="#08080A" />
        </radialGradient>
        <radialGradient id="org-halo" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stop-color="#FF8C42" stop-opacity="0.16" />
          <stop offset="100%" stop-color="#FF8C42" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="org-card" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1A1A1F" />
          <stop offset="100%" stop-color="#121216" />
        </linearGradient>
        <linearGradient id="org-drag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#4A2814" />
          <stop offset="100%" stop-color="#2E1A0F" />
        </linearGradient>
        <filter id="org-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow
            dx="0"
            dy="30"
            stdDeviation="40"
            flood-color="#000"
            flood-opacity="0.6"
          />
        </filter>
        <filter
          id="org-drag-shadow"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feDropShadow
            dx="0"
            dy="40"
            stdDeviation="60"
            flood-color="#FF8C42"
            flood-opacity="0.5"
          />
        </filter>
      </defs>

      <rect width="3840" height="2160" fill="url(#org-bg)" />
      <ellipse cx="1920" cy="1080" rx="1600" ry="1000" fill="url(#org-halo)" />

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

      <g
        font-family="ui-monospace, monospace"
        font-size="32"
        letter-spacing="8"
        fill="#7A7A85"
        text-anchor="middle"
      >
        <text x="800" y="380">
          TO DO
        </text>
        <text x="1920" y="380" fill="#FF8C42">
          DOING
        </text>
        <text x="3040" y="380">
          DONE
        </text>
      </g>
      <line
        x1="800"
        y1="430"
        x2="800"
        y2="1850"
        stroke="#FFFFFF"
        stroke-opacity="0.08"
        strokeWidth="2"
      />
      <line
        x1="1920"
        y1="430"
        x2="1920"
        y2="1850"
        stroke="#FF8C42"
        stroke-opacity="0.3"
        strokeWidth="2"
      />
      <line
        x1="3040"
        y1="430"
        x2="3040"
        y2="1850"
        stroke="#FFFFFF"
        stroke-opacity="0.08"
        strokeWidth="2"
      />

      <g filter="url(#org-shadow)">
        <rect
          x="340"
          y="500"
          width="920"
          height="260"
          rx="20"
          fill="url(#org-card)"
          stroke="#FFFFFF"
          stroke-opacity="0.08"
          strokeWidth="2"
        />
        <rect
          x="390"
          y="560"
          width="500"
          height="16"
          rx="8"
          fill="#FFFFFF"
          fill-opacity="0.5"
        />
        <rect
          x="390"
          y="604"
          width="340"
          height="16"
          rx="8"
          fill="#FFFFFF"
          fill-opacity="0.2"
        />
      </g>

      <g filter="url(#org-shadow)">
        <rect
          x="1460"
          y="500"
          width="920"
          height="260"
          rx="20"
          fill="url(#org-card)"
          stroke="#FFFFFF"
          stroke-opacity="0.08"
          strokeWidth="2"
        />
        <rect
          x="1510"
          y="560"
          width="420"
          height="16"
          rx="8"
          fill="#FFFFFF"
          fill-opacity="0.5"
        />
        <rect
          x="1510"
          y="604"
          width="280"
          height="16"
          rx="8"
          fill="#FFFFFF"
          fill-opacity="0.2"
        />
      </g>

      <g filter="url(#org-shadow)">
        <rect
          x="2580"
          y="500"
          width="920"
          height="260"
          rx="20"
          fill="url(#org-card)"
          stroke="#34D399"
          stroke-opacity="0.3"
          strokeWidth="2"
        />
        <rect
          x="2630"
          y="560"
          width="440"
          height="16"
          rx="8"
          fill="#34D399"
          fill-opacity="0.5"
        />
        <circle
          cx="3340"
          cy="640"
          r="30"
          fill="#34D399"
          fill-opacity="0.15"
          stroke="#34D399"
          stroke-opacity="0.5"
          strokeWidth="2"
        />
        <path
          d="M 3326 640 L 3336 650 L 3354 630"
          fill="none"
          stroke="#34D399"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      <rect
        x="1560"
        y="1280"
        width="720"
        height="240"
        rx="20"
        fill="none"
        stroke="#FF8C42"
        stroke-opacity="0.6"
        strokeWidth="3"
        strokeDasharray="16 12"
      >
        <animate
          attributeName="stroke-opacity"
          values="0.2;0.9;0.6;0.2"
          dur="5s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="strokeDasharray"
          values="8 16;20 10;20 10;8 16"
          dur="5s"
          repeatCount="indefinite"
        />
      </rect>

      <path
        d="M 800 940 Q 1200 760 1560 980"
        fill="none"
        stroke="#FF8C42"
        stroke-opacity="0.5"
        strokeWidth="3"
        strokeDasharray="10 14"
        strokeLinecap="round"
        strokeDashoffset="1200"
      >
        <animate
          attributeName="strokeDashoffset"
          values="1200;0;0"
          keyTimes="0;0.6;1"
          dur="5s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0;1;1;0"
          keyTimes="0;0.2;0.6;0.85"
          dur="5s"
          repeatCount="indefinite"
        />
      </path>

      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0;  0 -60;  700 -60;  760 20;  760 0;  760 0"
          keyTimes="0;0.15;0.55;0.75;0.85;1"
          dur="5s"
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0 0 1 1"
        />

        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0;0;4;-1;0;0"
            keyTimes="0;0.15;0.55;0.75;0.85;1"
            dur="5s"
            repeatCount="indefinite"
          />

          <rect
            x="340"
            y="940"
            width="920"
            height="260"
            rx="20"
            fill="url(#org-drag)"
            stroke="#FF8C42"
            stroke-opacity="0.8"
            strokeWidth="3"
            filter="url(#org-drag-shadow)"
          />

          <g fill="#FF8C42">
            <circle cx="375" cy="1020" r="4" />
            <circle cx="375" cy="1040" r="4" />
            <circle cx="375" cy="1060" r="4" />
          </g>

          <rect
            x="420"
            y="1000"
            width="480"
            height="18"
            rx="9"
            fill="#FF8C42"
            fill-opacity="0.75"
          />
          <rect
            x="420"
            y="1048"
            width="320"
            height="18"
            rx="9"
            fill="#FF8C42"
            fill-opacity="0.35"
          />
          <rect
            x="420"
            y="1120"
            width="160"
            height="44"
            rx="22"
            fill="#FF8C42"
            fill-opacity="0.18"
            stroke="#FF8C42"
            stroke-opacity="0.5"
            strokeWidth="2"
          />
          <text
            x="500"
            y="1150"
            font-family="ui-monospace, monospace"
            font-size="20"
            fill="#FFB37A"
            text-anchor="middle"
          >
            TASK-12
          </text>
        </g>
      </g>

      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="900 1100;  900 1040;  1600 1040;  1660 1120;  1660 1100;  1660 1100"
          keyTimes="0;0.15;0.55;0.75;0.85;1"
          dur="5s"
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0 0 1 1"
        />
        <path
          d="M 0 0 L 30 30 L 21 33 L 24 51 L 15 54 L 12 36 L 3 45 Z"
          fill="#FF8C42"
          stroke="#0B0B0F"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <rect x="36" y="30" width="130" height="44" rx="10" fill="#FF8C42" />
        <text
          x="101"
          y="60"
          text-anchor="middle"
          font-family="ui-monospace, monospace"
          font-size="22"
          font-weight="600"
          fill="#FFFFFF"
        >
          Maya
        </text>
      </g>

      <g transform="translate(3200 260)">
        <rect
          width="360"
          height="60"
          rx="30"
          fill="#34D399"
          fill-opacity="0.12"
          stroke="#34D399"
          stroke-opacity="0.3"
          strokeWidth="2"
        />
        <circle cx="40" cy="30" r="8" fill="#34D399">
          <animate
            attributeName="opacity"
            values="1;0.3;1"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        <text
          x="180"
          y="38"
          text-anchor="middle"
          font-family="ui-monospace, monospace"
          font-size="22"
          letter-spacing="4"
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
        DRAG · DROP · DONE
      </text>
    </svg>
  );
};
