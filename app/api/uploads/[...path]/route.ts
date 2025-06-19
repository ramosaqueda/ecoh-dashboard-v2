// app/api/uploads/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(request: NextRequest) {
  try {
    // Extraer path de la URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/').slice(3); // Remove /api/uploads
    
    if (!pathSegments || pathSegments.length === 0) {
      return NextResponse.json({ message: 'Invalid file path' }, { status: 400 });
    }

    // Construir ruta completa del archivo
    const fullPath = path.join(process.cwd(), 'public', 'uploads', ...pathSegments);
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Verificar seguridad: archivo debe estar dentro de uploads
    if (!fullPath.startsWith(uploadsDir)) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    // Verificar que el archivo existe
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ message: 'File not found' }, { status: 404 });
    }

    // Verificar extensión permitida
    const ext = path.extname(fullPath).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json({ message: 'File type not allowed' }, { status: 400 });
    }

    // Leer archivo
    const fileBuffer = fs.readFileSync(fullPath);
    const stat = fs.statSync(fullPath);
    
    // Determinar content type
    const contentTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };
    const contentType = contentTypes[ext] || 'application/octet-stream';
    
    // Crear respuesta con headers correctos
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': stat.size.toString(),
        'Cache-Control': 'public, max-age=86400',
        'ETag': `"${stat.mtime.getTime()}-${stat.size}"`,
      },
    });
    
  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}