
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Code, Music, Gamepad2, BookOpen, User, Mail, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

// Static navigation items
const staticNavigation = [
  { name: 'Home', href: '#hero', icon: Code },
  { name: 'Music', href: '#music', icon: Music },
  { name: 'PowerShell', href: '#powershell', icon: Code },
  { name: 'Gaming', href: '#gaming', icon: Gamepad2 },
  { name: 'Blog', href: '#blog', icon: BookOpen },
  { name: 'About', href: '#about', icon: User },
  { name: 'Kontakt', href: '#contact', icon: Mail },
];

interface DynamicSection {
  id: string;
  title: string;
  slug: string;
  icon?: string;
  showInNav: boolean;
  pages: Array<{
    id: string;
    title: string;
    slug: string;
    showInNav: boolean;
  }>;
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [dynamicSections, setDynamicSections] = useState<DynamicSection[]>([]);

  // Load dynamic sections
  useEffect(() => {
    const loadDynamicSections = async () => {
      try {
        const res = await fetch('/api/cms/sections');
        if (res.ok) {
          const sections = await res.json();
          setDynamicSections(sections.filter((s: DynamicSection) => s.showInNav));
        }
      } catch (error) {
        console.error('Error loading dynamic sections:', error);
      }
    };

    loadDynamicSections();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get icon component from Lucide
  const getIcon = (iconName?: string) => {
    if (!iconName) return Briefcase;
    const Icon = (LucideIcons as any)[iconName];
    return Icon || Briefcase;
  };

  // Combine static and dynamic navigation
  const allNavigation = [
    ...staticNavigation,
    ...dynamicSections.map((section) => ({
      name: section.title,
      href: section.pages.length > 0 ? `/pages/${section.pages[0].slug}` : '#',
      icon: getIcon(section.icon),
      isDropdown: section.pages.length > 1,
      pages: section.pages.filter((p) => p.showInNav),
    })),
  ];

  const smoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
    setIsMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/80 backdrop-blur-md border-b border-white/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Skip Link for Accessibility */}
          <Link
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
          >
            Skip to main content
          </Link>

          {/* Brand */}
          <div className="flex-shrink-0">
            <Link
              href="#hero"
              className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary transition-all duration-300"
              onClick={(e) => smoothScroll(e, '#hero')}
            >
              Code & Beats
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:block" role="menubar">
            <div className="flex items-center space-x-1">
              {allNavigation.map((item) => {
                const Icon = item.icon;
                const isHashLink = item.href.startsWith('#');
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
                    role="menuitem"
                    onClick={isHashLink ? (e) => smoothScroll(e, item.href) : undefined}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Theme Toggle & Mobile Menu Button */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-expanded={isMenuOpen}
                aria-label="Toggle mobile menu"
                className="p-2"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <Menu className="w-5 h-5" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-background/95 backdrop-blur-md border-b border-white/10"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {allNavigation.map((item) => {
                const Icon = item.icon;
                const isHashLink = item.href.startsWith('#');
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
                    onClick={isHashLink ? (e) => smoothScroll(e, item.href) : () => setIsMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
