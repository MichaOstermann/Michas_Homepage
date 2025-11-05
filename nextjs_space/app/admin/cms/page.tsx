
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Eye, EyeOff, Folder, FileText } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Section {
  id: string;
  title: string;
  slug: string;
  icon?: string;
  description?: string;
  isActive: boolean;
  showInNav: boolean;
  order: number;
  pages: Page[];
}

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  sectionId: string;
  featuredImageUrl?: string;
  tags: string[];
  published: boolean;
  showInNav: boolean;
  order: number;
  section?: Section;
}

export default function CMSPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sections');

  // Section form state
  const [sectionFormOpen, setSectionFormOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [sectionForm, setSectionForm] = useState({
    title: '',
    slug: '',
    icon: '',
    description: '',
    isActive: true,
    showInNav: true,
    order: 0,
  });

  // Page form state
  const [pageFormOpen, setPageFormOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [pageForm, setPageForm] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    sectionId: '',
    featuredImageUrl: '',
    tags: '',
    published: true,
    showInNav: true,
    order: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sectionsRes, pagesRes] = await Promise.all([
        fetch('/api/cms/sections'),
        fetch('/api/cms/pages'),
      ]);

      if (sectionsRes.ok) {
        const sectionsData = await sectionsRes.json();
        setSections(sectionsData);
      }

      if (pagesRes.ok) {
        const pagesData = await pagesRes.json();
        setPages(pagesData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Fehler',
        description: 'Daten konnten nicht geladen werden.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Section handlers
  const openSectionForm = (section?: Section) => {
    if (section) {
      setEditingSection(section);
      setSectionForm({
        title: section.title,
        slug: section.slug,
        icon: section.icon || '',
        description: section.description || '',
        isActive: section.isActive,
        showInNav: section.showInNav,
        order: section.order,
      });
    } else {
      setEditingSection(null);
      setSectionForm({
        title: '',
        slug: '',
        icon: '',
        description: '',
        isActive: true,
        showInNav: true,
        order: sections.length,
      });
    }
    setSectionFormOpen(true);
  };

  const saveSection = async () => {
    try {
      const url = editingSection
        ? `/api/cms/sections/${editingSection.id}`
        : '/api/cms/sections';
      
      const method = editingSection ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sectionForm),
      });

      if (res.ok) {
        toast({
          title: 'Erfolg',
          description: `Sektion wurde ${editingSection ? 'aktualisiert' : 'erstellt'}.`,
        });
        setSectionFormOpen(false);
        loadData();
      } else {
        throw new Error('Failed to save section');
      }
    } catch (error) {
      console.error('Error saving section:', error);
      toast({
        title: 'Fehler',
        description: 'Sektion konnte nicht gespeichert werden.',
        variant: 'destructive',
      });
    }
  };

  const deleteSection = async (id: string) => {
    if (!confirm('Sektion wirklich löschen? Alle Seiten in dieser Sektion werden ebenfalls gelöscht.')) {
      return;
    }

    try {
      const res = await fetch(`/api/cms/sections/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast({
          title: 'Erfolg',
          description: 'Sektion wurde gelöscht.',
        });
        loadData();
      } else {
        throw new Error('Failed to delete section');
      }
    } catch (error) {
      console.error('Error deleting section:', error);
      toast({
        title: 'Fehler',
        description: 'Sektion konnte nicht gelöscht werden.',
        variant: 'destructive',
      });
    }
  };

  // Page handlers
  const openPageForm = (page?: Page) => {
    if (page) {
      setEditingPage(page);
      setPageForm({
        title: page.title,
        slug: page.slug,
        content: page.content,
        excerpt: page.excerpt || '',
        sectionId: page.sectionId,
        featuredImageUrl: page.featuredImageUrl || '',
        tags: page.tags.join(', '),
        published: page.published,
        showInNav: page.showInNav,
        order: page.order,
      });
    } else {
      setEditingPage(null);
      setPageForm({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        sectionId: sections[0]?.id || '',
        featuredImageUrl: '',
        tags: '',
        published: true,
        showInNav: true,
        order: 0,
      });
    }
    setPageFormOpen(true);
  };

  const savePage = async () => {
    try {
      const url = editingPage
        ? `/api/cms/pages/${editingPage.id}`
        : '/api/cms/pages';
      
      const method = editingPage ? 'PUT' : 'POST';

      const data = {
        ...pageForm,
        tags: pageForm.tags.split(',').map((t) => t.trim()).filter((t) => t),
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast({
          title: 'Erfolg',
          description: `Seite wurde ${editingPage ? 'aktualisiert' : 'erstellt'}.`,
        });
        setPageFormOpen(false);
        loadData();
      } else {
        throw new Error('Failed to save page');
      }
    } catch (error) {
      console.error('Error saving page:', error);
      toast({
        title: 'Fehler',
        description: 'Seite konnte nicht gespeichert werden.',
        variant: 'destructive',
      });
    }
  };

  const deletePage = async (id: string) => {
    if (!confirm('Seite wirklich löschen?')) {
      return;
    }

    try {
      const res = await fetch(`/api/cms/pages/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast({
          title: 'Erfolg',
          description: 'Seite wurde gelöscht.',
        });
        loadData();
      } else {
        throw new Error('Failed to delete page');
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      toast({
        title: 'Fehler',
        description: 'Seite konnte nicht gelöscht werden.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Lädt CMS...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Content Management System
        </h1>
        <p className="text-muted-foreground">
          Verwalte Sektionen und Seiten deiner Website. Neue Sektionen erscheinen automatisch in der Navigation!
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="sections">
            <Folder className="w-4 h-4 mr-2" />
            Sektionen ({sections.length})
          </TabsTrigger>
          <TabsTrigger value="pages">
            <FileText className="w-4 h-4 mr-2" />
            Seiten ({pages.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Sektionen</h2>
            <Button onClick={() => openSectionForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Neue Sektion
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections.map((section) => (
              <Card key={section.id} className="border-white/10">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {section.title}
                        {section.showInNav && <Badge variant="outline">In Navigation</Badge>}
                      </CardTitle>
                      <CardDescription className="mt-2">{section.description || 'Keine Beschreibung'}</CardDescription>
                    </div>
                    <div className="flex gap-1">
                      {section.isActive ? (
                        <Eye className="w-4 h-4 text-green-500" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">{section.pages.length}</span> Seite(n)
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openSectionForm(section)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Bearbeiten
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteSection(section.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {sections.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Folder className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Noch keine Sektionen vorhanden</p>
                <Button onClick={() => openSectionForm()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Erste Sektion erstellen
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Seiten</h2>
            <Button onClick={() => openPageForm()} disabled={sections.length === 0}>
              <Plus className="w-4 h-4 mr-2" />
              Neue Seite
            </Button>
          </div>

          {sections.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Folder className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Bitte erstelle zuerst eine Sektion, bevor du Seiten hinzufügst
                </p>
                <Button onClick={() => setActiveTab('sections')}>
                  Zu Sektionen wechseln
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pages.map((page) => (
                  <Card key={page.id} className="border-white/10">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2 flex-wrap">
                            {page.title}
                            {page.showInNav && <Badge variant="outline" className="text-xs">Navigation</Badge>}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            {page.section?.title || 'Keine Sektion'}
                          </CardDescription>
                        </div>
                        <div className="flex gap-1">
                          {page.published ? (
                            <Eye className="w-4 h-4 text-green-500" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {page.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{page.excerpt}</p>
                        )}
                        {page.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {page.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => openPageForm(page)}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Bearbeiten
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deletePage(page.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {pages.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">Noch keine Seiten vorhanden</p>
                    <Button onClick={() => openPageForm()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Erste Seite erstellen
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Section Form Dialog */}
      <Dialog open={sectionFormOpen} onOpenChange={setSectionFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSection ? 'Sektion bearbeiten' : 'Neue Sektion erstellen'}
            </DialogTitle>
            <DialogDescription>
              Sektionen mit "In Navigation anzeigen" erscheinen automatisch im Header.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="section-title">Titel *</Label>
              <Input
                id="section-title"
                value={sectionForm.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setSectionForm({
                    ...sectionForm,
                    title,
                    slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                  });
                }}
                placeholder="z.B. Portfolio"
              />
            </div>

            <div>
              <Label htmlFor="section-slug">URL-Slug *</Label>
              <Input
                id="section-slug"
                value={sectionForm.slug}
                onChange={(e) => setSectionForm({ ...sectionForm, slug: e.target.value })}
                placeholder="portfolio"
              />
            </div>

            <div>
              <Label htmlFor="section-icon">Icon (Lucide Icon Name)</Label>
              <Input
                id="section-icon"
                value={sectionForm.icon}
                onChange={(e) => setSectionForm({ ...sectionForm, icon: e.target.value })}
                placeholder="z.B. Briefcase, BookOpen, Code"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Siehe <a href="https://lucide.dev/icons" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">lucide.dev</a> für verfügbare Icons
              </p>
            </div>

            <div>
              <Label htmlFor="section-description">Beschreibung</Label>
              <Textarea
                id="section-description"
                value={sectionForm.description}
                onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                placeholder="Kurze Beschreibung der Sektion"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="section-order">Reihenfolge</Label>
              <Input
                id="section-order"
                type="number"
                value={sectionForm.order}
                onChange={(e) => setSectionForm({ ...sectionForm, order: parseInt(e.target.value) })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="section-active"
                checked={sectionForm.isActive}
                onCheckedChange={(checked) => setSectionForm({ ...sectionForm, isActive: checked })}
              />
              <Label htmlFor="section-active">Aktiv</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="section-nav"
                checked={sectionForm.showInNav}
                onCheckedChange={(checked) => setSectionForm({ ...sectionForm, showInNav: checked })}
              />
              <Label htmlFor="section-nav">In Navigation anzeigen</Label>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setSectionFormOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={saveSection}>
                {editingSection ? 'Aktualisieren' : 'Erstellen'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Page Form Dialog */}
      <Dialog open={pageFormOpen} onOpenChange={setPageFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPage ? 'Seite bearbeiten' : 'Neue Seite erstellen'}
            </DialogTitle>
            <DialogDescription>
              Seiten erscheinen automatisch in der Navigation, wenn "In Navigation anzeigen" aktiviert ist.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="page-section">Sektion *</Label>
              <Select
                value={pageForm.sectionId}
                onValueChange={(value) => setPageForm({ ...pageForm, sectionId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sektion wählen" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="page-title">Titel *</Label>
              <Input
                id="page-title"
                value={pageForm.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setPageForm({
                    ...pageForm,
                    title,
                    slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                  });
                }}
                placeholder="z.B. Mein erstes Projekt"
              />
            </div>

            <div>
              <Label htmlFor="page-slug">URL-Slug *</Label>
              <Input
                id="page-slug"
                value={pageForm.slug}
                onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value })}
                placeholder="mein-erstes-projekt"
              />
              <p className="text-xs text-muted-foreground mt-1">
                URL: /pages/{pageForm.slug}
              </p>
            </div>

            <div>
              <Label htmlFor="page-excerpt">Kurzbeschreibung</Label>
              <Textarea
                id="page-excerpt"
                value={pageForm.excerpt}
                onChange={(e) => setPageForm({ ...pageForm, excerpt: e.target.value })}
                placeholder="Kurze Zusammenfassung der Seite"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="page-content">Inhalt (Markdown) *</Label>
              <Textarea
                id="page-content"
                value={pageForm.content}
                onChange={(e) => setPageForm({ ...pageForm, content: e.target.value })}
                placeholder="# Überschrift&#10;&#10;Dein Inhalt hier..."
                rows={10}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Unterstützt Markdown-Formatierung (# für Überschriften, ** für fett, etc.)
              </p>
            </div>

            <div>
              <Label htmlFor="page-image">Featured Image URL</Label>
              <Input
                id="page-image"
                value={pageForm.featuredImageUrl}
                onChange={(e) => setPageForm({ ...pageForm, featuredImageUrl: e.target.value })}
                placeholder="/images/project.jpg"
              />
            </div>

            <div>
              <Label htmlFor="page-tags">Tags (kommagetrennt)</Label>
              <Input
                id="page-tags"
                value={pageForm.tags}
                onChange={(e) => setPageForm({ ...pageForm, tags: e.target.value })}
                placeholder="PowerShell, Automation, Azure"
              />
            </div>

            <div>
              <Label htmlFor="page-order">Reihenfolge</Label>
              <Input
                id="page-order"
                type="number"
                value={pageForm.order}
                onChange={(e) => setPageForm({ ...pageForm, order: parseInt(e.target.value) })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="page-published"
                checked={pageForm.published}
                onCheckedChange={(checked) => setPageForm({ ...pageForm, published: checked })}
              />
              <Label htmlFor="page-published">Veröffentlicht</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="page-nav"
                checked={pageForm.showInNav}
                onCheckedChange={(checked) => setPageForm({ ...pageForm, showInNav: checked })}
              />
              <Label htmlFor="page-nav">In Navigation anzeigen</Label>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setPageFormOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={savePage}>
                {editingPage ? 'Aktualisieren' : 'Erstellen'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
