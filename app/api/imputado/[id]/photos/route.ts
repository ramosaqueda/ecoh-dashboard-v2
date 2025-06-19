// app/api/imputado/[id]/photos/route.ts
import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
 

    const imputadoId = parseInt((await params).id);

    if (isNaN(imputadoId)) {
      return NextResponse.json(
        { error: 'ID de imputado inválido' },
        { status: 400 }
      );
    }

    const fotos = await prisma.fotografia.findMany({
      where: {
        imputadoId,
        NOT: {
          url: null
        }
      },
      select: {
        id: true,
        url: true,
        filename: true,
        esPrincipal: true,
        createdAt: true
      },
      orderBy: [{ esPrincipal: 'desc' }, { createdAt: 'desc' }]
    });

    console.log('Found photos:', fotos);
    return NextResponse.json(fotos);
  } catch (error) {
    console.error('Error in GET /api/imputado/[id]/photos:', error);
    return NextResponse.json(
      { error: 'Error al obtener fotos' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No se ha proporcionado ningún archivo' },
        { status: 400 }
      );
    }

    const imputadoId = parseInt((await params).id);

    // Verificar que el imputado existe y contar sus fotos actuales
    const imputado = await prisma.imputado.findUnique({
      where: { id: imputadoId },
      include: {
        fotografias: {
          select: { id: true }
        }
      }
    });

    if (!imputado) {
      return NextResponse.json(
        { error: 'Imputado no encontrado' },
        { status: 404 }
      );
    }

    if (imputado.fotografias.length >= 4) {
      return NextResponse.json(
        { error: 'El imputado ya tiene el máximo de 4 fotos permitidas' },
        { status: 400 }
      );
    }

    // Verificar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            'Tipo de archivo no permitido. Solo se permiten imágenes JPEG, PNG y WebP'
        },
        { status: 400 }
      );
    }

    // Verificar tamaño del archivo (5MB máximo)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'El archivo excede el tamaño máximo permitido de 5MB' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generar nombre de archivo único
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const path = join(process.cwd(), 'public/uploads', fileName);

    // Guardar archivo
    await writeFile(path, buffer);

    // Determinar si es la primera foto (será la principal)
    const esPrincipal = imputado.fotografias.length === 0;

    // Crear registro en base de datos
    const foto = await prisma.fotografia.create({
      data: {
        url: `/uploads/${fileName}`,
        filename: file.name,
        imputadoId,
        esPrincipal
      }
    });

    // Si es la primera foto, actualizar la foto principal del imputado
    if (esPrincipal) {
      await prisma.imputado.update({
        where: { id: imputadoId },
        data: { fotoPrincipal: `/uploads/${fileName}` }
      });
    }

    return NextResponse.json(foto, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al procesar la foto' },
      { status: 500 }
    );
  }
}
