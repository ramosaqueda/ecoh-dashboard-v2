// providers.tsx - VERSIÓN ACTUALIZADA CON CLERK
'use client';
import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import ThemeProvider from './ThemeToggle/theme-provider';

export default function Providers({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </ClerkProvider>
  );
}