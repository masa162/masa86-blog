import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "masa86 Blog",
  description: "Personal blog by masa86",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <div className="min-h-screen">
          <header className="border-b border-[var(--border)] mb-8">
            <div className="max-w-4xl mx-auto px-4 py-6">
              <h1 className="text-2xl font-bold">
                <a href="/" className="no-underline hover:no-underline">
                  masa86 Blog
                </a>
              </h1>
            </div>
          </header>
          <main className="max-w-4xl mx-auto px-4 pb-16">
            {children}
          </main>
          <footer className="border-t border-[var(--border)] mt-16">
            <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-[var(--muted)]">
              © {new Date().getFullYear()} masa86. All rights reserved.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

