
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { BookOpen, Calendar, User, Filter, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data - in real app this would come from CMS
const blogPosts = [
  {
    id: 1,
    title: 'Neues PowerShell Module für MailStore',
    slug: 'neues-powershell-module-mailstore',
    excerpt: 'Ein neues PowerShell-Modul macht die Verwaltung von MailStore-Servern noch einfacher.',
    category: 'DEV',
    author: 'Michael',
    publishDate: '2024-11-01',
    featuredImageUrl: '/api/placeholder/400/200',
    tags: ['PowerShell', 'MailStore', 'Automation'],
    published: true,
  },
  {
    id: 2,
    title: 'Synthwave Producer Setup 2024',
    slug: 'synthwave-producer-setup-2024',
    excerpt: 'Mein komplettes Setup für Synthwave-Produktion: Hardware, Software und Workflow.',
    category: 'MUSIK',
    author: 'Michael',
    publishDate: '2024-10-28',
    featuredImageUrl: '/api/placeholder/400/200',
    tags: ['Synthwave', 'Music Production', 'Studio'],
    published: true,
  },
  {
    id: 3,
    title: 'Top 5 Cyberpunk Games 2024',
    slug: 'top-5-cyberpunk-games-2024',
    excerpt: 'Die besten Cyberpunk-Spiele des Jahres im Review - von Indie bis AAA.',
    category: 'NEWS',
    author: 'Michael',
    publishDate: '2024-10-15',
    featuredImageUrl: '/api/placeholder/400/200',
    tags: ['Gaming', 'Cyberpunk', 'Review'],
    published: true,
  },
];

const categories = [
  { id: 'ALL', label: 'Alle', count: blogPosts.length },
  { id: 'NEWS', label: 'News', count: blogPosts.filter(p => p.category === 'NEWS').length },
  { id: 'MUSIK', label: 'Musik', count: blogPosts.filter(p => p.category === 'MUSIK').length },
  { id: 'DEV', label: 'Dev', count: blogPosts.filter(p => p.category === 'DEV').length },
];

export function BlogSection() {
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const filteredPosts = selectedCategory === 'ALL' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'NEWS':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'MUSIK':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'DEV':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-primary/20 text-primary border-primary/30';
    }
  };

  return (
    <section id="blog" className="py-20 px-4 sm:px-6 lg:px-8 bg-accent/5">
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
            <BookOpen className="w-8 h-8 text-primary mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Blog & Updates
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Neueste Updates, Tutorials und Gedanken zu Musik, Code und Gaming. 
            Bleib auf dem Laufenden mit meinen aktuellen Projekten.
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

        {/* Blog Posts */}
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <Card className="glass-morphism hover:cyber-glow transition-all duration-300 overflow-hidden h-full">
                  {/* Featured Image */}
                  <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-secondary/20">
                    <div className="flex items-center justify-center h-full">
                      <BookOpen className="w-12 h-12 text-primary/50" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    {/* Meta */}
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={getCategoryColor(post.category)}>
                        {post.category}
                      </Badge>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(post.publishDate)}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-sm text-muted-foreground mb-4 flex-1">
                      {post.excerpt}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Author & Read More */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <User className="w-3 h-3 mr-1" />
                        {post.author}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="group/btn hover:text-primary"
                        onClick={() => {
                          // In a real app, this would navigate to /blog/[slug]
                          alert(`Blog-Post "${post.title}" würde hier geöffnet werden. In der finalen Version würde dies zu einer Detailseite führen.`);
                        }}
                      >
                        Lesen
                        <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.article>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Card className="glass-morphism p-12">
              <BookOpen className="w-16 h-16 text-primary/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Bald verfügbar
              </h3>
              <p className="text-muted-foreground">
                Neue Blog-Artikel sind in Arbeit und werden bald veröffentlicht.
              </p>
            </Card>
          </motion.div>
        )}
      </div>
    </section>
  );
}
