import React from 'react';

interface InlineCodeProps {
  children: React.ReactNode;
}

const InlineCode: React.FC<InlineCodeProps> = ({ children }) => {
  return (
    <code className="bg-muted text-muted-foreground px-1 py-0.5 rounded font-mono text-sm">
      {children}
    </code>
  );
};

export default InlineCode;