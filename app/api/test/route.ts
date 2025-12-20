
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const keys = Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$'));
  return NextResponse.json({ 
    keys,
    hasUsuario: 'usuario' in prisma,
    hasUsuarios: 'usuarios' in prisma,
    hasU: !!prisma['usuario'],
    hasUs: !!prisma['usuarios']
  });
}
