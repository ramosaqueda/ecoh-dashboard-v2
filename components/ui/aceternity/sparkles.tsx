"use client";
import { useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SparklesCoreProps {
  id?: string;
  className?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  particleColor?: string;
}

export const SparklesCore = (props: SparklesCoreProps) => {
  const {
    id,
    className,
    background = "transparent",
    minSize = 0.4,
    maxSize = 1,
    particleDensity = 120,
    particleColor = "#FFF",
  } = props;

  const [init, setInit] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const circles = useRef<any[]>([]);
  const animationFrame = useRef<number>();
  const mouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const generateId = useId();
  const uniqueId = id ?? generateId;

  useEffect(() => {
    if (init) return;

    const canvas = canvasRef.current;
    const container = canvasContainerRef.current;
    if (!canvas || !container) return;

    context.current = canvas.getContext("2d");
    if (!context.current) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    const initializeCanvas = () => {
      resizeCanvas();
      const canvas = canvasRef.current;
      if (!canvas) return;

      circles.current = [];
      for (let i = 0; i < particleDensity; i++) {
        const circle = {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          translateX: 0,
          translateY: 0,
          size: Math.random() * (maxSize - minSize) + minSize,
          alpha: 0,
          targetAlpha: parseFloat((Math.random() * 0.6 + 0.1).toFixed(1)),
          dx: (Math.random() - 0.5) * 0.3,
          dy: (Math.random() - 0.5) * 0.3,
          magnetism: 0.1 + Math.random() * 4,
        };
        circles.current.push(circle);
      }
    };

    const drawCircle = (circle: any, update = false) => {
      if (!context.current) return;
      const { x, y, translateX, translateY, size, alpha } = circle;
      context.current.translate(translateX, translateY);
      context.current.beginPath();
      context.current.arc(x, y, size, 0, 2 * Math.PI);
      context.current.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      context.current.fill();
      context.current.setTransform(1, 0, 0, 1, 0, 0);

      if (!update) return;

      circle.alpha += (circle.targetAlpha - circle.alpha) * 0.02;
      circle.x += circle.dx;
      circle.y += circle.dy;
      circle.translateX += ((mouse.current.x / (canvas?.width || 1)) * 1000 - circle.translateX) * circle.magnetism;
      circle.translateY += ((mouse.current.y / (canvas?.height || 1)) * 1000 - circle.translateY) * circle.magnetism;

      if (circle.x < -circle.size) circle.x = (canvas?.width || 0) + circle.size;
      if (circle.x > (canvas?.width || 0) + circle.size) circle.x = -circle.size;
      if (circle.y < -circle.size) circle.y = (canvas?.height || 0) + circle.size;
      if (circle.y > (canvas?.height || 0) + circle.size) circle.y = -circle.size;
    };

    const clearContext = () => {
      if (!context.current || !canvas) return;
      context.current.clearRect(0, 0, canvas.width, canvas.height);
    };

    const drawParticles = () => {
      clearContext();
      circles.current.forEach((circle) => drawCircle(circle, true));
      animationFrame.current = requestAnimationFrame(drawParticles);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
    };

    initializeCanvas();
    drawParticles();
    canvas.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", initializeCanvas);

    setInit(true);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      canvas.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", initializeCanvas);
    };
  }, [init, maxSize, minSize, particleDensity]);

  return (
    <div
      ref={canvasContainerRef}
      className={cn("h-full w-full", className)}
      style={{
        background,
      }}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
};
