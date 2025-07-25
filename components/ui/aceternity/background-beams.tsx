"use client";
import { cn } from "@/lib/utils";
import React from "react";

export const BackgroundBeams = React.memo(({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "absolute inset-0 h-full w-full bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-transparent to-purple-50 opacity-50" />
      <div className="absolute h-full w-full">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${100 + Math.random() * 200}px`,
              height: `${100 + Math.random() * 200}px`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
});

BackgroundBeams.displayName = "BackgroundBeams";
