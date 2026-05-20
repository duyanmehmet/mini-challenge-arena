import type { QuizQuestion } from '../../types/quiz';

// En çok kullanılan İngilizce kelimeler — Türkçe anlamlarıyla
const english: QuizQuestion[] = [
  // A1 - Temel Kelimeler
  { q: '"Happy" kelimesinin Türkçe anlamı nedir?', a: ['Üzgün','Mutlu','Kızgın','Yorgun'], c: 1, e: 'Happy = Mutlu. "I am happy today." = "Bugün mutluyum."', d: 1 },
  { q: '"Beautiful" kelimesinin Türkçe anlamı nedir?', a: ['Çirkin','Korkutucu','Güzel','Küçük'], c: 2, e: 'Beautiful = Güzel. Çok güçlü bir sıfat.', d: 1 },
  { q: '"Friend" kelimesinin Türkçe anlamı nedir?', a: ['Düşman','Arkadaş','Yabancı','Komşu'], c: 1, e: 'Friend = Arkadaş. Best friend = En iyi arkadaş.', d: 1 },
  { q: '"House" kelimesinin Türkçe anlamı nedir?', a: ['Araba','Okul','Ev','Ofis'], c: 2, e: 'House = Ev. Home da ev anlamına gelir ama daha "yuva" hissi verir.', d: 1 },
  { q: '"Water" kelimesinin Türkçe anlamı nedir?', a: ['Ateş','Su','Hava','Toprak'], c: 1, e: 'Water = Su. "Can I have some water?" = "Biraz su alabilir miyim?"', d: 1 },
  { q: '"Book" kelimesinin Türkçe anlamı nedir?', a: ['Kalem','Kitap','Defter','Masa'], c: 1, e: 'Book = Kitap. Aynı zamanda "rezervasyon yapmak" fiili olarak da kullanılır.', d: 1 },
  { q: '"Time" kelimesinin Türkçe anlamı nedir?', a: ['Yer','Zaman','Para','İş'], c: 1, e: 'Time = Zaman/Vakit. "What time is it?" = "Saat kaç?"', d: 1 },
  { q: '"Work" kelimesinin Türkçe anlamı nedir?', a: ['Oynamak','Çalışmak','Uyumak','Yemek'], c: 1, e: 'Work = Çalışmak / İş. Hem fiil hem isim olarak kullanılır.', d: 1 },
  { q: '"Love" kelimesinin Türkçe anlamı nedir?', a: ['Nefret','Korku','Sevgi','Üzüntü'], c: 2, e: 'Love = Sevgi/Aşk. "I love you" = "Seni seviyorum."', d: 1 },
  { q: '"Big" kelimesinin Türkçe anlamı nedir?', a: ['Küçük','Büyük','Uzak','Yakın'], c: 1, e: 'Big = Büyük. Large da aynı anlama gelir.', d: 1 },

  // A2 - Orta Seviye
  { q: '"Understand" kelimesinin Türkçe anlamı nedir?', a: ['Anlamak','Yazmak','Okumak','Konuşmak'], c: 0, e: 'Understand = Anlamak. "Do you understand?" = "Anlıyor musun?"', d: 2 },
  { q: '"Important" kelimesinin Türkçe anlamı nedir?', a: ['Tehlikeli','Önemli','Ucuz','Uzak'], c: 1, e: 'Important = Önemli. "This is very important." = "Bu çok önemli."', d: 2 },
  { q: '"Remember" kelimesinin Türkçe anlamı nedir?', a: ['Unutmak','Hatırlamak','Öğrenmek','Görmek'], c: 1, e: 'Remember = Hatırlamak. Forget = Unutmak (zıt anlamlısı).', d: 2 },
  { q: '"Choose" kelimesinin Türkçe anlamı nedir?', a: ['Kaybetmek','Bulmak','Seçmek','Vermek'], c: 2, e: 'Choose = Seçmek. "You can choose one." = "Birini seçebilirsin."', d: 2 },
  { q: '"Strong" kelimesinin Türkçe anlamı nedir?', a: ['Zayıf','Güçlü','Yumuşak','Sessiz'], c: 1, e: 'Strong = Güçlü/Sağlam. Weak = Zayıf (zıt anlamlısı).', d: 2 },
  { q: '"Different" kelimesinin Türkçe anlamı nedir?', a: ['Aynı','Benzer','Farklı','Yakın'], c: 2, e: 'Different = Farklı. Same = Aynı (zıt anlamlısı).', d: 2 },
  { q: '"Possible" kelimesinin Türkçe anlamı nedir?', a: ['İmkânsız','Mümkün','Zorunlu','Gerekli'], c: 1, e: 'Possible = Mümkün. Impossible = İmkânsız (zıt anlamlısı).', d: 2 },
  { q: '"Explain" kelimesinin Türkçe anlamı nedir?', a: ['Sormak','Anlatmak/Açıklamak','Dinlemek','Cevaplamak'], c: 1, e: 'Explain = Açıklamak/Anlatmak. "Can you explain?" = "Açıklayabilir misin?"', d: 2 },
  { q: '"Decide" kelimesinin Türkçe anlamı nedir?', a: ['Şüphelenmek','Karar vermek','Beklemek','Sorgulamak'], c: 1, e: 'Decide = Karar vermek. "I decided to go." = "Gitmeye karar verdim."', d: 2 },
  { q: '"Promise" kelimesinin Türkçe anlamı nedir?', a: ['Tehdit','Söz/Vaat','Şikâyet','İstek'], c: 1, e: 'Promise = Söz/Vaat. "I promise!" = "Söz veriyorum!"', d: 2 },

  // B1 - İleri Seviye
  { q: '"Achieve" kelimesinin Türkçe anlamı nedir?', a: ['Başarısız olmak','Başarmak/Elde etmek','Denemek','Kaçmak'], c: 1, e: 'Achieve = Başarmak, elde etmek. "Achieve your goals" = "Hedeflerine ulaş."', d: 3 },
  { q: '"Challenge" kelimesinin Türkçe anlamı nedir?', a: ['Kaçınmak','Reddetmek','Meydan okumak','Kabul etmek'], c: 2, e: 'Challenge = Meydan okumak / Zorluk. "A big challenge" = "Büyük bir zorluk."', d: 3 },
  { q: '"Significant" kelimesinin Türkçe anlamı nedir?', a: ['Önemsiz','Önemli/Anlamlı','Küçük','Belirsiz'], c: 1, e: 'Significant = Önemli, anlamlı. Important ile benzer ama daha resmi.', d: 3 },
  { q: '"Opportunity" kelimesinin Türkçe anlamı nedir?', a: ['Tehlike','Sorun','Fırsat','Engel'], c: 2, e: 'Opportunity = Fırsat. "A great opportunity" = "Harika bir fırsat."', d: 3 },
  { q: '"Maintain" kelimesinin Türkçe anlamı nedir?', a: ['Bozmak','Sürdürmek/Korumak','Yaratmak','Yıkmak'], c: 1, e: 'Maintain = Sürdürmek, korumak. "Maintain a healthy lifestyle" = "Sağlıklı yaşamı sürdür."', d: 3 },
  { q: '"Consequence" kelimesinin Türkçe anlamı nedir?', a: ['Sebep','Çözüm','Sonuç','Plan'], c: 2, e: 'Consequence = Sonuç, netice. "As a consequence" = "Sonuç olarak."', d: 3 },
  { q: '"Efficient" kelimesinin Türkçe anlamı nedir?', a: ['Verimsiz','Verimli/Etkin','Pahalı','Yorucu'], c: 1, e: 'Efficient = Verimli, etkin. "An efficient system" = "Verimli bir sistem."', d: 3 },
  { q: '"Appreciate" kelimesinin Türkçe anlamı nedir?', a: ['Şikâyet etmek','Reddetmek','Takdir etmek','Görmezden gelmek'], c: 2, e: 'Appreciate = Takdir etmek, değerini bilmek. "I appreciate it" = "Takdir ediyorum."', d: 3 },
  { q: '"Determine" kelimesinin Türkçe anlamı nedir?', a: ['Şüphelenmek','Belirlemek/Kararlı olmak','Kaçınmak','Ertelemek'], c: 1, e: 'Determine = Belirlemek. "Determined" = Kararlı.', d: 3 },
  { q: '"Contribute" kelimesinin Türkçe anlamı nedir?', a: ['Almak','Katkıda bulunmak','Engellemek','Bozmak'], c: 1, e: 'Contribute = Katkıda bulunmak. "Contribute to society" = "Topluma katkıda bulun."', d: 3 },

  // Günlük İfadeler
  { q: '"What\'s up?" ifadesi ne anlama gelir?', a: ['Yukarıda ne var?','Nasılsın? / Ne var ne yok?','Adresi ne?','Ne zaman?'], c: 1, e: '"What\'s up?" = Ne var ne yok? / Nasılsın? Günlük konuşmada sık kullanılır.', d: 2 },
  { q: '"Take it easy" ifadesi ne anlama gelir?', a: ['Kolayı al','Endişelenme / Rahat ol','Çabuk ol','Dikkatli ol'], c: 1, e: '"Take it easy" = Rahat ol, endişelenme. Veda ifadesi olarak da kullanılır.', d: 2 },
  { q: '"By the way" ifadesi ne anlama gelir?', a: ['Bu arada','Yol ile','Her neyse','Ayrıca'], c: 0, e: '"By the way" = Bu arada. Konu değiştirirken kullanılır.', d: 2 },
  { q: '"As soon as possible" ne anlama gelir?', a: ['Mümkün olduğunca geç','En kısa sürede','Zaman zaman','Hemen hemen'], c: 1, e: '"As soon as possible" (ASAP) = En kısa sürede, mümkün olan en kısa zamanda.', d: 2 },
  { q: '"Keep in touch" ne anlama gelir?', a: ['Uzaklaş','İletişimi koru','Sessiz kal','Hızlı git'], c: 1, e: '"Keep in touch" = İletişimi koru, haberleş. Veda ederken kullanılır.', d: 2 },

  // Zıt Anlamlılar
  { q: '"Ancient" kelimesinin zıt anlamlısı nedir?', a: ['Eski','Antik','Modern','Büyük'], c: 2, e: 'Ancient = Eski, antik. Zıt anlamlısı Modern (çağdaş, yeni).', d: 2 },
  { q: '"Generous" kelimesinin Türkçe anlamı nedir?', a: ['Cimri','Cömert','Kıskanç','Bencil'], c: 1, e: 'Generous = Cömert. Stingy/Greedy = Cimri (zıt anlamlısı).', d: 2 },
  { q: '"Brave" kelimesinin Türkçe anlamı nedir?', a: ['Korkak','Cesur','Tembel','Akıllı'], c: 1, e: 'Brave = Cesur. Coward = Korkak (zıt anlamlısı).', d: 2 },

  // İş ve Kariyer
  { q: '"Experience" kelimesinin Türkçe anlamı nedir?', a: ['Bilgisizlik','Deneyim/Tecrübe','Eğitim','Yetenek'], c: 1, e: 'Experience = Deneyim, tecrübe. "Work experience" = "İş deneyimi."', d: 2 },
  { q: '"Deadline" kelimesinin Türkçe anlamı nedir?', a: ['Başlangıç tarihi','Son teslim tarihi','Tatil günü','Toplantı'], c: 1, e: 'Deadline = Son teslim tarihi. "The deadline is Friday." = "Son tarih Cuma."', d: 2 },

  // Teknoloji
  { q: '"Download" kelimesinin Türkçe anlamı nedir?', a: ['Yüklemek','İndirmek','Silmek','Açmak'], c: 1, e: 'Download = İndirmek (internetten). Upload = Yüklemek (zıt anlamlısı).', d: 1 },
  { q: '"Password" kelimesinin Türkçe anlamı nedir?', a: ['Kullanıcı adı','E-posta','Şifre/Parola','Hesap'], c: 2, e: 'Password = Şifre, parola. "Enter your password" = "Şifrenizi girin."', d: 1 },
  { q: '"Update" kelimesinin Türkçe anlamı nedir?', a: ['Silmek','Güncellemek','Kurmak','Kapatmak'], c: 1, e: 'Update = Güncellemek. "Software update" = "Yazılım güncellemesi."', d: 1 },

  // Sayılar ve Rakamlar
  { q: '"Dozen" kelimesi kaç anlamına gelir?', a: ['5','10','12','20'], c: 2, e: '"A dozen" = 12. "A dozen eggs" = "12 yumurta."', d: 2 },
  { q: '"Couple" kelimesi genellikle kaç anlamında kullanılır?', a: ['1','2','5','10'], c: 1, e: '"A couple of" = 2 ya da birkaç. "A couple of days" = "Birkaç gün."', d: 2 },

  // Sağlık
  { q: '"Headache" kelimesinin Türkçe anlamı nedir?', a: ['Karın ağrısı','Baş ağrısı','Diş ağrısı','Boyun ağrısı'], c: 1, e: 'Headache = Baş ağrısı. Head = Baş + Ache = Ağrı.', d: 1 },
  { q: '"Fever" kelimesinin Türkçe anlamı nedir?', a: ['Öksürük','Yorgunluk','Ateş (hastalık)','Burun akıntısı'], c: 2, e: 'Fever = Ateş (hastalık). "I have a fever" = "Ateşim var."', d: 2 },
];

export default english;
