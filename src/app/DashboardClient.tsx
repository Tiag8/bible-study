"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { PARCHMENT } from "@/lib/design-tokens";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { BookGrid } from "@/components/dashboard/BookGrid";
import { ChapterView } from "@/components/dashboard/ChapterView";
import { BacklogPanel } from "@/components/dashboard/BacklogPanel";
import { mockBibleBooks, BibleBook } from "@/lib/mock-data";
import { useStudies } from "@/hooks";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Menu, BookMarked } from "lucide-react";
import { WelcomeGuide } from "@/components/dashboard/WelcomeGuide";

export function DashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Auth check
  const { user, loading: authLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // Supabase hook
  const { studies, loading: studiesLoading } = useStudies();

  // Navigation state
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backlogOpen, setBacklogOpen] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Enriquecer livros com dados de estudos do Supabase
  const enrichedBooks = useMemo(() => {
    return mockBibleBooks.map((book) => {
      const bookStudies = studies.filter((s) => s.book_name === book.name);
      const studiedChapters = bookStudies.map((s) => s.chapter_number);
      const lastUpdate = bookStudies.length > 0
        ? bookStudies.reduce((latest, s) => {
            const sDate = new Date(s.updated_at).getTime();
            return sDate > latest ? sDate : latest;
          }, 0)
        : null;

      return {
        ...book,
        studiedChapters,
        lastUpdate: lastUpdate ? new Date(lastUpdate).toISOString() : null,
      };
    });
  }, [studies]);

  // Ler query param 'book' e abrir automaticamente o ChapterView
  useEffect(() => {
    const bookId = searchParams.get('book');
    if (bookId && enrichedBooks.length > 0) {
      const book = enrichedBooks.find((b) => b.id === bookId);
      if (book) {
        setSelectedBook(book);
      }
    } else if (!bookId) {
      setSelectedBook(null);
    }
  }, [searchParams, enrichedBooks]);

  // Close mobile drawers on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setBacklogOpen(false);
  }, [searchParams]);

  // Handlers
  const handleBookClick = (bookId: string) => {
    const book = enrichedBooks.find((b) => b.id === bookId);
    if (book) {
      setSelectedBook(book);
      router.push(`/?book=${bookId}`);
    }
  };

  const handleBackToBooks = () => {
    setSelectedBook(null);
    router.push('/');
  };

  const handleGraphClick = () => {
    router.push("/grafo");
  };

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-parchment">
        <Loader2 className={cn("w-8 h-8 animate-spin", PARCHMENT.accent.text)} />
        <span className={cn("ml-3", PARCHMENT.text.muted)}>Verificando autenticação...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-parchment">
        <Loader2 className={cn("w-8 h-8 animate-spin", PARCHMENT.accent.text)} />
        <span className={cn("ml-3", PARCHMENT.text.muted)}>Redirecionando...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-parchment">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Fechar menu"
        />
      )}

      {/* Sidebar - hidden on mobile, shown as drawer when mobileMenuOpen */}
      <div className={cn(
        "lg:relative lg:block",
        mobileMenuOpen
          ? "fixed inset-y-0 left-0 z-50"
          : "hidden lg:block"
      )}>
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="flex items-center gap-2 px-4 py-3 lg:hidden border-b border-linen bg-ivory">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-cream min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Abrir menu"
          >
            <Menu className={cn("w-5 h-5", PARCHMENT.text.heading)} />
          </button>
          <span className={cn("font-lora font-bold flex-1", PARCHMENT.text.heading)}>Bible Study</span>
          <button
            onClick={() => setBacklogOpen(!backlogOpen)}
            className="p-2 rounded-lg hover:bg-cream min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Abrir quadro de estudos"
          >
            <BookMarked className={cn("w-5 h-5", PARCHMENT.accent.text)} />
          </button>
        </div>

        {/* Top Bar */}
        <TopBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
          onGraphClick={handleGraphClick}
        />

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {selectedBook ? (
            <ChapterView
              book={selectedBook}
              onBack={handleBackToBooks}
            />
          ) : (
            <div>
              {/* Page Header */}
              <div className="mb-4 md:mb-6">
                <h1 className={cn("text-xl md:text-2xl font-lora font-bold", PARCHMENT.text.heading)}>
                  Biblioteca Bíblica
                </h1>
                <p className={cn("mt-1 text-sm md:text-base", PARCHMENT.text.secondary)}>
                  Navegue pelos livros e gerencie seus estudos
                </p>
              </div>

              {/* Welcome Guide for new users */}
              {!studiesLoading && studies.length === 0 && (
                <WelcomeGuide />
              )}

              {/* Book Grid */}
              {studiesLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className={cn("w-8 h-8 animate-spin", PARCHMENT.accent.text)} />
                  <span className={cn("ml-3", PARCHMENT.text.muted)}>Carregando estudos...</span>
                </div>
              ) : (
                <BookGrid
                  books={enrichedBooks}
                  searchQuery={searchQuery}
                  selectedTags={selectedTags}
                  onBookClick={handleBookClick}
                />
              )}
            </div>
          )}
        </main>
      </div>

      {/* Backlog Panel - hidden on mobile, drawer when backlogOpen */}
      {backlogOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setBacklogOpen(false)}
          aria-label="Fechar quadro de estudos"
        />
      )}
      <div className={cn(
        "lg:relative lg:block",
        backlogOpen
          ? "fixed inset-y-0 right-0 z-50"
          : "hidden lg:block"
      )}>
        <BacklogPanel />
      </div>
    </div>
  );
}
