
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Trash2, Mail, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

export default function AdminContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await fetch('/api/admin/contacts');
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Möchtest du diese Kontaktanfrage wirklich löschen?')) return;

    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setContacts(contacts.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete contact:', error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'READ' }),
      });
      
      if (res.ok) {
        setContacts(contacts.map(c => 
          c.id === id ? { ...c, status: 'READ' } : c
        ));
      }
    } catch (error) {
      console.error('Failed to update contact:', error);
    }
  };

  const filteredContacts = contacts.filter(c => {
    if (filter === 'ALL') return true;
    return c.status === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Lade Kontakte...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Kontaktanfragen</h1>
        <p className="text-muted-foreground">Verwalte alle Kontaktformular-Einträge</p>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-4 mb-6">
        {['ALL', 'UNREAD', 'READ'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as typeof filter)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === status
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {status === 'ALL' ? 'Alle' : status === 'UNREAD' ? 'Ungelesen' : 'Gelesen'}
            <span className="ml-2 text-xs">
              ({contacts.filter(c => status === 'ALL' || c.status === status).length})
            </span>
          </button>
        ))}
      </div>

      {/* Contacts List */}
      <div className="space-y-4">
        {filteredContacts.length === 0 ? (
          <Card className="glass-morphism p-12 text-center">
            <Mail className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">Keine Kontaktanfragen gefunden</p>
          </Card>
        ) : (
          filteredContacts.map((contact, index) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="glass-morphism p-6 hover:cyber-glow transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {contact.status === 'UNREAD' ? (
                        <Clock className="w-5 h-5 text-orange-500" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      <h3 className="text-lg font-bold text-foreground">{contact.subject}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        contact.status === 'UNREAD'
                          ? 'bg-orange-500/20 text-orange-500'
                          : 'bg-green-500/20 text-green-500'
                      }`}>
                        {contact.status === 'UNREAD' ? 'Neu' : 'Gelesen'}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong className="text-foreground">Von:</strong> {contact.name} ({contact.email})
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">Datum:</strong> {new Date(contact.createdAt).toLocaleString('de-DE')}
                      </p>
                    </div>
                    
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                      {contact.message}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    {contact.status === 'UNREAD' && (
                      <button
                        onClick={() => handleMarkAsRead(contact.id)}
                        className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-500 transition-colors"
                        title="Als gelesen markieren"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(contact.id)}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                      title="Löschen"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
