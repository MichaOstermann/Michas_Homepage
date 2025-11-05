
'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User, Github, Youtube, Twitch, ExternalLink, Code2, Music, Gamepad2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Canvas3D } from '@/components/ui/canvas-3d';

export function AboutSection() {
  const socialLinks = [
    {
      name: 'GitHub',
      icon: Github,
      href: 'https://github.com',
      description: 'Meine Code-Repositories und Open Source Projekte',
    },
    {
      name: 'YouTube',
      icon: Youtube,
      href: 'https://youtube.com',
      description: 'Gaming-Videos und Tech-Tutorials',
    },
    {
      name: 'Twitch',
      icon: Twitch,
      href: 'https://twitch.tv',
      description: 'Live-Streams und Gaming-Sessions',
    },
  ];

  const skills = [
    {
      category: 'Code',
      icon: Code2,
      color: 'text-cyan-400',
      items: ['PowerShell', 'TypeScript', 'Python', 'Automation'],
      level: 95,
    },
    {
      category: 'Music',
      icon: Music,
      color: 'text-purple-400',
      items: ['Synthwave', 'Lo-Fi', 'Ambient', 'Production'],
      level: 85,
    },
    {
      category: 'Gaming',
      icon: Gamepad2,
      color: 'text-pink-400',
      items: ['Strategy', 'RPG', 'Streaming', 'Content'],
      level: 90,
    },
  ];

  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header with Neon Effect */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div 
            className="flex items-center justify-center mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <User className="w-8 h-8 text-primary mr-3 animate-pulse" />
            <h2 className="text-4xl md:text-5xl font-bold text-foreground neon-text">
              Über mich
            </h2>
          </motion.div>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-1 w-32 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Avatar/Animation mit coolerem Design */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="glass-morphism p-8 aspect-square flex items-center justify-center relative overflow-hidden group">
                {/* Rotating border effect */}
                <motion.div
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: 'conic-gradient(from 0deg, transparent, rgba(6, 255, 240, 0.3), transparent)',
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
                
                <div className="w-full h-full relative z-10">
                  <Canvas3D />
                  
                  {/* Pulsing rings */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.1, 0.3]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <div className="w-64 h-64 rounded-full border-2 border-primary" />
                  </motion.div>
                  
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{ 
                      scale: [1.2, 1, 1.2],
                      opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  >
                    <div className="w-48 h-48 rounded-full border-2 border-secondary" />
                  </motion.div>
                </div>

                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-primary opacity-50 rounded-tl-lg" />
                <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-secondary opacity-50 rounded-br-lg" />
              </Card>
            </motion.div>
          </motion.div>

          {/* Content mit mehr Energie */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2"
          >
            <div className="space-y-8">
              <div>
                <motion.h3 
                  className="text-3xl md:text-4xl font-bold text-foreground mb-6 flex items-center gap-3"
                  whileHover={{ x: 10 }}
                >
                  Hey, ich bin Michael! 
                  <motion.span
                    animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    👋
                  </motion.span>
                </motion.h3>
                
                <div className="space-y-4">
                  <motion.p 
                    className="text-lg text-muted-foreground leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Willkommen in meiner <span className="text-primary font-semibold neon-text">digitalen Galaxie</span>, 
                    wo <span className="text-cyan-400 font-bold">Code</span>, 
                    <span className="text-purple-400 font-bold"> Beats</span> und 
                    <span className="text-pink-400 font-bold"> Gaming</span> in epischer Harmonie verschmelzen! 🚀
                  </motion.p>
                  
                  <motion.div
                    className="glass-morphism p-6 rounded-lg border-l-4 border-primary"
                    whileHover={{ x: 10, borderColor: 'rgba(255, 0, 110, 1)' }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-muted-foreground leading-relaxed">
                      <Zap className="w-5 h-5 inline text-primary mr-2" />
                      Als <strong className="text-primary">PowerShell-Wizard</strong> 🧙‍♂️ bringe ich Chaos in Ordnung. 
                      Nachts mutiere ich zum <strong className="text-purple-400">Synthwave-Produzenten</strong> 🎹 
                      und erschaffe epische Soundscapes. Zwischendurch? <strong className="text-pink-400">Gaming-Marathon</strong> 🎮 
                      mit legendären Momenten!
                    </p>
                  </motion.div>

                  <motion.p 
                    className="text-lg text-muted-foreground leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    Diese Website ist mein <span className="text-secondary font-semibold">digitales Command Center</span> – 
                    Projekte, Experimente und pure Leidenschaft in Reinform. Bereit für die Tour? 🔥
                  </motion.p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Skills mit animierten Progress Bars */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h3 className="text-2xl font-bold text-center text-foreground mb-10">
            <span className="neon-text">Meine Superpowers</span> ⚡
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {skills.map((skill, index) => {
              const Icon = skill.icon;
              return (
                <motion.div
                  key={skill.category}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10, scale: 1.02 }}
                >
                  <Card className="glass-morphism p-6 h-full hover:cyber-glow transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <Icon className={`w-8 h-8 ${skill.color}`} />
                      <h4 className="text-xl font-bold text-foreground">{skill.category}</h4>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {skill.items.map((item) => (
                        <div key={item} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {item}
                        </div>
                      ))}
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        <span>Skill Level</span>
                        <span>{skill.level}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${
                            skill.category === 'Code' ? 'from-cyan-400 to-blue-500' :
                            skill.category === 'Music' ? 'from-purple-400 to-pink-500' :
                            'from-pink-400 to-red-500'
                          }`}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.level}%` }}
                          transition={{ duration: 1.5, delay: index * 0.2 }}
                          viewport={{ once: true }}
                        />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Social Links mit mehr Style */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-foreground mb-10 text-center">
            <span className="neon-text">Connect with me</span> 🌐
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {socialLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8, scale: 1.03 }}
                >
                  <Card className="glass-morphism hover:cyber-glow transition-all duration-300 p-8 h-full relative overflow-hidden group">
                    {/* Hover effect background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <Button
                      variant="ghost"
                      className="w-full h-full flex flex-col items-center gap-4 py-6 relative z-10"
                      asChild
                    >
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Visit my ${link.name} profile`}
                      >
                        <motion.div
                          whileHover={{ rotate: 360, scale: 1.2 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Icon className="w-14 h-14 text-primary" />
                        </motion.div>
                        <div className="text-center">
                          <h4 className="font-bold text-lg text-foreground mb-2 flex items-center gap-2 justify-center">
                            {link.name}
                            <ExternalLink className="w-4 h-4" />
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {link.description}
                          </p>
                        </div>
                      </a>
                    </Button>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Fun Stats mit Animationen */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Scripts', value: '12+', icon: '⚡', color: 'from-cyan-400 to-blue-500' },
              { label: 'Tracks', value: '3', icon: '🎵', color: 'from-purple-400 to-pink-500' },
              { label: 'Gaming Hours', value: '∞', icon: '🎮', color: 'from-pink-400 to-red-500' },
              { label: 'Coffee Cups', value: '999+', icon: '☕', color: 'from-yellow-400 to-orange-500' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 200
                }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.1, 
                  rotate: [0, -5, 5, -5, 0],
                  transition: { duration: 0.5 }
                }}
              >
                <Card className="glass-morphism p-8 text-center relative overflow-hidden group hover:cyber-glow transition-all duration-300">
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                  />
                  <motion.div 
                    className="text-4xl mb-3 relative z-10"
                    animate={{ 
                      scale: [1, 1.2, 1],
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      delay: index * 0.3
                    }}
                  >
                    {stat.icon}
                  </motion.div>
                  <div className="text-3xl font-bold text-primary mb-2 relative z-10 neon-text">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground relative z-10 font-semibold">
                    {stat.label}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
