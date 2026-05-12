// Bazı yaygın Türkçe kelimelerin kısa açıklamaları
export const WORD_HINTS: Record<string, string> = {
  ELMA: "Meyve türü, çoğunlukla kırmızı veya yeşil",
  MASA: "Üzerine eşya koyulan mobilya",
  KALE: "Savunma yapısı veya futbol kalesi",
  ARABA: "Motorlu kara taşıtı",
  KALEM: "Yazı yazmak için kullanılan araç",
  BALIK: "Suda yaşayan omurgalı hayvan",
  DENIZ: "Geniş tuzlu su kitlesi",
  KITAP: "Sayfaları ciltli yazılı eser",
  OKUL: "Eğitim verilen kurum",
  BULUT: "Gökyüzündeki su buharı kümesi",
  GÜNEŞ: "Güneş sistemi merkezi yıldızı",
  YILDIZ: "Gökyüzünde parlayan gök cismi",
  TOPRAK: "Yeryüzünün üst katmanı",
  ORMAN: "Ağaçlarla kaplı geniş alan",
  ÇIÇEK: "Bitkinin üreme organı",
  KUŞLAR: "Kanatlı omurgalı hayvanlar",
  ZAMAN: "Geçmişten geleceğe akan süreç",
  BÜYÜK: "Boyutu veya miktarı fazla olan",
  KÜÇÜK: "Boyutu veya miktarı az olan",
  HIZLI: "Yüksek hızla hareket eden",
  YAVAŞ: "Düşük hızla hareket eden",
};

export function getWordHint(word: string): string | null {
  return WORD_HINTS[word.toUpperCase()] ?? null;
}