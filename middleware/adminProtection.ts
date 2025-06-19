// middleware/adminProtection.ts
import { Role, hasPermission } from '@/utils/roles';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function adminProtection() {
  // 🔧 SOLUCIÓN: Agregar await para resolver la Promise
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.redirect(
      new URL('/', process.env.NEXT_PUBLIC_BASE_URL!)
    );
  }

  try {
    // Obtener el usuario de la base de datos con la relación del rol
    const user = await prisma.usuario.findUnique({
      where: { clerk_id: userId },
      include: {
        rol: true // Incluir la relación del rol
      }
    });

    if (!user || !hasPermission(user.rol.nombre as Role, Role.ADMIN)) {
      return NextResponse.redirect(
        new URL('/', process.env.NEXT_PUBLIC_BASE_URL!)
      );
    }

    // 🆕 OPCIONAL: Retornar el usuario para uso posterior
    return { user };
  } catch (error) {
    console.error('Error checking user role:', error);
    return NextResponse.redirect(
      new URL('/', process.env.NEXT_PUBLIC_BASE_URL!)
    );
  }
}