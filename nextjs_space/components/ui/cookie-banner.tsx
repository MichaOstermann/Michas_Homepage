
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Cookie, X } from 'lucide-react';
import Link from 'next/link';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [bannerText, setBannerText] = useState('Diese Website verwendet Cookies, um Ihnen die bestmögliche Nutzererfahrung zu bieten.');

  useEffect(() => {
    // Check if user has already accepted/rejected cookies
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setIsVisible(true);
    }

    // Load banner text from API
    const loadBannerText = async () => {
      try {
        const res = await fetch('/api/privacy-settings');
        if (res.ok) {
          const data = await res.json();
          if (data.cookieBannerEnabled) {
            setBannerText(data.cookieBannerText);
          } else {
            setIsVisible(false);
          }
        }
      } catch (error) {
        console.error('Error loading privacy settings:', error);
      }
    };

    loadBannerText();
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  const rejectCookies = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50"
        >
          <Card className="border-primary/20 bg-card/95 backdrop-blur-md shadow-2xl">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Cookie className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Cookie-Hinweis</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {bannerText}
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Weitere Informationen finden Sie in unserer{' '}
                    <Link href="/datenschutz" className="text-primary hover:underline">
                      Datenschutzerklärung
                    </Link>
                    .
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={acceptCookies}
                      size="sm"
                      className="flex-1"
                    >
                      Akzeptieren
                    </Button>
                    <Button
                      onClick={rejectCookies}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      Ablehnen
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={rejectCookies}
                  variant="ghost"
                  size="sm"
                  className="flex-shrink-0 p-1 h-auto"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
