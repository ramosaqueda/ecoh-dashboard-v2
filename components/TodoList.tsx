'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface Todo {
  id: number;
  descripcion: string;
  completada: boolean;
  actividadId: number;
}

interface TodoListProps {
  actividadId: number;
}

export default function TodoList({ actividadId }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTodos();
  }, [actividadId]);

  const fetchTodos = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/todos?actividadId=${actividadId}`);
      if (!response.ok) throw new Error('Error al cargar tareas');
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar las tareas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          descripcion: newTodo.trim(),
          actividadId,
          completada: false,
        }),
      });

      if (!response.ok) throw new Error('Error al crear tarea');

      const todoCreada = await response.json();
      setTodos(prev => [...prev, todoCreada]);
      setNewTodo('');
      toast.success('Tarea creada exitosamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al crear la tarea');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTodo = async (todoId: number, completada: boolean) => {
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completada }),
      });

      if (!response.ok) throw new Error('Error al actualizar tarea');

      setTodos(prev =>
        prev.map(todo =>
          todo.id === todoId ? { ...todo, completada } : todo
        )
      );
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar la tarea');
    }
  };

  const handleDeleteTodo = async (todoId: number) => {
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar tarea');

      setTodos(prev => prev.filter(todo => todo.id !== todoId));
      toast.success('Tarea eliminada exitosamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar la tarea');
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Cargando tareas...</div>;
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAddTodo} className="flex gap-2">
        <Input
          placeholder="Agregar nueva tarea..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          disabled={isSubmitting}
        />
        <Button type="submit" disabled={isSubmitting || !newTodo.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {todos.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No hay tareas registradas
          </p>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center gap-2 p-2 border rounded-md"
            >
              <Checkbox
                checked={todo.completada}
                onCheckedChange={(checked) =>
                  handleToggleTodo(todo.id, checked as boolean)
                }
              />
              <span
                className={`flex-1 ${
                  todo.completada
                    ? 'line-through text-muted-foreground'
                    : ''
                }`}
              >
                {todo.descripcion}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteTodo(todo.id)}
                className="h-6 w-6"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))
        )}
      </div>

      {todos.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {todos.filter(todo => todo.completada).length} de {todos.length} tareas completadas
        </div>
      )}
    </div>
  );
}