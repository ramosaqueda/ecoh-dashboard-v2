// page-container.tsx
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function PageContainer({
  children,
  scrollable = false,
  className = ''
}: {
  children: React.ReactNode;
  scrollable?: boolean;
  className?: string;
}) {
  return (
    <div className="h-[calc(100vh-52px)] w-full">
      {scrollable ? (
        <ScrollArea className="h-full">
          <div className={`h-full ${className}`}>{children}</div>
        </ScrollArea>
      ) : (
        <div className={`h-full ${className}`}>{children}</div>
      )}
    </div>
  );
}