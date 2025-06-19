// components/layout/header.tsx
import ThemeToggle from '@/components/layout/ThemeToggle/theme-toggle';
import { cn } from '@/lib/utils';
import { MobileSidebar } from './mobile-sidebar';
import { UserNav } from './user-nav';
import Logo from '@/components/ui/logo';
import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';

export default function Header() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50">
      {/* Banda superior de color corporativo */}
      <div className="h-1 bg-gradient-to-r from-blue-900 via-blue-600 to-blue-400" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 via-white/85 to-blue-100/25 dark:from-blue-950/25 dark:via-slate-900/90 dark:to-blue-900/20" />
      
      {/* Glassmorphism effect */}
      <div className="absolute inset-0 backdrop-blur-xl border-b border-blue-200/30 dark:border-blue-700/40 shadow-lg shadow-blue-500/10 dark:shadow-blue-600/20" />
      
      <nav className="relative h-16 px-4 lg:px-6">
        <div className="flex h-full items-center justify-between">
          {/* Logo y título + Mobile Sidebar */}
          <div className="flex items-center">
            <div className={cn('mr-3 block lg:!hidden')}>
              <MobileSidebar />
            </div>
            
            <div className="flex items-center group">
              {/* Brand name with modern typography */}
              <div className="flex items-center transition-transform duration-300 group-hover:scale-105">
                <div>
                  <span className="bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 bg-clip-text text-4xl    font-bold tracking-tight text-transparent dark:from-blue-300 dark:via-blue-200 dark:to-blue-100">
                    F-Insight
                  </span>
                  <div className="h-0.5 w-0 bg-gradient-to-r from-blue-700 to-blue-400 transition-all duration-300 group-hover:w-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-3">
            {/* Logo - justo antes de los botones */}
            <div className="mr-4">
              <Logo />
            </div>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-2.5 font-medium text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-400/40 active:scale-95 dark:shadow-blue-600/40">
                  {/* Button shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] transition-transform duration-700 group-hover:translate-x-[200%]" />
                  <span className="relative flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Iniciar Sesión
                  </span>
                </button>
              </SignInButton>
            </SignedOut>
            
            <SignedIn>
              <div className="rounded-lg p-1 backdrop-blur-sm bg-white/40 dark:bg-gray-800/40 border border-white/20 dark:border-gray-700/30">
                <UserNav />
              </div>
            </SignedIn>
            
            {/* Theme toggle with modern styling */}
            <div className="rounded-lg p-1 backdrop-blur-sm bg-white/40 dark:bg-gray-800/40 border border-white/20 dark:border-gray-700/30 transition-all duration-200 hover:bg-white/60 dark:hover:bg-gray-800/60">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>
      
      {/* Bottom glow effect */}
      <div className="absolute bottom-0 left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-blue-400/30 to-blue-600/30" />
    </header>
  );
}