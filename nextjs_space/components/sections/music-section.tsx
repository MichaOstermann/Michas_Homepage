
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Music, Play, Pause, Download, Filter, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { AudioPlayer } from '@/components/ui/audio-player';
import { AudioVisualizer } from '@/components/ui/audio-visualizer';

// Mock data basierend auf der technischen Analyse
const tracks = [
  {
    id: 1,
    title: 'Life am Strand',
    duration: '4:28',
    category: 'PARTY',
    isNew: true,
    coverImage: '/api/placeholder/400/400',
    audioUrl: '/audio/life-am-strand.mp3', // Placeholder
    description: 'Party-Track mit Ballermann-Vibes',
  },
  {
    id: 2,
    title: '20 Jahre RDMC Oldenburg',
    duration: '5:43',
    category: 'PARTY',
    isNew: false,
    coverImage: '/api/placeholder/400/400',
    audioUrl: '/audio/rdmc-oldenburg.mp3', // Placeholder
    description: 'Mallorca-inspirierter Party-Hit',
  },
  {
    id: 3,
    title: 'Aus dem Schatten',
    duration: '2:18',
    category: 'SYNTH',
    isNew: true,
    coverImage: '/api/placeholder/400/400',
    audioUrl: '/audio/aus-dem-schatten.mp3', // Placeholder
    description: 'Atmosphärischer Synthwave-Track',
  },
];

const categories = [
  { id: 'ALL', label: 'Alle', count: tracks.length },
  { id: 'SYNTH', label: 'Synth', count: tracks.filter(t => t.category === 'SYNTH').length },
  { id: 'LOFI', label: 'Lo-Fi', count: 0 },
  { id: 'AMBIENT', label: 'Ambient', count: 0 },
  { id: 'PARTY', label: 'Party', count: tracks.filter(t => t.category === 'PARTY').length },
];

export function MusicSection() {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [currentTrack, setCurrentTrack] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const filteredTracks = selectedCategory === 'ALL' 
    ? tracks 
    : tracks.filter(track => track.category === selectedCategory);

  const handlePlayPause = (trackId: number) => {
    if (currentTrack === trackId) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(trackId);
      setIsPlaying(true);
    }
  };

  return (
    <section id="music" className="py-20 px-4 sm:px-6 lg:px-8">
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
            <Music className="w-8 h-8 text-primary mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Music
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Von entspannten Synthwave-Tracks bis hin zu energiegeladenen Party-Hits – 
            hier findest du meine neuesten Produktionen.
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

        {/* Audio Visualizer */}
        {currentTrack && isPlaying && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <AudioVisualizer isPlaying={isPlaying} />
          </motion.div>
        )}

        {/* Tracks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTracks.map((track, index) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <Card className="glass-morphism hover:cyber-glow transition-all duration-300 overflow-hidden">
                {/* Cover Image */}
                <div className="relative aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 p-8">
                  {track.isNew && (
                    <Badge className="absolute top-4 right-4 bg-secondary text-secondary-foreground">
                      Neu
                    </Badge>
                  )}
                  <div className="flex items-center justify-center h-full">
                    <Volume2 className="w-20 h-20 text-primary/50" />
                  </div>
                </div>

                {/* Track Info */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {track.title}
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      {track.duration}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {track.description}
                  </p>
                  <Badge variant="outline" className="mb-4">
                    {track.category}
                  </Badge>

                  {/* Controls */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handlePlayPause(track.id)}
                      className={`${
                        currentTrack === track.id && isPlaying
                          ? 'cyber-glow-secondary'
                          : 'cyber-glow hover:cyber-glow-secondary'
                      } transition-all duration-300`}
                    >
                      {currentTrack === track.id && isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="glass-morphism hover:bg-accent/50"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Current Track Player */}
        {currentTrack && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 left-4 right-4 z-40 max-w-sm mx-auto"
          >
            <AudioPlayer
              track={tracks.find(t => t.id === currentTrack)}
              isPlaying={isPlaying}
              onPlayPause={() => setIsPlaying(!isPlaying)}
              onClose={() => {
                setCurrentTrack(null);
                setIsPlaying(false);
              }}
            />
          </motion.div>
        )}
      </div>
    </section>
  );
}
