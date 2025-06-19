// app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { mkdir } from 'fs/promises';

export async function POST(request: Request) {
  try {
    // Autorización desactivada temporalmente
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new NextResponse(JSON.stringify({ error: "No se ha proporcionado un archivo" }), {
        status: 400,
      });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return new NextResponse(JSON.stringify({ error: "Tipo de archivo no permitido" }), {
        status: 400,
      });
    }

    // Get file extension
    const fileExtension = file.name.split('.').pop() || '';
    const fileName = `${uuidv4()}.${fileExtension}`;
    
    // Create directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public/uploads');
    
    try {
      // Ensure the directory exists
      await mkdir(uploadDir, { recursive: true });
      
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Write the file to the directory
      const filePath = join(uploadDir, fileName);
      await writeFile(filePath, buffer);

      // Return the URL to the uploaded file
      const fileUrl = `api/uploads/${fileName}`;
      return NextResponse.json({ url: fileUrl });
    } catch (error) {
      console.error('Error writing file:', error);
      return new NextResponse(JSON.stringify({ error: "Error al guardar el archivo" }), {
        status: 500,
      });
    }
  } catch (error) {
    console.error('Error processing upload:', error);
    return new NextResponse(JSON.stringify({ error: "Error al procesar la solicitud" }), { status: 500 });
  }
}

// Configure request size limit
export const config = {
  api: {
    bodyParser: false, // Disabling the bodyParser for file uploads
    responseLimit: false, // No response size limit 
  },
};