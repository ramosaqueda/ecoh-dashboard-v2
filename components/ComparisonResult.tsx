import { ComparisonResultType } from '@/types/compare';

interface ComparisonResultProps {
  result: ComparisonResultType;
}

export default function ComparisonResult({ result }: ComparisonResultProps) {
  return (
    <div className="mt-4">
      <h2 className="mb-2 text-xl font-semibold">
        Resultado de la comparación:
      </h2>
      <p>Similitud: {result.similarity}%</p>
      <ul>
        {result.matchingFaces.map((face, index) => (
          <li key={index}>
            Rostro {index + 1}: Confianza {face.confidence}%
          </li>
        ))}
      </ul>
    </div>
  );
}
