'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Database, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const FICHAB_SESSION_KEY = 'fichab_session';
const FICHAB_SERVERID_KEY = 'fichab_serverid';

// Hook global para usar la sesión FICHAB en cualquier componente
export function useFichabSession() {
  const [session, setSession] = useState<{ ciSession: string; serverId: string } | null>(null);

  useEffect(() => {
    const loadSession = () => {
      const ciSession = localStorage.getItem(FICHAB_SESSION_KEY);
      const serverId = localStorage.getItem(FICHAB_SERVERID_KEY) || '1';
      
      if (ciSession) {
        setSession({ ciSession, serverId });
      } else {
        setSession(null);
      }
    };

    loadSession();

    // Escuchar cambios en localStorage (para sincronizar entre tabs)
    window.addEventListener('storage', loadSession);
    // Evento custom para actualizaciones en la misma tab
    window.addEventListener('fichab-session-updated', loadSession);

    return () => {
      window.removeEventListener('storage', loadSession);
      window.removeEventListener('fichab-session-updated', loadSession);
    };
  }, []);

  return session;
}

export function FichabConfig() {
  const [open, setOpen] = useState(false);
  const [ciSession, setCiSession] = useState('');
  const [serverId, setServerId] = useState('1');
  const [hasSession, setHasSession] = useState(false);
  const { toast } = useToast();

  // Cargar valores guardados
  useEffect(() => {
    const savedSession = localStorage.getItem(FICHAB_SESSION_KEY);
    const savedServerId = localStorage.getItem(FICHAB_SERVERID_KEY);
    
    if (savedSession) {
      setCiSession(savedSession);
      setHasSession(true);
    }
    if (savedServerId) {
      setServerId(savedServerId);
    }
  }, [open]);

  const handleSave = () => {
    if (!ciSession.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Debe ingresar el ci_session'
      });
      return;
    }

    localStorage.setItem(FICHAB_SESSION_KEY, ciSession.trim());
    localStorage.setItem(FICHAB_SERVERID_KEY, serverId.trim() || '1');
    setHasSession(true);
    
    // Disparar evento para notificar a otros componentes
    window.dispatchEvent(new Event('fichab-session-updated'));

    toast({
      title: 'FICHAB configurado',
      description: 'Sesión guardada correctamente'
    });
    setOpen(false);
  };

  const handleClear = () => {
    localStorage.removeItem(FICHAB_SESSION_KEY);
    localStorage.removeItem(FICHAB_SERVERID_KEY);
    setCiSession('');
    setServerId('1');
    setHasSession(false);
    
    window.dispatchEvent(new Event('fichab-session-updated'));

    toast({
      title: 'Sesión eliminada',
      description: 'Configuración de FICHAB eliminada'
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="rounded-lg backdrop-blur-sm bg-white/40 dark:bg-gray-800/40 border border-white/20 dark:border-gray-700/30 relative"
          title="Configurar FICHAB"
        >
          <Database className="h-5 w-5" />
          {hasSession ? (
            <CheckCircle className="h-3 w-3 text-green-500 absolute -top-1 -right-1" />
          ) : (
            <XCircle className="h-3 w-3 text-red-500 absolute -top-1 -right-1" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="font-medium">Configuración FICHAB</h4>
            <p className="text-xs text-muted-foreground">
              Ingrese sus credenciales de sesión FICHAB
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="ci_session" className="text-xs">ci_session</Label>
              <Input
                id="ci_session"
                placeholder="Valor de ci_session"
                value={ciSession}
                onChange={(e) => setCiSession(e.target.value)}
                className="font-mono text-xs h-8"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="server_id" className="text-xs">SERVERID</Label>
              <Input
                id="server_id"
                placeholder="1"
                value={serverId}
                onChange={(e) => setServerId(e.target.value)}
                className="font-mono text-xs h-8"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} size="sm" className="flex-1">
              Guardar
            </Button>
            {hasSession && (
              <Button onClick={handleClear} variant="outline" size="sm">
                Limpiar
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
