import React from "react";

interface PlanSceneProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export const PlanScene: React.FC<PlanSceneProps> = ({
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
        <radialGradient id="plan-bg" cx="0.5" cy="0" r="0.9">
          <stop offset="0%" stop-color="#17110D" />
          <stop offset="60%" stop-color="#0D0B0A" />
          <stop offset="100%" stop-color="#08080A" />
        </radialGradient>
        <radialGradient id="plan-halo" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stop-color="#FF8C42" stop-opacity="0.14" />
          <stop offset="70%" stop-color="#FF8C42" stop-opacity="0.02" />
          <stop offset="100%" stop-color="#FF8C42" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="plan-card" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1E1E23" />
          <stop offset="100%" stop-color="#141417" />
        </linearGradient>
        <linearGradient id="plan-card-active" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3A2210" />
          <stop offset="100%" stop-color="#2A1810" />
        </linearGradient>
        <linearGradient id="plan-card-done" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0F2A20" />
          <stop offset="100%" stop-color="#0A1F17" />
        </linearGradient>
        <filter id="plan-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="20"
            stdDeviation="30"
            flood-color="#000"
            flood-opacity="0.55"
          />
        </filter>
      </defs>

      <rect width="3840" height="2160" fill="url(#plan-bg)" />
      <ellipse cx="1920" cy="-200" rx="2000" ry="1200" fill="url(#plan-halo)" />

      <g>
        <animate
          attributeName="opacity"
          values="1;1;0;0"
          keyTimes="0;0.15;0.45;1"
          dur="5s"
          repeatCount="indefinite"
        />
        <path
          d="M 400 900 Q 520 780 680 850 T 900 780 Q 1000 900 880 1020 T 620 1120 Q 520 1080 480 980 Z"
          fill="none"
          stroke="#FFFFFF"
          stroke-opacity="0.45"
          strokeWidth="3"
          strokeDasharray="8 12"
          strokeLinecap="round"
        />
        <path
          d="M 380 1240 L 920 1240 M 440 1320 L 880 1320 M 500 1400 L 900 1400 M 460 1480 L 820 1480"
          fill="none"
          stroke="#FFFFFF"
          stroke-opacity="0.35"
          strokeWidth="3"
          strokeDasharray="8 12"
          strokeLinecap="round"
        />
        <circle
          cx="1120"
          cy="980"
          r="60"
          fill="none"
          stroke="#FFFFFF"
          stroke-opacity="0.3"
          strokeWidth="3"
          strokeDasharray="8 12"
        />
        <path
          d="M 1060 1060 L 1180 1060 M 1080 1100 L 1160 1100"
          stroke="#FFFFFF"
          stroke-opacity="0.25"
          strokeWidth="3"
          strokeDasharray="8 12"
        />
      </g>

      <g>
        <animate
          attributeName="opacity"
          values="0;1;1;1"
          keyTimes="0;0.25;0.9;1"
          dur="5s"
          repeatCount="indefinite"
        />
        <g
          font-family="ui-monospace, monospace"
          font-size="28"
          letter-spacing="6"
          fill="#7A7A85"
          text-anchor="middle"
        >
          <text x="900" y="520">
            TO DO
          </text>
          <text x="1920" y="520" fill="#FF8C42">
            DOING
          </text>
          <text x="2940" y="520">
            DONE
          </text>
        </g>
        <line
          x1="900"
          y1="560"
          x2="900"
          y2="1900"
          stroke="#FFFFFF"
          stroke-opacity="0.08"
          strokeWidth="2"
        />
        <line
          x1="1920"
          y1="560"
          x2="1920"
          y2="1900"
          stroke="#FF8C42"
          stroke-opacity="0.35"
          strokeWidth="2"
        />
        <line
          x1="2940"
          y1="560"
          x2="2940"
          y2="1900"
          stroke="#FFFFFF"
          stroke-opacity="0.08"
          strokeWidth="2"
        />
      </g>

      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 -80;0 0;0 0"
          keyTimes="0;0.35;1"
          dur="5s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0;1;1"
          keyTimes="0;0.35;1"
          dur="5s"
          repeatCount="indefinite"
        />
        <rect
          x="480"
          y="640"
          width="840"
          height="280"
          rx="20"
          fill="url(#plan-card)"
          stroke="#FFFFFF"
          stroke-opacity="0.10"
          strokeWidth="2"
          filter="url(#plan-shadow)"
        />
        <rect
          x="530"
          y="700"
          width="440"
          height="16"
          rx="8"
          fill="#FFFFFF"
          fill-opacity="0.55"
        />
        <rect
          x="530"
          y="744"
          width="300"
          height="16"
          rx="8"
          fill="#FFFFFF"
          fill-opacity="0.22"
        />
        <rect
          x="530"
          y="820"
          width="120"
          height="40"
          rx="20"
          fill="#7A5CFF"
          fill-opacity="0.15"
          stroke="#7A5CFF"
          stroke-opacity="0.4"
        />
        <text
          x="590"
          y="847"
          font-family="ui-monospace, monospace"
          font-size="18"
          fill="#9B7FFF"
          text-anchor="middle"
        >
          design
        </text>
      </g>

      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 -80;0 0;0 0"
          keyTimes="0;0.5;1"
          dur="5s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0;1;1"
          keyTimes="0;0.5;1"
          dur="5s"
          repeatCount="indefinite"
        />
        <rect
          x="1500"
          y="640"
          width="840"
          height="280"
          rx="20"
          fill="url(#plan-card-active)"
          stroke="#FF8C42"
          stroke-opacity="0.55"
          strokeWidth="3"
          filter="url(#plan-shadow)"
        />
        <rect
          x="1550"
          y="700"
          width="520"
          height="16"
          rx="8"
          fill="#FF8C42"
          fill-opacity="0.7"
        />
        <rect
          x="1550"
          y="744"
          width="340"
          height="16"
          rx="8"
          fill="#FF8C42"
          fill-opacity="0.35"
        />
        <rect
          x="1550"
          y="820"
          width="140"
          height="40"
          rx="20"
          fill="#FF8C42"
          fill-opacity="0.15"
          stroke="#FF8C42"
          stroke-opacity="0.5"
        />
        <text
          x="1620"
          y="847"
          font-family="ui-monospace, monospace"
          font-size="18"
          fill="#FFB37A"
          text-anchor="middle"
        >
          in progress
        </text>
      </g>

      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 -80;0 0;0 0"
          keyTimes="0;0.65;1"
          dur="5s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0;1;1"
          keyTimes="0;0.65;1"
          dur="5s"
          repeatCount="indefinite"
        />
        <rect
          x="480"
          y="1000"
          width="840"
          height="240"
          rx="20"
          fill="url(#plan-card)"
          stroke="#FFFFFF"
          stroke-opacity="0.10"
          strokeWidth="2"
          filter="url(#plan-shadow)"
        />
        <rect
          x="530"
          y="1060"
          width="360"
          height="16"
          rx="8"
          fill="#FFFFFF"
          fill-opacity="0.5"
        />
        <rect
          x="530"
          y="1104"
          width="220"
          height="16"
          rx="8"
          fill="#FFFFFF"
          fill-opacity="0.18"
        />
      </g>

      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 -80;0 0;0 0"
          keyTimes="0;0.8;1"
          dur="5s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0;1;1"
          keyTimes="0;0.8;1"
          dur="5s"
          repeatCount="indefinite"
        />
        <rect
          x="2520"
          y="640"
          width="840"
          height="280"
          rx="20"
          fill="url(#plan-card-done)"
          stroke="#34D399"
          stroke-opacity="0.4"
          strokeWidth="3"
          filter="url(#plan-shadow)"
        />
        <rect
          x="2570"
          y="700"
          width="440"
          height="16"
          rx="8"
          fill="#34D399"
          fill-opacity="0.55"
        />
        <rect
          x="2570"
          y="744"
          width="280"
          height="16"
          rx="8"
          fill="#34D399"
          fill-opacity="0.28"
        />

        <g transform="translate(3260 780)">
          <circle
            r="46"
            fill="#34D399"
            fill-opacity="0.14"
            stroke="#34D399"
            stroke-opacity="0.6"
            strokeWidth="3"
          >
            <animate
              attributeName="r"
              values="0;46;46"
              keyTimes="0;0.9;1"
              dur="5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;1;1"
              keyTimes="0;0.9;1"
              dur="5s"
              repeatCount="indefinite"
            />
          </circle>
          <path
            d="M -18 0 L -6 12 L 20 -14"
            fill="none"
            stroke="#34D399"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <animate
              attributeName="opacity"
              values="0;1;1"
              keyTimes="0;0.9;1"
              dur="5s"
              repeatCount="indefinite"
            />
          </path>
        </g>
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
        IDEA → STRUCTURE
      </text>
    </svg>
  );
};
