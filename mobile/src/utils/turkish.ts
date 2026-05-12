export const normalizeTurkish = (text: string): string => {
  return text
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .toLowerCase()
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u');
};

export const compareTurkish = (a: string, b: string): boolean => {
  return normalizeTurkish(a) === normalizeTurkish(b);
};
