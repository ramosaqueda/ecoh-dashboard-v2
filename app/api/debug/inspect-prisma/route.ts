
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const keys = Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$'));
  // Also try to inspect the dmmf or model names if accessible, but keys usually show the delegate names
  return NextResponse.json({ 
    keys,
    hasUsuario: 'usuario' in prisma,
    hasUsuarios: 'usuarios' in prisma,
    hasUser: 'user' in prisma
  });
}
