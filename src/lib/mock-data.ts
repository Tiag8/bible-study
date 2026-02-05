// Dados mockados para desenvolvimento - Bible Graph

// ============================================
// TIPOS BASE
// ============================================

export interface Study {
  id: string;
  title: string;
  book: string;
  chapter: number;
  status: "draft" | "completed";
  tags: string[];
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface BibleBook {
  id: string;
  name: string;
  testament: "AT" | "NT"; // Antigo/Novo Testamento
  totalChapters: number;
  studiedChapters: number[];
  tags: string[];
  lastUpdate: string | null;
}

export interface Tag {
  id: string;
  name: string;
  type: "Versículos" | "Temas" | "Princípios";
  color: string;
}

export interface StudyLink {
  id: string;
  source_study_id: string;
  target_study_id: string;
  user_id: string;
  created_at: string;
}

// Categorias de livros bíblicos para colorização do grafo
export type BookCategory =
  | "pentateuco"      // Gênesis - Deuteronômio
  | "historicos"      // Josué - Ester
  | "poeticos"        // Jó - Cantares
  | "profetas_maiores" // Isaías - Daniel
  | "profetas_menores" // Oséias - Malaquias
  | "evangelhos"      // Mateus - João
  | "historico_nt"    // Atos
  | "cartas_paulinas" // Romanos - Filemom
  | "cartas_gerais"   // Hebreus - Judas
  | "apocaliptico";   // Apocalipse

export const bookCategoryColors: Record<BookCategory, string> = {
  pentateuco: "#10b981",      // Verde esmeralda
  historicos: "#f59e0b",      // Âmbar
  poeticos: "#8b5cf6",        // Roxo
  profetas_maiores: "#ef4444", // Vermelho
  profetas_menores: "#f97316", // Laranja
  evangelhos: "#3b82f6",      // Azul
  historico_nt: "#06b6d4",    // Ciano
  cartas_paulinas: "#ec4899", // Rosa
  cartas_gerais: "#6366f1",   // Índigo
  apocaliptico: "#a855f7",    // Violeta
};

export function getBookCategory(bookName: string): BookCategory {
  const pentateuco = ["Gênesis", "Êxodo", "Levítico", "Números", "Deuteronômio"];
  const historicos = ["Josué", "Juízes", "Rute", "1 Samuel", "2 Samuel", "1 Reis", "2 Reis", "1 Crônicas", "2 Crônicas", "Esdras", "Neemias", "Ester"];
  const poeticos = ["Jó", "Salmos", "Provérbios", "Eclesiastes", "Cantares"];
  const profetasMaiores = ["Isaías", "Jeremias", "Lamentações", "Ezequiel", "Daniel"];
  const profetasMenores = ["Oséias", "Joel", "Amós", "Obadias", "Jonas", "Miquéias", "Naum", "Habacuque", "Sofonias", "Ageu", "Zacarias", "Malaquias"];
  const evangelhos = ["Mateus", "Marcos", "Lucas", "João"];
  const historicoNT = ["Atos"];
  const cartasPaulinas = ["Romanos", "1 Coríntios", "2 Coríntios", "Gálatas", "Efésios", "Filipenses", "Colossenses", "1 Tessalonicenses", "2 Tessalonicenses", "1 Timóteo", "2 Timóteo", "Tito", "Filemom"];
  const cartasGerais = ["Hebreus", "Tiago", "1 Pedro", "2 Pedro", "1 João", "2 João", "3 João", "Judas"];

  if (pentateuco.includes(bookName)) return "pentateuco";
  if (historicos.includes(bookName)) return "historicos";
  if (poeticos.includes(bookName)) return "poeticos";
  if (profetasMaiores.includes(bookName)) return "profetas_maiores";
  if (profetasMenores.includes(bookName)) return "profetas_menores";
  if (evangelhos.includes(bookName)) return "evangelhos";
  if (historicoNT.includes(bookName)) return "historico_nt";
  if (cartasPaulinas.includes(bookName)) return "cartas_paulinas";
  if (cartasGerais.includes(bookName)) return "cartas_gerais";
  return "apocaliptico";
}

// ============================================
// TAGS DISPONÍVEIS
// ============================================

export const mockTags: Tag[] = [
  { id: "t1", name: "Criação", type: "Temas", color: "blue" },
  { id: "t2", name: "Sabedoria", type: "Princípios", color: "purple" },
  { id: "t3", name: "Salvação", type: "Temas", color: "green" },
  { id: "t4", name: "Fé", type: "Princípios", color: "amber" },
  { id: "t5", name: "Amor", type: "Temas", color: "pink" },
  { id: "t6", name: "Profecia", type: "Temas", color: "indigo" },
  { id: "t7", name: "Lei", type: "Princípios", color: "red" },
  { id: "t8", name: "Graça", type: "Temas", color: "emerald" },
];

// ============================================
// LIVROS DA BÍBLIA (66 livros)
// ============================================

export const mockBibleBooks: BibleBook[] = [
  // ANTIGO TESTAMENTO (39 livros)
  { id: "gen", name: "Gênesis", testament: "AT", totalChapters: 50, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "exo", name: "Êxodo", testament: "AT", totalChapters: 40, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "lev", name: "Levítico", testament: "AT", totalChapters: 27, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "num", name: "Números", testament: "AT", totalChapters: 36, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "deu", name: "Deuteronômio", testament: "AT", totalChapters: 34, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "jos", name: "Josué", testament: "AT", totalChapters: 24, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "jdg", name: "Juízes", testament: "AT", totalChapters: 21, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "rut", name: "Rute", testament: "AT", totalChapters: 4, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "1sa", name: "1 Samuel", testament: "AT", totalChapters: 31, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "2sa", name: "2 Samuel", testament: "AT", totalChapters: 24, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "1ki", name: "1 Reis", testament: "AT", totalChapters: 22, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "2ki", name: "2 Reis", testament: "AT", totalChapters: 25, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "1ch", name: "1 Crônicas", testament: "AT", totalChapters: 29, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "2ch", name: "2 Crônicas", testament: "AT", totalChapters: 36, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "ezr", name: "Esdras", testament: "AT", totalChapters: 10, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "neh", name: "Neemias", testament: "AT", totalChapters: 13, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "est", name: "Ester", testament: "AT", totalChapters: 10, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "job", name: "Jó", testament: "AT", totalChapters: 42, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "psa", name: "Salmos", testament: "AT", totalChapters: 150, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "pro", name: "Provérbios", testament: "AT", totalChapters: 31, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "ecc", name: "Eclesiastes", testament: "AT", totalChapters: 12, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "sng", name: "Cantares", testament: "AT", totalChapters: 8, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "isa", name: "Isaías", testament: "AT", totalChapters: 66, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "jer", name: "Jeremias", testament: "AT", totalChapters: 52, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "lam", name: "Lamentações", testament: "AT", totalChapters: 5, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "ezk", name: "Ezequiel", testament: "AT", totalChapters: 48, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "dan", name: "Daniel", testament: "AT", totalChapters: 12, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "hos", name: "Oséias", testament: "AT", totalChapters: 14, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "joe", name: "Joel", testament: "AT", totalChapters: 3, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "amo", name: "Amós", testament: "AT", totalChapters: 9, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "oba", name: "Obadias", testament: "AT", totalChapters: 1, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "jon", name: "Jonas", testament: "AT", totalChapters: 4, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "mic", name: "Miquéias", testament: "AT", totalChapters: 7, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "nah", name: "Naum", testament: "AT", totalChapters: 3, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "hab", name: "Habacuque", testament: "AT", totalChapters: 3, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "zep", name: "Sofonias", testament: "AT", totalChapters: 3, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "hag", name: "Ageu", testament: "AT", totalChapters: 2, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "zec", name: "Zacarias", testament: "AT", totalChapters: 14, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "mal", name: "Malaquias", testament: "AT", totalChapters: 4, studiedChapters: [], tags: [], lastUpdate: null },

  // NOVO TESTAMENTO (27 livros)
  { id: "mat", name: "Mateus", testament: "NT", totalChapters: 28, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "mrk", name: "Marcos", testament: "NT", totalChapters: 16, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "luk", name: "Lucas", testament: "NT", totalChapters: 24, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "jhn", name: "João", testament: "NT", totalChapters: 21, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "act", name: "Atos", testament: "NT", totalChapters: 28, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "rom", name: "Romanos", testament: "NT", totalChapters: 16, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "1co", name: "1 Coríntios", testament: "NT", totalChapters: 16, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "2co", name: "2 Coríntios", testament: "NT", totalChapters: 13, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "gal", name: "Gálatas", testament: "NT", totalChapters: 6, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "eph", name: "Efésios", testament: "NT", totalChapters: 6, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "php", name: "Filipenses", testament: "NT", totalChapters: 4, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "col", name: "Colossenses", testament: "NT", totalChapters: 4, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "1th", name: "1 Tessalonicenses", testament: "NT", totalChapters: 5, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "2th", name: "2 Tessalonicenses", testament: "NT", totalChapters: 3, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "1ti", name: "1 Timóteo", testament: "NT", totalChapters: 6, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "2ti", name: "2 Timóteo", testament: "NT", totalChapters: 4, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "tit", name: "Tito", testament: "NT", totalChapters: 3, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "phm", name: "Filemom", testament: "NT", totalChapters: 1, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "heb", name: "Hebreus", testament: "NT", totalChapters: 13, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "jas", name: "Tiago", testament: "NT", totalChapters: 5, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "1pe", name: "1 Pedro", testament: "NT", totalChapters: 5, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "2pe", name: "2 Pedro", testament: "NT", totalChapters: 3, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "1jn", name: "1 João", testament: "NT", totalChapters: 5, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "2jn", name: "2 João", testament: "NT", totalChapters: 1, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "3jn", name: "3 João", testament: "NT", totalChapters: 1, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "jud", name: "Judas", testament: "NT", totalChapters: 1, studiedChapters: [], tags: [], lastUpdate: null },
  { id: "rev", name: "Apocalipse", testament: "NT", totalChapters: 22, studiedChapters: [], tags: [], lastUpdate: null },
];

// ============================================
// ESTUDOS EXISTENTES
// ============================================

export const mockStudies: Study[] = [
  {
    id: "1",
    title: "Provérbios 1 - O Temor do Senhor",
    book: "Provérbios",
    chapter: 1,
    status: "completed",
    tags: ["Sabedoria", "Princípios"],
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T12:00:00Z",
    completed_at: "2024-01-15T12:00:00Z",
  },
  {
    id: "2",
    title: "Salmos 23 - O Bom Pastor",
    book: "Salmos",
    chapter: 23,
    status: "completed",
    tags: ["Fé", "Amor"],
    created_at: "2024-01-16T10:00:00Z",
    updated_at: "2024-01-16T11:30:00Z",
    completed_at: "2024-01-16T11:30:00Z",
  },
  {
    id: "3",
    title: "Romanos 8 - Vida no Espírito",
    book: "Romanos",
    chapter: 8,
    status: "completed",
    tags: ["Salvação", "Graça"],
    created_at: "2024-01-17T14:00:00Z",
    updated_at: "2024-01-17T16:00:00Z",
    completed_at: "2024-01-17T16:00:00Z",
  },
  {
    id: "4",
    title: "Gênesis 1 - A Criação",
    book: "Gênesis",
    chapter: 1,
    status: "draft",
    tags: ["Criação"],
    created_at: "2024-01-18T09:00:00Z",
    updated_at: "2024-01-18T09:30:00Z",
  },
  {
    id: "5",
    title: "João 3 - O Novo Nascimento",
    book: "João",
    chapter: 3,
    status: "completed",
    tags: ["Salvação", "Amor"],
    created_at: "2024-01-19T11:00:00Z",
    updated_at: "2024-01-19T13:00:00Z",
    completed_at: "2024-01-19T13:00:00Z",
  },
];

// ============================================
// BACKLOG DE ESTUDOS
// ============================================

// ============================================
// LINKS ENTRE ESTUDOS (Conexões do Grafo)
// ============================================

export const mockStudyLinks: StudyLink[] = [
  // Conexões baseadas em temas relacionados
  { id: "link1", source_study_id: "1", target_study_id: "2", user_id: "user1", created_at: "2024-01-16T12:00:00Z" }, // Provérbios 1 ↔ Salmos 23 (Sabedoria/Fé)
  { id: "link2", source_study_id: "2", target_study_id: "5", user_id: "user1", created_at: "2024-01-19T13:30:00Z" }, // Salmos 23 ↔ João 3 (Pastor/Amor)
  { id: "link3", source_study_id: "3", target_study_id: "5", user_id: "user1", created_at: "2024-01-19T14:00:00Z" }, // Romanos 8 ↔ João 3 (Salvação)
  { id: "link4", source_study_id: "4", target_study_id: "1", user_id: "user1", created_at: "2024-01-18T10:00:00Z" }, // Gênesis 1 ↔ Provérbios 1 (Criação/Sabedoria)
  { id: "link5", source_study_id: "3", target_study_id: "2", user_id: "user1", created_at: "2024-01-17T16:30:00Z" }, // Romanos 8 ↔ Salmos 23 (Espírito/Confiança)
];

// ============================================
// BACKLOG DE ESTUDOS
// ============================================

// ============================================
// LISTA DE LIVROS PARA AUTOCOMPLETE
// ============================================

export const bibleBooks = [
  // Antigo Testamento
  "Gênesis", "Êxodo", "Levítico", "Números", "Deuteronômio",
  "Josué", "Juízes", "Rute", "1 Samuel", "2 Samuel",
  "1 Reis", "2 Reis", "1 Crônicas", "2 Crônicas", "Esdras",
  "Neemias", "Ester", "Jó", "Salmos", "Provérbios",
  "Eclesiastes", "Cantares", "Isaías", "Jeremias", "Lamentações",
  "Ezequiel", "Daniel", "Oséias", "Joel", "Amós",
  "Obadias", "Jonas", "Miquéias", "Naum", "Habacuque",
  "Sofonias", "Ageu", "Zacarias", "Malaquias",
  // Novo Testamento
  "Mateus", "Marcos", "Lucas", "João", "Atos",
  "Romanos", "1 Coríntios", "2 Coríntios", "Gálatas", "Efésios",
  "Filipenses", "Colossenses", "1 Tessalonicenses", "2 Tessalonicenses",
  "1 Timóteo", "2 Timóteo", "Tito", "Filemom", "Hebreus",
  "Tiago", "1 Pedro", "2 Pedro", "1 João", "2 João", "3 João",
  "Judas", "Apocalipse",
];

// ============================================
// HELPERS
// ============================================

export function getBookById(id: string): BibleBook | undefined {
  return mockBibleBooks.find((book) => book.id === id);
}

export function getStudiesByBook(bookName: string): Study[] {
  return mockStudies.filter((study) => study.book === bookName);
}

export function formatRelativeDate(dateString: string | null): string {
  if (!dateString) return "Nunca";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return `${diffDays} dias atrás`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
  return date.toLocaleDateString("pt-BR");
}

// ============================================
// FUNÇÕES PARA ESTUDOS (CRUD SIMULADO)
// ============================================

export interface StudyContent {
  type: "doc";
  content: Array<{
    type: string;
    content?: Array<{ type: string; text?: string }>;
  }>;
}

export interface StudyWithContent extends Study {
  content: StudyContent;
}


/**
 * Busca estudo por livro e capítulo
 */
export function getStudyByBookAndChapter(
  bookName: string,
  chapter: number
): Study | undefined {
  return mockStudies.find(
    (s) => s.book === bookName && s.chapter === chapter
  );
}


/**
 * Busca informações do livro pelo nome
 */
export function getBookByName(bookName: string): BibleBook | undefined {
  return mockBibleBooks.find(
    (book) => book.name.toLowerCase() === bookName.toLowerCase()
  );
}
