// utils/runValidator.ts

export const formatRun = (run: string): string => {
  // Elimina todos los caracteres no numéricos excepto K y k
  let cleaned = run.replace(/[^\dKk-]/g, '');

  // Si tiene más de 9 caracteres (sin contar el guion), corta el exceso
  if (cleaned.length > 10) {
    cleaned = cleaned.slice(0, 10);
  }

  // Formatea el RUN con puntos y guion
  if (cleaned.length > 1) {
    const parts = cleaned.split('-');
    const number = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const dv = parts[1] || '';
    cleaned = number + (dv ? '-' + dv : '');
  }

  return cleaned;
};

export const validateRun = (run: string): boolean => {
  // Elimina puntos y guiones
  const cleanRun = run.replace(/[.-]/g, '');

  // Verifica que tenga el largo correcto
  if (cleanRun.length < 7 || cleanRun.length > 9) return false;

  // Separa el dígito verificador
  const body = cleanRun.slice(0, -1);
  const dv = cleanRun.slice(-1).toUpperCase();

  // Verifica que el cuerpo sean solo números
  if (!/^\d+$/.test(body)) return false;

  // Calcula el dígito verificador
  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const expectedDV = 11 - (sum % 11);
  const calculatedDV =
    expectedDV === 11 ? '0' : expectedDV === 10 ? 'K' : expectedDV.toString();

  return dv === calculatedDV;
};
