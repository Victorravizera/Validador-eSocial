import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "eSocial QA Validator",
  description: "Validação automatizada de eventos trabalhistas do eSocial",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
