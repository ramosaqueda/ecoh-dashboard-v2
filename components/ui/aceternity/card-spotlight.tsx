"use client";
import { cn } from "@/lib/utils";
import React, { useState } from "react";

export const CardSpotlight = ({
  children,
  radius = 350,
  color = "#262626",
  className,
  ...props
}: {
  radius?: number;
  color?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      className={cn(
        "group/spotlight relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {isHovered && (
        <div
          className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover/spotlight:opacity-100"
          style={{
            background: `radial-gradient(${radius}px circle at ${mousePosition.x}px ${mousePosition.y}px, ${color}10, transparent 40%)`,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
