
'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User, Github, Youtube, Twitch, ExternalLink } from 'lucide-react';
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

  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-primary mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Über mich
            </h2>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Avatar/Animation */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1"
          >
            <Card className="glass-morphism p-8 aspect-square flex items-center justify-center">
              <div className="w-full h-full relative">
                <Canvas3D />
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary opacity-20 animate-pulse-slow" />
                </motion.div>
              </div>
            </Card>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2"
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Hey, ich bin Michael! 👋
                </h3>
                <div className="prose prose-invert max-w-none">
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    Willkommen in meiner digitalen Welt, wo <span className="text-primary">Code</span>, 
                    <span className="text-secondary"> Beats</span> und <span className="text-primary">Gaming</span> aufeinandertreffen!
                  </p>
                  
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    Als leidenschaftlicher <strong>PowerShell-Entwickler</strong> bringe ich täglich Ordnung 
                    in komplexe IT-Systeme. Wenn die Sonne untergeht, verwandle ich mich in einen 
                    <strong className="text-primary"> Synthwave-Produzent</strong> und erschaffe atmosphärische 
                    Klangwelten. Und zwischendurch? Da findest du mich beim Gaming, wo ich neue Welten erkunde 
                    und epische Momente festhalte.
                  </p>

                  <p className="text-muted-foreground leading-relaxed">
                    Diese Website ist mein digitales Zuhause – ein Ort, wo ich meine Projekte, 
                    Erfahrungen und Leidenschaften teile. Tauche ein und entdecke, was mich antreibt!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <h3 className="text-xl font-semibold text-foreground mb-8 text-center">
            Folge mir auf
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
                  whileHover={{ y: -5 }}
                >
                  <Card className="glass-morphism hover:cyber-glow transition-all duration-300 p-6 h-full">
                    <Button
                      variant="ghost"
                      className="w-full h-full flex flex-col items-center gap-4 py-6"
                      asChild
                    >
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Visit my ${link.name} profile`}
                      >
                        <Icon className="w-12 h-12 text-primary" />
                        <div className="text-center">
                          <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2">
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

        {/* Fun Stats */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Scripts', value: '12+', icon: '⚡' },
              { label: 'Tracks', value: '3', icon: '🎵' },
              { label: 'Gaming Hours', value: '∞', icon: '🎮' },
              { label: 'Coffee Cups', value: '999+', icon: '☕' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="glass-morphism p-6 text-center">
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold text-primary mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
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
