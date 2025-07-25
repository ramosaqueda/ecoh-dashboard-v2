"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.5,
}: {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
}) => {
  const [scope, setScope] = useState<HTMLDivElement | null>(null);
  const wordsArray = words.split(" ");

  useEffect(() => {
    if (scope) {
      const elements = scope.querySelectorAll(".word");
      elements.forEach((element, idx) => {
        setTimeout(() => {
          element.classList.remove("opacity-0");
          element.classList.add("opacity-100");
        }, idx * 100);
      });
    }
  }, [scope]);

  const renderWords = () => {
    return (
      <motion.div ref={setScope}>
        {wordsArray.map((word, idx) => {
          return (
            <motion.span
              key={word + idx}
              className="word opacity-0 transition-opacity duration-500"
              style={{
                filter: filter ? "blur(10px)" : "none",
              }}
              animate={{
                filter: filter ? "blur(0px)" : "none",
              }}
              transition={{
                duration: duration,
                delay: idx * 0.1,
              }}
            >
              {word}{" "}
            </motion.span>
          );
        })}
      </motion.div>
    );
  };

  return (
    <div className={cn("font-bold", className)}>
      <div className="mt-4">
        <div className="text-black leading-snug tracking-wide">
          {renderWords()}
        </div>
      </div>
    </div>
  );
};
