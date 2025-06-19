'use client';

import { useState, ChangeEvent, FormEvent } from 'react';

interface FileUploadProps {
  onCompare: (file1: File, file2: File) => void;
}

export default function FileUpload({ onCompare }: FileUploadProps) {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);

  const handleFileChange =
    (setter: React.Dispatch<React.SetStateAction<File | null>>) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        setter(e.target.files[0]);
      }
    };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (file1 && file2) {
      onCompare(file1, file2);
    } else {
      alert('Por favor, selecciona dos imágenes.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="mb-2">
        <label htmlFor="file1" className="mb-1 block">
          Imagen 1:
        </label>
        <input
          type="file"
          id="file1"
          onChange={handleFileChange(setFile1)}
          accept="image/*"
          className="border p-2"
        />
      </div>
      <div className="mb-2">
        <label htmlFor="file2" className="mb-1 block">
          Imagen 2:
        </label>
        <input
          type="file"
          id="file2"
          onChange={handleFileChange(setFile2)}
          accept="image/*"
          className="border p-2"
        />
      </div>
      <button
        type="submit"
        className="rounded bg-blue-500 px-4 py-2 text-white"
      >
        Comparar
      </button>
    </form>
  );
}
