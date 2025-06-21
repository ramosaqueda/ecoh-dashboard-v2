'use client';

import React,{ useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  User, FileText, Calendar, Clock, CheckCircle, AlertTriangle, 
  Info, Star, Flag, MessageCircle, Heart, Mail, Phone, Home, 
  MapPin, Globe, Camera, Image, Video, Music, Search, Settings,
  Edit, Trash, Plus, X, MoreHorizontal, Menu, ChevronDown, ChevronUp,
  ArrowLeft, ArrowRight, Check, Folder, Book, Bookmark
} from 'lucide-react';

// Mapa de iconos disponibles
const iconMap: Record<string, React.ReactNode> = {
  User: <User />,
  FileText: <FileText />,
  Calendar: <Calendar />,
  Clock: <Clock />,
  CheckCircle: <CheckCircle />,
  AlertTriangle: <AlertTriangle />,
  Info: <Info />,
  Star: <Star />,
  Flag: <Flag />,
  MessageCircle: <MessageCircle />,
  Heart: <Heart />,
  Mail: <Mail />,
  Phone: <Phone />,
  Home: <Home />,
  MapPin: <MapPin />,
  Globe: <Globe />,
  Camera: <Camera />,
  Image: <Image />,
  Video: <Video />,
  Music: <Music />,
  Search: <Search />,
  Settings: <Settings />,
  Edit: <Edit />,
  Trash: <Trash />,
  Plus: <Plus />,
  X: <X />,
  MoreHorizontal: <MoreHorizontal />,
  Menu: <Menu />,
  ChevronDown: <ChevronDown />,
  ChevronUp: <ChevronUp />,
  ArrowLeft: <ArrowLeft />,
  ArrowRight: <ArrowRight />,
  Check: <Check />,
  Folder: <Folder />,
  Book: <Book />,
  Bookmark: <Bookmark />,
};

// Obtenemos los nombres de los iconos
const iconNames = Object.keys(iconMap);

interface IconPickerProps {
  selectedIcon: string;
  onSelectIcon: (icon: string) => void;
}

export function IconPicker({ selectedIcon, onSelectIcon }: IconPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Filtrar los iconos según el término de búsqueda
  const filteredIcons = searchTerm 
    ? iconNames.filter(icon => icon.toLowerCase().includes(searchTerm.toLowerCase()))
    : iconNames;

  // Renderiza el icono seleccionado en el botón
  const renderSelectedIcon = () => {
    if (!selectedIcon || !iconMap[selectedIcon]) return null;
    
    const iconElement = iconMap[selectedIcon];
    return React.cloneElement(iconElement as React.ReactElement, { 
      className: "mr-2 h-4 w-4" 
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-start text-left font-normal"
        >
          {selectedIcon && iconMap[selectedIcon] ? (
            <>
              {renderSelectedIcon()}
              <span>{selectedIcon}</span>
            </>
          ) : (
            <span>Seleccionar icono</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="p-2">
          <input
            type="text"
            placeholder="Buscar icono..."
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {isClient && (
          <ScrollArea className="h-[300px]">
            <div className="grid grid-cols-4 gap-2 p-2">
              {filteredIcons.map(iconName => {
                const iconElement = iconMap[iconName];
                return (
                  <Button
                    key={iconName}
                    variant="ghost"
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-md",
                      selectedIcon === iconName && "bg-primary/20"
                    )}
                    onClick={() => onSelectIcon(iconName)}
                  >
                    {React.cloneElement(iconElement as React.ReactElement, { 
                      className: "h-5 w-5" 
                    })}
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}