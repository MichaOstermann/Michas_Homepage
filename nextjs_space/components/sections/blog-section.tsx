
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { BookOpen, Calendar, User, Filter, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  createdAt: string;
}

export function BlogSection() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('ALL');

  useEffect(() => {
    async function fetchBlogPosts() {
      try {
        const response = await fetch('/api/cms/pages?sectionSlug=blog');
        const data = await response.json();
        setBlogPosts(data || []);
      } catch (error) {
        console.error('Failed to fetch blog posts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBlogPosts();
  }, []);

  // Extract all unique tags from all posts
  const allTags = Array.from(
    new Set(blogPosts.flatMap(post => post.tags || []))
  ).sort();

  const tags = [
    { id: 'ALL', label: 'Alle', count: blogPosts.length },
    ...allTags.map(tag => ({
      id: tag,
      label: tag,
      count: blogPosts.filter(p => p.tags?.includes(tag)).length
    }))
  ];

  const filteredPosts = selectedTag === 'ALL' 
    ? blogPosts 
    : blogPosts.filter(post => post.tags?.includes(selectedTag));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-2 mb-12"
          >
            {tags.map((tag) => (
              <Button
                key={tag.id}
                variant={selectedTag === tag.id ? 'default' : 'outline'}
                className={`${
                  selectedTag === tag.id
                    ? 'cyber-glow'
                    : 'glass-morphism hover:bg-accent/50'
                } transition-all duration-300`}
                onClick={() => setSelectedTag(tag.id)}
              >
                <Filter className="w-4 h-4 mr-2" />
                {tag.label}
                {tag.count > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {tag.count}
                  </Badge>
                )}
              </Button>
            ))}
          </motion.div>
        )}

        {/* Blog Posts */}
        {loading ? (
          <div className="text-center">
            <Card className="glass-morphism p-12">
              <BookOpen className="w-16 h-16 text-primary/50 mx-auto mb-4 animate-pulse" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Lade Blog-Posts...
              </h3>
            </Card>
          </div>
        ) : filteredPosts.length > 0 ? (
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
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(post.createdAt)}
                      </div>
                    </div>

                    {/* Title */}
                    <Link href={`/pages/${post.slug}`} className="block">
                      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
                        {post.title}
                      </h3>
                    </Link>

                    {/* Excerpt */}
                    <p className="text-sm text-muted-foreground mb-4 flex-1">
                      {post.excerpt || 'Kein Auszug verfügbar'}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {(post.tags || []).slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Read More */}
                    <div className="flex items-center justify-end pt-4 border-t border-white/10">
                      <Link href={`/pages/${post.slug}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="group/btn hover:text-primary"
                        >
                          Lesen
                          <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                      </Link>
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
