'use client';

import { UserButton } from '@clerk/nextjs';
import { useClerk } from '@clerk/nextjs'; // ← Agregar esta importación
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useSession } from '@clerk/clerk-react';

export function UserNav() {
  const { isLoaded, session, isSignedIn } = useSession();
  const { signOut } = useClerk(); // ← Obtener signOut del hook

  if (session) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <UserButton afterSwitchSessionUrl="/" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {session.user.firstName} {session.user.lastName}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {session.user.primaryEmailAddress?.emailAddress || 'No email disponible'}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              Profile
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Billing
              <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Settings
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>New Team</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut({ redirectUrl: '/' })}>
            Log out
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return null; // ← Agregar return por si no hay sesión
}