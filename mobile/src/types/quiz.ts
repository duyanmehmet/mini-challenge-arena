export interface QuizQuestion {
  q: string;    // soru metni veya kelime
  a: string[];  // tam olarak 4 seçenek
  c: number;    // doğru cevabın indeksi (0–3)
}
