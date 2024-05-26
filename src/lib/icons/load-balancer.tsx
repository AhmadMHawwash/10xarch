import type { CSSProperties, FC } from "react";

export const LoadBalancerIcon: FC<{
  fill?: CSSProperties["fill"];
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
  style?: CSSProperties;
}> = ({ fill = "#b1b1b7", width = "11px", height = "11px", style }) => {
  return (
    <svg
      fill={fill}
      width={width}
      height={height}
      style={style}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="4" y="26" width="4" height="4" />
      <rect x="14" y="26" width="4" height="4" />
      <rect x="24" y="26" width="4" height="4" />
      <path
        d="M25,16H17V12H15v4H7a2.0023,2.0023,0,0,0-2,2v6H7V18h8v6h2V18h8v6h2V18A2.0023,2.0023,0,0,0,25,16Z"
        transform="translate(0 0)"
      />
      <path d="M20,10V2H12v8ZM14,8V4h4V8Z" transform="translate(0 0)" />
      <rect fill="none" width="32" height="32" />
    </svg>
  );
};
