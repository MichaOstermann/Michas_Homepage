
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Gamepad2, Play, Filter, ExternalLink, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { YouTubeEmbed } from '@/components/ui/youtube-embed';

// Mock data basierend auf der technischen Analyse
const gamingContent = [
  {
    id: 1,
    title: 'Boss Guide: Neon Titan',
    description: 'Umfassender Guide zum schwierigsten Boss in Cyber Drift. Strategien, Timing und optimale Builds für einen erfolgreichen Kampf.',
    type: 'GUIDE',
    content: `Der Neon Titan ist der Endboss der ersten Cyber Drift Kampagne. Mit diesen Strategien besiegst du ihn garantiert:

**Phase 1: Laser-Angriffe**
- Bleib in Bewegung und nutze die Cover-Punkte
- Timing ist entscheidend - warte auf die 2-Sekunden-Pause zwischen den Angriffen
- Empfohlene Waffen: Plasma Rifle oder Neon Blaster

**Phase 2: Shield Mode**
- Wechsle zu EMP-Granaten um das Schild zu durchbrechen
- Konzentriere Feuer auf die schwachen Punkte (rot markiert)
- Nutze den Dash-Move um den Bodenangriffen auszuweichen

**Phase 3: Berserker-Modus**
- Maximaler DPS ist gefragt
- Nutze alle verfügbaren Power-Ups
- Halte Abstand und nutze Hit-and-Run Taktiken`,
    thumbnailUrl: '/api/placeholder/400/225',
    publishDate: '2024-10-20',
  },
  {
    id: 2,
    title: 'Review: Cyber Drift',
    description: 'Ausführliche Review des neuesten Cyberpunk-Racing-Games. Gameplay, Grafik, Sound und Langzeitmotivation im Test.',
    type: 'REVIEW',
    content: `**Cyber Drift** ist ein visuell beeindruckendes Racing-Game mit Cyberpunk-Ästhetik.

**Grafik: 9/10**
- Atemberaubende Neon-Beleuchtung
- Flüssige 60 FPS auch bei maximalen Einstellungen
- Detailreiche Fahrzeuge und Strecken

**Gameplay: 8/10**
- Präzise Steuerung mit Controller und Tastatur
- Verschiedene Fahrmodi (Arcade, Simulation)
- Umfangreiche Anpassungsoptionen für Fahrzeuge

**Sound: 10/10**
- Fantastischer Synthwave-Soundtrack
- Realistische Motor- und Umgebungsgeräusche
- Dolby Atmos Support

**Fazit: 8.5/10**
Ein Must-Have für Fans von Cyberpunk und Racing-Games. Kleine Abzüge für repetitive Mission-Struktur, aber insgesamt sehr empfehlenswert.`,
    thumbnailUrl: '/api/placeholder/400/225',
    publishDate: '2024-10-15',
  },
  {
    id: 3,
    title: 'Clip: Perfect Run',
    description: 'Mein persönlicher Rekord-Run durch die schwierigste Strecke in Cyber Drift. Fehlerlose Fahrt mit maximaler Geschwindigkeit.',
    type: 'CLIP',
    videoUrl: 'dQw4w9WgXcQ', // Placeholder YouTube ID
    thumbnailUrl: '/api/placeholder/400/225',
    publishDate: '2024-11-01',
    content: 'Ein perfekter Lauf durch die "Neon Highway" Strecke. Nach wochenlangem Training endlich geschafft - 3:42 Minuten ohne einen einzigen Fehler!',
  },
];

const categories = [
  { id: 'ALL', label: 'Alle', count: gamingContent.length },
  { id: 'GUIDE', label: 'Guides', count: gamingContent.filter(c => c.type === 'GUIDE').length },
  { id: 'REVIEW', label: 'Reviews', count: gamingContent.filter(c => c.type === 'REVIEW').length },
  { id: 'CLIP', label: 'Clips', count: gamingContent.filter(c => c.type === 'CLIP').length },
];

export function GamingSection() {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [expandedContent, setExpandedContent] = useState<number | null>(null);

  const filteredContent = selectedCategory === 'ALL' 
    ? gamingContent 
    : gamingContent.filter(content => content.type === selectedCategory);

  const toggleContent = (id: number) => {
    setExpandedContent(expandedContent === id ? null : id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <section id="gaming" className="py-20 px-4 sm:px-6 lg:px-8">
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
            <Gamepad2 className="w-8 h-8 text-primary mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Gaming
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Gaming-Guides, Reviews und Highlight-Clips. Von Strategien bis zu Gameplay-Videos – 
            alles rund um meine Gaming-Leidenschaft.
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              className={`${
                selectedCategory === category.id
                  ? 'cyber-glow'
                  : 'glass-morphism hover:bg-accent/50'
              } transition-all duration-300`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <Filter className="w-4 h-4 mr-2" />
              {category.label}
              {category.count > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {category.count}
                </Badge>
              )}
            </Button>
          ))}
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredContent.map((content, index) => (
            <motion.div
              key={content.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <Card className="glass-morphism hover:cyber-glow transition-all duration-300 overflow-hidden h-full">
                {/* Thumbnail/Video */}
                <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-secondary/20">
                  {content.videoUrl ? (
                    <YouTubeEmbed videoId={content.videoUrl} />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Gamepad2 className="w-16 h-16 text-primary/50" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <Badge 
                      variant={content.type === 'CLIP' ? 'default' : 'outline'}
                      className={content.type === 'CLIP' ? 'bg-red-500/20 text-red-400 border-red-500/30' : ''}
                    >
                      {content.type === 'CLIP' && <Play className="w-3 h-3 mr-1" />}
                      {content.type}
                    </Badge>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(content.publishDate)}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {content.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {content.description}
                  </p>

                  {/* Content Preview/Full */}
                  {content.type !== 'CLIP' && (
                    <div className="mb-4">
                      <div className={`text-sm text-muted-foreground whitespace-pre-line ${
                        expandedContent === content.id ? '' : 'line-clamp-3'
                      }`}>
                        {content.content}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleContent(content.id)}
                        className="mt-2 p-0 h-auto text-primary hover:text-primary/80"
                      >
                        {expandedContent === content.id ? 'Weniger anzeigen' : 'Mehr lesen'}
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {content.videoUrl && (
                      <Button
                        size="sm"
                        className="cyber-glow hover:cyber-glow-secondary transition-all duration-300"
                        onClick={() => window.open(`https://youtube.com/watch?v=${content.videoUrl}`, '_blank')}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Video ansehen
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
