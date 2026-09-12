import React from "react";

interface CompleteSceneProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export const CompleteScene: React.FC<CompleteSceneProps> = ({
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
        <radialGradient id="cmp-bg" cx="0.5" cy="0" r="0.9">
          <stop offset="0%" stop-color="#0F1A17" />
          <stop offset="60%" stop-color="#0A0D0C" />
          <stop offset="100%" stop-color="#08080A" />
        </radialGradient>
        <radialGradient id="cmp-halo" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stop-color="#34D399" stop-opacity="0.18" />
          <stop offset="60%" stop-color="#34D399" stop-opacity="0.04" />
          <stop offset="100%" stop-color="#34D399" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="cmp-check" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1A2E26" />
          <stop offset="100%" stop-color="#0F1F1A" />
        </linearGradient>
        <filter id="cmp-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow
            dx="0"
            dy="24"
            stdDeviation="40"
            flood-color="#34D399"
            flood-opacity="0.3"
          />
        </filter>
      </defs>

      <rect width="3840" height="2160" fill="url(#cmp-bg)" />
      <ellipse cx="1920" cy="1080" rx="1800" ry="1200" fill="url(#cmp-halo)" />

      <g transform="translate(1200 1080)">
        <animate
          attributeName="opacity"
          values="0;1;1"
          keyTimes="0;0.3;1"
          dur="5s"
          repeatCount="indefinite"
        />
        <g
          stroke="#34D399"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.35"
        >
          <line x1="0" y1="-560" x2="0" y2="-620">
            <animate
              attributeName="opacity"
              values="0.2;0.9;0.2"
              dur="2.5s"
              repeatCount="indefinite"
            />
          </line>
          <line x1="400" y1="-400" x2="440" y2="-440">
            <animate
              attributeName="opacity"
              values="0.2;0.9;0.2"
              dur="2.5s"
              begin="0.3s"
              repeatCount="indefinite"
            />
          </line>
          <line x1="560" y1="0" x2="620" y2="0">
            <animate
              attributeName="opacity"
              values="0.2;0.9;0.2"
              dur="2.5s"
              begin="0.6s"
              repeatCount="indefinite"
            />
          </line>
          <line x1="400" y1="400" x2="440" y2="440">
            <animate
              attributeName="opacity"
              values="0.2;0.9;0.2"
              dur="2.5s"
              begin="0.9s"
              repeatCount="indefinite"
            />
          </line>
          <line x1="0" y1="560" x2="0" y2="620">
            <animate
              attributeName="opacity"
              values="0.2;0.9;0.2"
              dur="2.5s"
              begin="1.2s"
              repeatCount="indefinite"
            />
          </line>
          <line x1="-400" y1="400" x2="-440" y2="440">
            <animate
              attributeName="opacity"
              values="0.2;0.9;0.2"
              dur="2.5s"
              begin="1.5s"
              repeatCount="indefinite"
            />
          </line>
          <line x1="-560" y1="0" x2="-620" y2="0">
            <animate
              attributeName="opacity"
              values="0.2;0.9;0.2"
              dur="2.5s"
              begin="1.8s"
              repeatCount="indefinite"
            />
          </line>
          <line x1="-400" y1="-400" x2="-440" y2="-440">
            <animate
              attributeName="opacity"
              values="0.2;0.9;0.2"
              dur="2.5s"
              begin="2.1s"
              repeatCount="indefinite"
            />
          </line>
        </g>
      </g>

      <g transform="translate(1200 1080)">
        <circle
          r="440"
          fill="none"
          stroke="#FFFFFF"
          stroke-opacity="0.06"
          strokeWidth="8"
        />
        <circle
          r="440"
          fill="none"
          stroke="#34D399"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="2765"
          strokeDashoffset="2765"
          transform="rotate(-90)"
        >
          <animate
            attributeName="strokeDashoffset"
            values="2765;0;0"
            keyTimes="0;0.65;1"
            dur="5s"
            repeatCount="indefinite"
          />
        </circle>

        <text
          x="0"
          y="10"
          text-anchor="middle"
          font-family="ui-monospace, monospace"
          font-size="180"
          font-weight="500"
          fill="#34D399"
          opacity="0"
        >
          <animate
            attributeName="opacity"
            values="0;0;1;1"
            keyTimes="0;0.55;0.75;1"
            dur="5s"
            repeatCount="indefinite"
          />
          100
        </text>
        <text
          x="0"
          y="80"
          text-anchor="middle"
          font-family="ui-monospace, monospace"
          font-size="28"
          letter-spacing="10"
          fill="#FFFFFF"
          fill-opacity="0.4"
          opacity="0"
        >
          <animate
            attributeName="opacity"
            values="0;0;1;1"
            keyTimes="0;0.55;0.75;1"
            dur="5s"
            repeatCount="indefinite"
          />
          PERCENT
        </text>
      </g>

      <g font-family="ui-monospace, monospace">
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="80 0;0 0;0 0"
            keyTimes="0;0.75;1"
            dur="5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0;1;1"
            keyTimes="0;0.75;1"
            dur="5s"
            repeatCount="indefinite"
          />
          <rect
            x="1960"
            y="620"
            width="1600"
            height="180"
            rx="24"
            fill="url(#cmp-check)"
            stroke="#34D399"
            stroke-opacity="0.35"
            strokeWidth="3"
            filter="url(#cmp-shadow)"
          />
          <circle
            cx="2060"
            cy="710"
            r="40"
            fill="#34D399"
            fill-opacity="0.15"
            stroke="#34D399"
            stroke-opacity="0.55"
            strokeWidth="3"
          />
          <path
            d="M 2042 710 L 2056 724 L 2080 696"
            fill="none"
            stroke="#34D399"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="2160"
            y="690"
            width="620"
            height="20"
            rx="10"
            fill="#34D399"
            fill-opacity="0.6"
          />
          <rect
            x="2160"
            y="726"
            width="380"
            height="16"
            rx="8"
            fill="#34D399"
            fill-opacity="0.3"
          />
        </g>

        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="80 0;0 0;0 0"
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
            x="1960"
            y="830"
            width="1600"
            height="180"
            rx="24"
            fill="url(#cmp-check)"
            stroke="#34D399"
            stroke-opacity="0.35"
            strokeWidth="3"
            filter="url(#cmp-shadow)"
          />
          <circle
            cx="2060"
            cy="920"
            r="40"
            fill="#34D399"
            fill-opacity="0.15"
            stroke="#34D399"
            stroke-opacity="0.55"
            strokeWidth="3"
          />
          <path
            d="M 2042 920 L 2056 934 L 2080 906"
            fill="none"
            stroke="#34D399"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="2160"
            y="900"
            width="720"
            height="20"
            rx="10"
            fill="#34D399"
            fill-opacity="0.6"
          />
          <rect
            x="2160"
            y="936"
            width="440"
            height="16"
            rx="8"
            fill="#34D399"
            fill-opacity="0.3"
          />
        </g>

        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="80 0;0 0;0 0"
            keyTimes="0;0.85;1"
            dur="5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0;1;1"
            keyTimes="0;0.85;1"
            dur="5s"
            repeatCount="indefinite"
          />
          <rect
            x="1960"
            y="1040"
            width="1600"
            height="180"
            rx="24"
            fill="url(#cmp-check)"
            stroke="#34D399"
            stroke-opacity="0.35"
            strokeWidth="3"
            filter="url(#cmp-shadow)"
          />
          <circle
            cx="2060"
            cy="1130"
            r="40"
            fill="#34D399"
            fill-opacity="0.15"
            stroke="#34D399"
            stroke-opacity="0.55"
            strokeWidth="3"
          />
          <path
            d="M 2042 1130 L 2056 1144 L 2080 1116"
            fill="none"
            stroke="#34D399"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="2160"
            y="1110"
            width="540"
            height="20"
            rx="10"
            fill="#34D399"
            fill-opacity="0.6"
          />
          <rect
            x="2160"
            y="1146"
            width="360"
            height="16"
            rx="8"
            fill="#34D399"
            fill-opacity="0.3"
          />
        </g>

        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="80 0;0 0;0 0"
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
          <rect
            x="1960"
            y="1250"
            width="1600"
            height="180"
            rx="24"
            fill="url(#cmp-check)"
            stroke="#34D399"
            stroke-opacity="0.35"
            strokeWidth="3"
            filter="url(#cmp-shadow)"
          />
          <circle
            cx="2060"
            cy="1340"
            r="40"
            fill="#34D399"
            fill-opacity="0.15"
            stroke="#34D399"
            stroke-opacity="0.55"
            strokeWidth="3"
          />
          <path
            d="M 2042 1340 L 2056 1354 L 2080 1326"
            fill="none"
            stroke="#34D399"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="2160"
            y="1320"
            width="680"
            height="20"
            rx="10"
            fill="#34D399"
            fill-opacity="0.6"
          />
          <rect
            x="2160"
            y="1356"
            width="400"
            height="16"
            rx="8"
            fill="#34D399"
            fill-opacity="0.3"
          />
        </g>
      </g>

      <g transform="translate(1200 1560)" opacity="0">
        <animate
          attributeName="opacity"
          values="0;0;1;1"
          keyTimes="0;0.9;0.95;1"
          dur="5s"
          repeatCount="indefinite"
        />
        <rect
          x="-280"
          y="-40"
          width="560"
          height="80"
          rx="40"
          fill="#34D399"
          fill-opacity="0.15"
          stroke="#34D399"
          stroke-opacity="0.5"
          strokeWidth="3"
        />
        <circle cx="-200" cy="0" r="18" fill="#34D399" fill-opacity="0.3" />
        <path
          d="M -212 0 L -204 8 L -186 -12"
          fill="none"
          stroke="#34D399"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text
          x="20"
          y="12"
          text-anchor="middle"
          font-family="ui-monospace, monospace"
          font-size="30"
          letter-spacing="6"
          font-weight="600"
          fill="#34D399"
        >
          SPRINT DONE
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
        SHIPPED · TOGETHER
      </text>
    </svg>
  );
};
