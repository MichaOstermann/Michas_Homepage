
'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Music, Zap, Gamepad2, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { Canvas3D } from '@/components/ui/canvas-3d';

export function HeroSection() {
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

    // Animation variables
    let animationId: number;
    let time = 0;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
    }> = [];

    // Create particles (reduced for performance)
    for (let i = 0; i < 20; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        life: Math.random(),
      });
    }

    const animate = () => {
      time += 0.01;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      gradient.addColorStop(0, 'rgba(6, 255, 240, 0.03)');
      gradient.addColorStop(0.5, 'rgba(255, 0, 110, 0.02)');
      gradient.addColorStop(1, 'rgba(6, 255, 240, 0.03)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      
      // Animate particles
      particles.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life += 0.001;
        
        // Wrap around edges
        if (particle.x < 0 || particle.x > canvas.offsetWidth) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.offsetHeight) particle.vy *= -1;
        
        // Draw particle
        const alpha = Math.sin(particle.life) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6, 255, 240, ${alpha * 0.6})`;
        ctx.fill();
        
        // Draw connections (simplified for performance)
        if (index % 2 === 0) { // Only connect every second particle
          particles.slice(index + 1, index + 3).forEach((otherParticle) => {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 80) {
              const alpha = (1 - distance / 80) * 0.2;
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(otherParticle.x, otherParticle.y);
              ctx.strokeStyle = `rgba(6, 255, 240, ${alpha})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          });
        }
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

  const scrollToSection = (sectionId: string) => {
    const section = document.querySelector(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ filter: 'blur(0.5px)' }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          {/* Info Badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Badge variant="outline" className="glass-morphism border-primary/50 text-primary">
              <Music className="w-4 h-4 mr-2" />
              3 Fresh Tracks
            </Badge>
            <Badge variant="outline" className="glass-morphism border-primary/50 text-primary">
              <Zap className="w-4 h-4 mr-2" />
              12+ Scripts
            </Badge>
            <Badge variant="outline" className="glass-morphism border-primary/50 text-primary">
              <Gamepad2 className="w-4 h-4 mr-2" />
              Gaming Content
            </Badge>
            <Badge variant="outline" className="glass-morphism border-primary/50 text-primary">
              <BookOpen className="w-4 h-4 mr-2" />
              Blog Updates
            </Badge>
          </div>

          {/* Main Title */}
          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary animate-glow"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            Musik, Code & Games
            <br />
            <span className="text-2xl md:text-4xl lg:text-5xl text-muted-foreground">
              – vereint.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
          >
            PowerShell by day. Synthwave by night. Gaming always.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
          >
            <Button
              size="lg"
              className="cyber-glow hover:cyber-glow-secondary transition-all duration-300"
              onClick={() => scrollToSection('#music')}
            >
              <Music className="w-5 h-5 mr-2" />
              Tracks anhören
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="glass-morphism hover:bg-accent/50"
              onClick={() => scrollToSection('#powershell')}
            >
              <Zap className="w-5 h-5 mr-2" />
              Scripts downloaden
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="glass-morphism hover:bg-accent/50"
              onClick={() => scrollToSection('#gaming')}
            >
              <Gamepad2 className="w-5 h-5 mr-2" />
              Gaming Highlights
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.2, repeat: Infinity, repeatType: 'reverse' }}
      >
        <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-bounce" />
        </div>
      </motion.div>
    </section>
  );
}
