
'use client';

import { useEffect, useRef } from 'react';

interface Alien {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  phase: number;
  speed: number;
}

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

    // Create multiple aliens with different positions and animations
    const aliens: Alien[] = [
      { x: 0.3, y: 0.3, rotation: 0, scale: 1, phase: 0, speed: 0.02 },
      { x: 0.7, y: 0.5, rotation: 0, scale: 0.8, phase: Math.PI, speed: 0.015 },
      { x: 0.5, y: 0.7, rotation: 0, scale: 1.2, phase: Math.PI / 2, speed: 0.025 },
    ];

    // Draw a detailed alien with neon glow
    const drawAlien = (alien: Alien) => {
      const centerX = canvas.offsetWidth * alien.x;
      const centerY = canvas.offsetHeight * alien.y;
      const scale = alien.scale * (Math.sin(time * 0.5 + alien.phase) * 0.15 + 1);
      const glowIntensity = Math.sin(time + alien.phase) * 0.3 + 0.7;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(alien.rotation);
      ctx.scale(scale, scale);

      // Neon glow effect
      ctx.shadowBlur = 20;
      ctx.shadowColor = `rgba(6, 255, 240, ${glowIntensity})`;

      // Head outline (large alien head)
      ctx.beginPath();
      ctx.ellipse(0, -15, 50, 65, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(6, 255, 240, ${glowIntensity})`;
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Inner head glow
      ctx.beginPath();
      ctx.ellipse(0, -15, 40, 55, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(6, 255, 240, ${glowIntensity * 0.5})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Large alien eyes (filled with glow)
      ctx.shadowColor = `rgba(255, 0, 110, ${glowIntensity})`;
      ctx.fillStyle = `rgba(255, 0, 110, ${glowIntensity * 0.3})`;
      
      ctx.beginPath();
      ctx.ellipse(-20, -25, 18, 25, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(255, 0, 110, ${glowIntensity})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.ellipse(20, -25, 18, 25, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Eye pupils (animated)
      const pupilOffset = Math.sin(time * 2 + alien.phase) * 3;
      ctx.shadowBlur = 15;
      ctx.fillStyle = `rgba(0, 0, 0, 0.8)`;
      ctx.beginPath();
      ctx.ellipse(-20 + pupilOffset, -25, 8, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(20 + pupilOffset, -25, 8, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eye highlights
      ctx.shadowBlur = 10;
      ctx.fillStyle = `rgba(6, 255, 240, ${glowIntensity})`;
      ctx.beginPath();
      ctx.arc(-23 + pupilOffset, -30, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(17 + pupilOffset, -30, 4, 0, Math.PI * 2);
      ctx.fill();

      // Small nose
      ctx.shadowColor = `rgba(6, 255, 240, ${glowIntensity})`;
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.lineTo(-4, 3);
      ctx.lineTo(4, 3);
      ctx.closePath();
      ctx.strokeStyle = `rgba(6, 255, 240, ${glowIntensity * 0.6})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Mouth line
      ctx.beginPath();
      ctx.moveTo(-15, 15);
      ctx.quadraticCurveTo(0, 10, 15, 15);
      ctx.strokeStyle = `rgba(6, 255, 240, ${glowIntensity * 0.5})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Neck
      ctx.beginPath();
      ctx.moveTo(-18, 50);
      ctx.lineTo(-10, 80);
      ctx.lineTo(10, 80);
      ctx.lineTo(18, 50);
      ctx.strokeStyle = `rgba(6, 255, 240, ${glowIntensity * 0.7})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Antennas
      ctx.beginPath();
      ctx.moveTo(-25, -70);
      ctx.lineTo(-30, -90);
      ctx.moveTo(25, -70);
      ctx.lineTo(30, -90);
      ctx.strokeStyle = `rgba(255, 0, 110, ${glowIntensity})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Antenna tips (glowing)
      ctx.shadowBlur = 20;
      ctx.fillStyle = `rgba(255, 0, 110, ${glowIntensity})`;
      ctx.beginPath();
      ctx.arc(-30, -90, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(30, -90, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const animate = () => {
      time += 0.01;
      
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      
      // Update and draw each alien
      aliens.forEach(alien => {
        alien.rotation += alien.speed;
        drawAlien(alien);
      });
      
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
      className="w-full h-full opacity-70"
      style={{ filter: 'blur(0.5px)' }}
    />
  );
}
