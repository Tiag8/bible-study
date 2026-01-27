import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { StudiesProvider } from "@/hooks";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bible Graph - Segundo Cérebro para Estudos Bíblicos",
  description: "Sistema de organização de estudos bíblicos com interconexões e revisão inteligente",
  // ✅ SECURITY: Content Security Policy (previne XSS e clickjacking)
  other: {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Tiptap + Next.js requerem unsafe-inline/eval
      "style-src 'self' 'unsafe-inline'",  // TailwindCSS e Tiptap styles
      "img-src 'self' data: https:",       // Data URIs e HTTPS images
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co", // API Supabase
      "frame-ancestors 'none'",            // Previne clickjacking
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",                 // Bloqueia Flash/plugins
    ].join('; '),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <StudiesProvider>{children}</StudiesProvider>
        </AuthProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
