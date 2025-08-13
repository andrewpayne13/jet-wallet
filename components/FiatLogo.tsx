import React from "react";
import { FiatID } from "../types";

type Props = {
  fiatId: FiatID;
  className?: string;
  size?: number;
  alt?: string;
};

const COLORS: Record<FiatID, string> = {
  [FiatID.USD]: "bg-emerald-500",
  [FiatID.EUR]: "bg-blue-500",
  [FiatID.GBP]: "bg-indigo-500",
  [FiatID.AUD]: "bg-teal-500",
  [FiatID.NOK]: "bg-sky-500",
  [FiatID.SEK]: "bg-cyan-500",
  [FiatID.CHF]: "bg-rose-500",
  [FiatID.CAD]: "bg-red-500",
  [FiatID.JPY]: "bg-amber-500",
  [FiatID.SKK]: "bg-slate-500",
};

const FiatLogo: React.FC<Props> = ({ fiatId, className = "", size = 32, alt }) => {
  const classes = COLORS[fiatId] ?? "bg-slate-500";
  const fontSize = Math.max(10, Math.floor(size / 2.8));
  const style: React.CSSProperties = {
    width: size,
    height: size,
    fontSize,
    lineHeight: `${size}px`,
  };

  return (
    <div
      className={`rounded-full ${classes} text-white font-bold text-center shadow-md ${className}`}
      style={style}
      title={alt ?? fiatId}
      aria-label={alt ?? fiatId}
    >
      {fiatId}
    </div>
  );
};

export default FiatLogo;
