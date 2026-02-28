import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nebula — Knowledge Graph Mastery",
  description: "Map your study sessions into a dynamic, visual knowledge graph",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
