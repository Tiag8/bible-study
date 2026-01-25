"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { BookGrid } from "@/components/dashboard/BookGrid";
import { ChapterView } from "@/components/dashboard/ChapterView";
import { BacklogPanel } from "@/components/dashboard/BacklogPanel";
import { mockBibleBooks, BibleBook } from "@/lib/mock-data";

export default function DashboardPage() {
  const router = useRouter();
  // Navigation state
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Handlers
  const handleBookClick = (bookId: string) => {
    const book = mockBibleBooks.find((b) => b.id === bookId);
    if (book) {
      setSelectedBook(book);
    }
  };

  const handleBackToBooks = () => {
    setSelectedBook(null);
  };

  const handleGraphClick = () => {
    router.push("/grafo");
  };

  const handleBacklogStudyClick = (referenceLabel: string) => {
    // TODO: Create new study from backlog reference
    console.log(`Creating study for: ${referenceLabel}`);
  };

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
              <BookGrid
                books={mockBibleBooks}
                searchQuery={searchQuery}
                selectedTags={selectedTags}
                onBookClick={handleBookClick}
              />
            </div>
          )}
        </main>
      </div>

      {/* Backlog Panel */}
      <BacklogPanel onStudyClick={handleBacklogStudyClick} />
    </div>
  );
}
