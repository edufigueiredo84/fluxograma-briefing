import type { Metadata } from "next";
import { Archivo, Azeret_Mono } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const azeretMono = Azeret_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Planta · Estúdio de Fluxograma, Briefing & Jornadas de Produto",
  description:
    "Mapeie jornadas do usuário em reuniões ao vivo com clientes, combine blocos de produto com post-its estilo FigJam e compile escopos técnicos (PRD) automaticamente.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} ${azeretMono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
