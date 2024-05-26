import type { CSSProperties, FC } from "react";

export const ServerIcon: FC<{
  fill?: CSSProperties["fill"];
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
  style?: CSSProperties;
}> = ({ fill = "#b1b1b7", width = "11px", height = "11px", style }) => {
  return (
    <svg
      width={width}
      height={height}
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="1"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M4 12L20 12"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 8H10"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 16H10"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
