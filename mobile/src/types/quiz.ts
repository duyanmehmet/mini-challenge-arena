export interface QuizQuestion {
  q: string;    // soru metni
  a: string[];  // tam olarak 4 seçenek
  c: number;    // doğru cevabın indeksi (0–3)
  e?: string;   // açıklama — doğru/yanlış sonrası gösterilir
}
