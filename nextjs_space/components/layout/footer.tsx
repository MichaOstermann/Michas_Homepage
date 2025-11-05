
'use client';

import Link from 'next/link';
import { Github, Youtube, Twitch, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const quickLinks = [
  { name: 'Music', href: '#music' },
  { name: 'PowerShell', href: '#powershell' },
  { name: 'Gaming', href: '#gaming' },
  { name: 'About', href: '#about' },
];

const socialLinks = [
  { name: 'GitHub', href: '#', icon: Github, external: true },
  { name: 'YouTube', href: '#', icon: Youtube, external: true },
  { name: 'Twitch', href: '#', icon: Twitch, external: true },
];

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const smoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <footer className="bg-background/50 backdrop-blur-sm border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="col-span-1 md:col-span-2">
            <Link
              href="#hero"
              className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary"
              onClick={(e) => smoothScroll(e, '#hero')}
            >
              Code & Beats
            </Link>
            <p className="mt-4 text-muted-foreground max-w-md">
              PowerShell by day. Synthwave by night. Gaming always. Eine moderne Sammlung von Musik, Code und Gaming-Content.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200"
                    onClick={(e) => smoothScroll(e, link.href)}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
              Connect
            </h3>
            <div className="flex space-x-4">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Button
                    key={link.name}
                    variant="ghost"
                    size="sm"
                    className="p-2 hover:bg-accent/50"
                    asChild
                  >
                    <Link
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      aria-label={`Visit our ${link.name} page`}
                    >
                      <Icon className="w-5 h-5" />
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Code & Beats. Made with ❤️ and lots of ☕.
          </p>
          
          <Button
            onClick={scrollToTop}
            variant="ghost"
            size="sm"
            className="mt-4 sm:mt-0 hover:bg-accent/50"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-4 h-4 mr-2" />
            Back to Top
          </Button>
        </div>
      </div>
    </footer>
  );
}
