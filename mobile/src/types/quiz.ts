export interface QuizQuestion {
  q: string;    // soru metni
  a: string[];  // tam olarak 4 seçenek
  c: number;    // doğru cevabın indeksi (0–3)
  e?: string;   // açıklama — doğru/yanlış sonrası gösterilir
  d?: 1 | 2 | 3; // zorluk: 1=kolay, 2=orta, 3=zor
}
