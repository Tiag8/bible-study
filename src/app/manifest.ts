import type { MetadataRoute } from "next";

// Cores do tema Parchment (tailwind.config.ts): ivory = barra do topo no celular,
// parchment = fundo das páginas.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bible Study - Segundo Cérebro Bíblico",
    short_name: "Bible Study",
    description: "Seus estudos bíblicos, interligados e com revisão espaçada",
    lang: "pt-BR",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#e8e0d1",
    theme_color: "#f5f0e8",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
