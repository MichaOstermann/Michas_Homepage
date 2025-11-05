
'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface AudioVisualizerProps {
  isPlaying: boolean;
}

export function AudioVisualizer({ isPlaying }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const barCount = 32; // Reduced for performance
    const barWidth = canvas.width / barCount;

    const animate = () => {
      if (!isPlaying) return;

      time += 0.1;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgb(6, 255, 240)');
      gradient.addColorStop(0.5, 'rgb(255, 0, 110)');
      gradient.addColorStop(1, 'rgb(6, 255, 240)');
      
      // Draw bars
      for (let i = 0; i < barCount; i++) {
        const barHeight = Math.sin(time + i * 0.2) * 50 + Math.sin(time * 2 + i * 0.1) * 30 + 60;
        const x = i * barWidth;
        const y = canvas.height - barHeight;
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth - 2, barHeight);
        
        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgb(6, 255, 240)';
        ctx.fillRect(x, y, barWidth - 2, barHeight);
        ctx.shadowBlur = 0;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    if (isPlaying) {
      animate();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full h-24 glass-morphism rounded-lg overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        width={800}
        height={96}
        className="w-full h-full"
        style={{ filter: 'blur(0.5px)' }}
      />
    </motion.div>
  );
}
