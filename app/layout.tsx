// app/layout.tsx
import { Toaster } from '@/components/ui/toaster';
import '@uploadthing/react/styles.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/nextjs';
import { Providers } from '@/app/providers/providers';
import { ThemeProvider } from '@/components/theme-provider';
import Header from '@/components/layout/header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ECOH PIR',
  description: 'Set de herramientas ECOH'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider afterSignInUrl="/dashboard">
            <Providers>
              <div className="min-h-screen">
                <Header />

                <SignedOut>
                  <main className="pt-16">
                    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4 text-center">
                      <h1 className="mb-6 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
                        Bienvenido a Ecoh Tools
                      </h1>
                      <p className="mb-8 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
                        Accede a nuestra suite completa de herramientas para
                        optimizar tu trabajo.
                      </p>
                    </div>
                  </main>
                </SignedOut>

                <SignedIn>
                  <div className="flex h-screen pt-16">{children}</div>
                </SignedIn>

                <Toaster />
              </div>
            </Providers>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
