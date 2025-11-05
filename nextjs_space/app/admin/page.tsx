
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Music, Code2, Gamepad2, BookOpen, Mail, TrendingUp, Folder, FileText } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    tracks: 0,
    scripts: 0,
    gaming: 0,
    blog: 0,
    contacts: 0,
    sections: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'CMS Sektionen',
      value: stats.sections,
      icon: Folder,
      color: 'from-yellow-400 to-orange-500',
      href: '/admin/cms',
      description: 'Content Management',
    },
    {
      title: 'CMS Seiten',
      value: stats.pages,
      icon: FileText,
      color: 'from-indigo-400 to-purple-500',
      href: '/admin/cms',
      description: 'Dynamische Inhalte',
    },
    {
      title: 'Musik Tracks',
      value: stats.tracks,
      icon: Music,
      color: 'from-purple-400 to-pink-500',
      href: '/admin/tracks',
    },
    {
      title: 'PowerShell Scripts',
      value: stats.scripts,
      icon: Code2,
      color: 'from-cyan-400 to-blue-500',
      href: '/admin/scripts',
    },
    {
      title: 'Gaming Content',
      value: stats.gaming,
      icon: Gamepad2,
      color: 'from-pink-400 to-red-500',
      href: '/admin/gaming',
    },
    {
      title: 'Blog Posts',
      value: stats.blog,
      icon: BookOpen,
      color: 'from-green-400 to-emerald-500',
      href: '/admin/blog',
    },
    {
      title: 'Kontaktanfragen',
      value: stats.contacts,
      icon: Mail,
      color: 'from-orange-400 to-red-500',
      href: '/admin/contacts',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Lade Statistiken...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Willkommen im Admin-Bereich! Hier kannst du alle Inhalte verwalten.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <a key={stat.title} href={stat.href}>
              <Card className="glass-morphism p-6 hover:cyber-glow transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-1">{stat.value}</h3>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                {stat.description && (
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                )}
              </Card>
            </a>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="glass-morphism p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Schnellaktionen</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <a
            href="/admin/cms"
            className="p-4 rounded-lg bg-gradient-to-br from-yellow-400/10 to-orange-500/10 hover:from-yellow-400/20 hover:to-orange-500/20 border border-yellow-400/20 transition-all"
          >
            <Folder className="w-8 h-8 text-yellow-400 mb-2" />
            <p className="font-semibold text-foreground">CMS</p>
            <p className="text-xs text-muted-foreground">Content verwalten</p>
          </a>

          <a
            href="/admin/tracks"
            className="p-4 rounded-lg bg-gradient-to-br from-purple-400/10 to-pink-500/10 hover:from-purple-400/20 hover:to-pink-500/20 border border-purple-400/20 transition-all"
          >
            <Music className="w-8 h-8 text-purple-400 mb-2" />
            <p className="font-semibold text-foreground">Neuer Track</p>
            <p className="text-xs text-muted-foreground">Musik hinzufügen</p>
          </a>
          
          <a
            href="/admin/scripts"
            className="p-4 rounded-lg bg-gradient-to-br from-cyan-400/10 to-blue-500/10 hover:from-cyan-400/20 hover:to-blue-500/20 border border-cyan-400/20 transition-all"
          >
            <Code2 className="w-8 h-8 text-cyan-400 mb-2" />
            <p className="font-semibold text-foreground">Neues Script</p>
            <p className="text-xs text-muted-foreground">PowerShell hinzufügen</p>
          </a>
          
          <a
            href="/admin/gaming"
            className="p-4 rounded-lg bg-gradient-to-br from-pink-400/10 to-red-500/10 hover:from-pink-400/20 hover:to-red-500/20 border border-pink-400/20 transition-all"
          >
            <Gamepad2 className="w-8 h-8 text-pink-400 mb-2" />
            <p className="font-semibold text-foreground">Gaming Content</p>
            <p className="text-xs text-muted-foreground">Neuer Artikel</p>
          </a>
          
          <a
            href="/admin/blog"
            className="p-4 rounded-lg bg-gradient-to-br from-green-400/10 to-emerald-500/10 hover:from-green-400/20 hover:to-emerald-500/20 border border-green-400/20 transition-all"
          >
            <BookOpen className="w-8 h-8 text-green-400 mb-2" />
            <p className="font-semibold text-foreground">Neuer Blog Post</p>
            <p className="text-xs text-muted-foreground">Artikel schreiben</p>
          </a>
        </div>
      </Card>
    </div>
  );
}
