// components/graph/controls/SearchPanel.tsx
'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchPanelProps {
  onSearch: (searchTerm: string) => void;
  className?: string;
}

export const SearchPanel = ({ onSearch, className }: SearchPanelProps) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = () => {
    onSearch(searchInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar organización o imputado..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-8"
        />
      </div>
      <Button 
        onClick={handleSearch}
        variant="secondary"
      >
        Buscar
      </Button>
    </div>
  );
};