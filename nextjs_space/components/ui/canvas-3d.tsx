
'use client';

import { useEffect, useRef } from 'react';

export function Canvas3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let animationId: number;
    let time = 0;

    // 3D Wireframe Alien Head (simplified)
    const drawAlien = () => {
      const centerX = canvas.offsetWidth / 2;
      const centerY = canvas.offsetHeight / 2;
      const scale = Math.sin(time * 0.5) * 0.1 + 1;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(scale, scale);

      // Head outline
      ctx.beginPath();
      ctx.ellipse(0, -20, 60, 80, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(6, 255, 240, ${0.6 + Math.sin(time) * 0.3})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Eyes
      ctx.beginPath();
      ctx.ellipse(-25, -30, 15, 20, 0, 0, Math.PI * 2);
      ctx.ellipse(25, -30, 15, 20, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 0, 110, ${0.6 + Math.sin(time + 1) * 0.3})`;
      ctx.stroke();

      // Nose area
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(-5, 0);
      ctx.lineTo(5, 0);
      ctx.closePath();
      ctx.strokeStyle = `rgba(6, 255, 240, ${0.4 + Math.sin(time + 0.5) * 0.2})`;
      ctx.stroke();

      // Neck
      ctx.beginPath();
      ctx.moveTo(-20, 60);
      ctx.lineTo(-10, 100);
      ctx.lineTo(10, 100);
      ctx.lineTo(20, 60);
      ctx.stroke();

      ctx.restore();
    };

    const animate = () => {
      time += 0.01; // Slower animation for better performance
      
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      
      // Draw animated alien (throttle to 30fps)
      if (Date.now() % 2 === 0) {
        drawAlien();
      }
      
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full opacity-20"
      style={{ filter: 'blur(1px)' }}
    />
  );
}
