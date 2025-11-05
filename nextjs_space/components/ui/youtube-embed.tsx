
'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
  autoPlay?: boolean;
}

export function YouTubeEmbed({ videoId, title, autoPlay = false }: YouTubeEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(autoPlay);
  const [hasError, setHasError] = useState(false);

  const thumbnailUrl = `https://i.ytimg.com/vi/JtYrWqcAxuk/maxresdefault.jpg`;
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg">
        <div className="text-center">
          <Play className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Video nicht verfügbar
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="relative w-full h-full group cursor-pointer" onClick={handleLoad}>
        {/* Thumbnail */}
        <img
          src={thumbnailUrl}
          alt={title || 'YouTube Video Thumbnail'}
          className="w-full h-full object-cover rounded-lg"
          onError={handleError}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-200 rounded-lg flex items-center justify-center">
          <Button
            size="lg"
            className="cyber-glow hover:cyber-glow-secondary transition-all duration-300"
          >
            <Play className="w-6 h-6 mr-2" fill="currentColor" />
            Video abspielen
          </Button>
        </div>
        
        {/* YouTube Logo */}
        <div className="absolute bottom-4 right-4 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
          YouTube
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <iframe
        src={embedUrl}
        title={title || 'YouTube Video'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full rounded-lg"
        onError={handleError}
      />
    </div>
  );
}
