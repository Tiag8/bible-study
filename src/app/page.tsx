"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { BookGrid } from "@/components/dashboard/BookGrid";
import { ChapterView } from "@/components/dashboard/ChapterView";
import { BacklogPanel } from "@/components/dashboard/BacklogPanel";
import { mockBibleBooks, BibleBook } from "@/lib/mock-data";
import { useStudies } from "@/hooks";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Auth check
  const { user, loading: authLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('[DASHBOARD] No user after auth loaded, redirecting to login');
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // Supabase hook
  const { studies, loading: studiesLoading } = useStudies();

  // Navigation state
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
      // Se não tem query param, voltar para BookGrid
      setSelectedBook(null);
    }
  }, [searchParams, enrichedBooks]);

  // Handlers
  const handleBookClick = (bookId: string) => {
    const book = enrichedBooks.find((b) => b.id === bookId);
    if (book) {
      setSelectedBook(book);
      // Atualizar URL com query param
      router.push(`/?book=${bookId}`);
    }
  };

  const handleBackToBooks = () => {
    setSelectedBook(null);
    // Remover query param
    router.push('/');
  };

  const handleGraphClick = () => {
    router.push("/grafo");
  };

  const handleBacklogStudyClick = (referenceLabel: string) => {
    // TODO: Create new study from backlog reference
    console.log(`Creating study for: ${referenceLabel}`);
  };

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-gray-500">Verificando autenticação...</span>
      </div>
    );
  }

  // If no user after loading, useEffect will redirect - show nothing
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-gray-500">Redirecionando...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <TopBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
          onGraphClick={handleGraphClick}
        />

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {selectedBook ? (
            <ChapterView
              book={selectedBook}
              onBack={handleBackToBooks}
            />
          ) : (
            <div>
              {/* Page Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  Biblioteca Bíblica
                </h1>
                <p className="text-gray-600 mt-1">
                  Navegue pelos livros e gerencie seus estudos
                </p>
              </div>

              {/* Book Grid */}
              {studiesLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  <span className="ml-3 text-gray-500">Carregando estudos...</span>
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

      {/* Backlog Panel */}
      <BacklogPanel onStudyClick={handleBacklogStudyClick} />
    </div>
  );
}
