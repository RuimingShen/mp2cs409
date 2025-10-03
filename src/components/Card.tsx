import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/** Simple surface with border, radius, and subtle shadow */
export default function Card({ children, className = "", ...rest }: CardProps) {
  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm bg-white/60 backdrop-blur ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
