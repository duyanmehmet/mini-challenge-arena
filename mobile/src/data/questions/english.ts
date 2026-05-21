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

  // Temel Fiiller
  { q: '"Run" kelimesinin Türkçe anlamı nedir?', a: ['Yürümek','Koşmak','Atlamak','Oturmak'], c: 1, e: 'Run = Koşmak. "Run fast!" = "Hızlı koş!"', d: 1 },
  { q: '"Eat" kelimesinin Türkçe anlamı nedir?', a: ['İçmek','Uyumak','Yemek','Oynamak'], c: 2, e: 'Eat = Yemek. "What do you eat?" = "Ne yersin?"', d: 1 },
  { q: '"Sleep" kelimesinin Türkçe anlamı nedir?', a: ['Uyanmak','Uyumak','Dinlenmek','Oturmak'], c: 1, e: 'Sleep = Uyumak. "I need to sleep." = "Uyumam lazım."', d: 1 },
  { q: '"Speak" kelimesinin Türkçe anlamı nedir?', a: ['Dinlemek','Yazmak','Konuşmak','Okumak'], c: 2, e: 'Speak = Konuşmak. "Do you speak English?" = "İngilizce konuşuyor musun?"', d: 1 },
  { q: '"Buy" kelimesinin Türkçe anlamı nedir?', a: ['Satmak','Almak/Satın almak','Vermek','Ödemek'], c: 1, e: 'Buy = Satın almak. Sell = Satmak (zıt anlamlısı).', d: 1 },
  { q: '"Come" kelimesinin Türkçe anlamı nedir?', a: ['Gitmek','Gelmek','Kalmak','Dönmek'], c: 1, e: 'Come = Gelmek. Go = Gitmek (zıt anlamlısı).', d: 1 },
  { q: '"Give" kelimesinin Türkçe anlamı nedir?', a: ['Almak','Vermek','Göndermek','Tutmak'], c: 1, e: 'Give = Vermek. Take = Almak (zıt anlamlısı).', d: 1 },
  { q: '"Know" kelimesinin Türkçe anlamı nedir?', a: ['Öğrenmek','Bilmek','Unutmak','Tahmin etmek'], c: 1, e: 'Know = Bilmek. "I don\'t know." = "Bilmiyorum."', d: 1 },
  { q: '"Think" kelimesinin Türkçe anlamı nedir?', a: ['Hissetmek','Görmek','Düşünmek','İnanmak'], c: 2, e: 'Think = Düşünmek. "I think so." = "Öyle düşünüyorum."', d: 1 },
  { q: '"Feel" kelimesinin Türkçe anlamı nedir?', a: ['Düşünmek','Hissetmek','Görmek','Duymak'], c: 1, e: 'Feel = Hissetmek. "How do you feel?" = "Nasıl hissediyorsun?"', d: 1 },
  { q: '"Leave" kelimesinin Türkçe anlamı nedir?', a: ['Gelmek','Kalmak','Ayrılmak/Bırakmak','Gitmek'], c: 2, e: 'Leave = Ayrılmak, bırakmak. "I\'m leaving now." = "Şimdi ayrılıyorum."', d: 2 },
  { q: '"Need" kelimesinin Türkçe anlamı nedir?', a: ['İstemek','İhtiyaç duymak','Sevmek','Denemek'], c: 1, e: 'Need = İhtiyaç duymak. "I need help." = "Yardıma ihtiyacım var."', d: 1 },
  { q: '"Wait" kelimesinin Türkçe anlamı nedir?', a: ['Koşmak','Beklemek','Durmak','Gitmek'], c: 1, e: 'Wait = Beklemek. "Wait for me!" = "Beni bekle!"', d: 1 },
  { q: '"Help" kelimesinin Türkçe anlamı nedir?', a: ['Engellemek','Yardım etmek','Zorlamak','Reddetmek'], c: 1, e: 'Help = Yardım etmek. "Can you help me?" = "Bana yardım edebilir misin?"', d: 1 },
  { q: '"Start" kelimesinin Türkçe anlamı nedir?', a: ['Bitirmek','Durdurmak','Başlamak','Devam etmek'], c: 2, e: 'Start = Başlamak. Finish/End = Bitirmek (zıt anlamlısı).', d: 1 },
  { q: '"Try" kelimesinin Türkçe anlamı nedir?', a: ['Vazgeçmek','Denemek','Başarmak','Beklemek'], c: 1, e: 'Try = Denemek. "Try again!" = "Tekrar dene!"', d: 1 },
  { q: '"Show" kelimesinin Türkçe anlamı nedir?', a: ['Saklamak','Göstermek','Bulmak','Kaybetmek'], c: 1, e: 'Show = Göstermek. "Show me!" = "Göster bana!"', d: 1 },
  { q: '"Ask" kelimesinin Türkçe anlamı nedir?', a: ['Cevaplamak','Sormak','Söylemek','Dinlemek'], c: 1, e: 'Ask = Sormak. Answer = Cevaplamak (zıt anlamlısı).', d: 1 },
  { q: '"Find" kelimesinin Türkçe anlamı nedir?', a: ['Kaybetmek','Aramak','Bulmak','Saklamak'], c: 2, e: 'Find = Bulmak. Lose = Kaybetmek (zıt anlamlısı).', d: 1 },
  { q: '"Open" kelimesinin Türkçe anlamı nedir?', a: ['Kapatmak','Açmak','Kırmak','Taşımak'], c: 1, e: 'Open = Açmak. Close/Shut = Kapatmak (zıt anlamlısı).', d: 1 },
  { q: '"Bring" kelimesinin Türkçe anlamı nedir?', a: ['Götürmek','Bırakmak','Getirmek','Atmak'], c: 2, e: 'Bring = Getirmek. Take = Götürmek (zıt anlamlısı).', d: 1 },
  { q: '"Put" kelimesinin Türkçe anlamı nedir?', a: ['Almak','Koymak/Yerleştirmek','Kaldırmak','Taşımak'], c: 1, e: 'Put = Koymak. "Put it here." = "Buraya koy."', d: 1 },
  { q: '"Keep" kelimesinin Türkçe anlamı nedir?', a: ['Vermek','Atmak','Tutmak/Saklamak','Kaybetmek'], c: 2, e: 'Keep = Tutmak, saklamak. "Keep it!" = "Sakla onu!"', d: 2 },
  { q: '"Change" kelimesinin Türkçe anlamı nedir?', a: ['Korumak','Değiştirmek','Tekrarlamak','Sürdürmek'], c: 1, e: 'Change = Değiştirmek. "Change your mind." = "Fikrini değiştir."', d: 1 },
  { q: '"Meet" kelimesinin Türkçe anlamı nedir?', a: ['Ayrılmak','Tanışmak/Buluşmak','Kaçmak','Beklemek'], c: 1, e: 'Meet = Tanışmak, buluşmak. "Nice to meet you!" = "Tanıştığımıza memnun oldum!"', d: 1 },

  // Renk ve Şekil
  { q: '"Red" kelimesinin Türkçe anlamı nedir?', a: ['Mavi','Yeşil','Kırmızı','Sarı'], c: 2, e: 'Red = Kırmızı. "Red rose" = "Kırmızı gül."', d: 1 },
  { q: '"Blue" kelimesinin Türkçe anlamı nedir?', a: ['Kırmızı','Mavi','Yeşil','Mor'], c: 1, e: 'Blue = Mavi. "Blue sky" = "Mavi gökyüzü."', d: 1 },
  { q: '"Green" kelimesinin Türkçe anlamı nedir?', a: ['Sarı','Turuncu','Yeşil','Kahverengi'], c: 2, e: 'Green = Yeşil. "Green park" = "Yeşil park."', d: 1 },
  { q: '"Yellow" kelimesinin Türkçe anlamı nedir?', a: ['Beyaz','Sarı','Siyah','Gri'], c: 1, e: 'Yellow = Sarı. "Yellow sunflower" = "Sarı ayçiçeği."', d: 1 },
  { q: '"Black" kelimesinin Türkçe anlamı nedir?', a: ['Beyaz','Gri','Siyah','Lacivert'], c: 2, e: 'Black = Siyah. White = Beyaz (zıt anlamlısı).', d: 1 },
  { q: '"White" kelimesinin Türkçe anlamı nedir?', a: ['Siyah','Gri','Krem','Beyaz'], c: 3, e: 'White = Beyaz. Black = Siyah (zıt anlamlısı).', d: 1 },
  { q: '"Purple" kelimesinin Türkçe anlamı nedir?', a: ['Pembe','Turuncu','Mor','Lacivert'], c: 2, e: 'Purple = Mor. "Purple grape" = "Mor üzüm."', d: 1 },
  { q: '"Orange" kelimesinin Türkçe anlamı nedir?', a: ['Sarı','Turuncu','Kırmızı','Pembe'], c: 1, e: 'Orange = Turuncu (hem renk hem meyve). "Orange juice" = "Portakal suyu."', d: 1 },

  // Zaman ve Tarih
  { q: '"Yesterday" kelimesinin Türkçe anlamı nedir?', a: ['Yarın','Bugün','Dün','Geçen hafta'], c: 2, e: 'Yesterday = Dün. Today = Bugün, Tomorrow = Yarın.', d: 1 },
  { q: '"Tomorrow" kelimesinin Türkçe anlamı nedir?', a: ['Dün','Bugün','Yarın','Önümüzdeki hafta'], c: 2, e: 'Tomorrow = Yarın. Yesterday = Dün (zıt anlamlısı).', d: 1 },
  { q: '"Always" kelimesinin Türkçe anlamı nedir?', a: ['Hiçbir zaman','Bazen','Her zaman','Nadiren'], c: 2, e: 'Always = Her zaman. Never = Hiçbir zaman (zıt anlamlısı).', d: 1 },
  { q: '"Never" kelimesinin Türkçe anlamı nedir?', a: ['Her zaman','Bazen','Nadiren','Hiçbir zaman'], c: 3, e: 'Never = Hiçbir zaman. "Never give up!" = "Asla pes etme!"', d: 1 },
  { q: '"Soon" kelimesinin Türkçe anlamı nedir?', a: ['Geç','Yakında/Kısa süre sonra','Nadiren','Uzun süre sonra'], c: 1, e: 'Soon = Yakında. "See you soon!" = "Görüşürüz yakında!"', d: 1 },
  { q: '"Late" kelimesinin Türkçe anlamı nedir?', a: ['Erken','Geç','Hızlı','Yavaş'], c: 1, e: 'Late = Geç. Early = Erken (zıt anlamlısı). "I\'m late!" = "Geç kaldım!"', d: 1 },
  { q: '"Early" kelimesinin Türkçe anlamı nedir?', a: ['Geç','Erken','Hızlı','Zamanında'], c: 1, e: 'Early = Erken. "Wake up early!" = "Erken uyan!"', d: 1 },
  { q: '"Daily" kelimesinin Türkçe anlamı nedir?', a: ['Haftalık','Aylık','Günlük','Yıllık'], c: 2, e: 'Daily = Günlük. Weekly = Haftalık, Monthly = Aylık.', d: 2 },
  { q: '"Weekly" kelimesinin Türkçe anlamı nedir?', a: ['Günlük','Haftalık','Aylık','Yıllık'], c: 1, e: 'Weekly = Haftalık. "Weekly meeting" = "Haftalık toplantı."', d: 2 },

  // Yiyecek ve İçecek
  { q: '"Breakfast" kelimesinin Türkçe anlamı nedir?', a: ['Öğle yemeği','Akşam yemeği','Kahvaltı','Atıştırmalık'], c: 2, e: 'Breakfast = Kahvaltı. "What\'s for breakfast?" = "Kahvaltıda ne var?"', d: 1 },
  { q: '"Lunch" kelimesinin Türkçe anlamı nedir?', a: ['Kahvaltı','Öğle yemeği','Akşam yemeği','Ara öğün'], c: 1, e: 'Lunch = Öğle yemeği. "Let\'s have lunch!" = "Öğle yemeği yiyelim!"', d: 1 },
  { q: '"Dinner" kelimesinin Türkçe anlamı nedir?', a: ['Kahvaltı','Öğle yemeği','Akşam yemeği','Gece yemeği'], c: 2, e: 'Dinner = Akşam yemeği. "Dinner is ready!" = "Akşam yemeği hazır!"', d: 1 },
  { q: '"Hungry" kelimesinin Türkçe anlamı nedir?', a: ['Tok','Aç','Susuz','Yorgun'], c: 1, e: 'Hungry = Aç. Full = Tok (zıt anlamlısı). "I\'m hungry!" = "Açım!"', d: 1 },
  { q: '"Thirsty" kelimesinin Türkçe anlamı nedir?', a: ['Aç','Tok','Susuz','Hasta'], c: 2, e: 'Thirsty = Susuz. "I\'m thirsty." = "Susadım."', d: 1 },
  { q: '"Delicious" kelimesinin Türkçe anlamı nedir?', a: ['Tatsız','Lezzetli','Acı','Tatlı'], c: 1, e: 'Delicious = Lezzetli, nefis. "It\'s delicious!" = "Çok lezzetli!"', d: 1 },
  { q: '"Sweet" kelimesinin Türkçe anlamı nedir?', a: ['Acı','Ekşi','Tuzlu','Tatlı'], c: 3, e: 'Sweet = Tatlı. Bitter = Acı (zıt anlamlısı).', d: 1 },
  { q: '"Bitter" kelimesinin Türkçe anlamı nedir?', a: ['Tatlı','Ekşi','Acı','Tuzlu'], c: 2, e: 'Bitter = Acı (tat). "Bitter coffee" = "Acı kahve."', d: 2 },
  { q: '"Milk" kelimesinin Türkçe anlamı nedir?', a: ['Su','Süt','Meyve suyu','Çay'], c: 1, e: 'Milk = Süt. "A glass of milk" = "Bir bardak süt."', d: 1 },
  { q: '"Bread" kelimesinin Türkçe anlamı nedir?', a: ['Pirinç','Makarna','Ekmek','Un'], c: 2, e: 'Bread = Ekmek. "Fresh bread" = "Taze ekmek."', d: 1 },
  { q: '"Chicken" kelimesinin Türkçe anlamı nedir?', a: ['Balık','Tavuk','Et','Dana'], c: 1, e: 'Chicken = Tavuk (yiyecek olarak). "Chicken soup" = "Tavuk çorbası."', d: 1 },

  // Ulaşım ve Seyahat
  { q: '"Airport" kelimesinin Türkçe anlamı nedir?', a: ['Liman','Tren garı','Havalimanı','Otobüs terminali'], c: 2, e: 'Airport = Havalimanı. "I\'m at the airport." = "Havalimanındayım."', d: 1 },
  { q: '"Ticket" kelimesinin Türkçe anlamı nedir?', a: ['Pasaport','Vize','Bilet','Rezervasyon'], c: 2, e: 'Ticket = Bilet. "Two tickets, please!" = "İki bilet lütfen!"', d: 1 },
  { q: '"Passport" kelimesinin Türkçe anlamı nedir?', a: ['Kimlik','Pasaport','Vize','Ehliyet'], c: 1, e: 'Passport = Pasaport. "Show your passport." = "Pasaportunuzu gösterin."', d: 1 },
  { q: '"Hotel" kelimesinin Türkçe anlamı nedir?', a: ['Restoran','Otel','Hastane','Okul'], c: 1, e: 'Hotel = Otel. "Book a hotel room." = "Otel odası ayırt."', d: 1 },
  { q: '"Journey" kelimesinin Türkçe anlamı nedir?', a: ['Tatil','Yolculuk','Macera','Keşif'], c: 1, e: 'Journey = Yolculuk. Trip ve Travel ile benzer anlam taşır.', d: 2 },
  { q: '"Departure" kelimesinin Türkçe anlamı nedir?', a: ['Varış','Kalkış/Ayrılış','Bekleme','Gecikmе'], c: 1, e: 'Departure = Kalkış, ayrılış. Arrival = Varış (zıt anlamlısı).', d: 2 },
  { q: '"Arrival" kelimesinin Türkçe anlamı nedir?', a: ['Kalkış','Varış','Gecikmе','Biniş'], c: 1, e: 'Arrival = Varış. Departure = Kalkış (zıt anlamlısı).', d: 2 },

  // Vücut ve Sağlık
  { q: '"Heart" kelimesinin Türkçe anlamı nedir?', a: ['Akciğer','Beyin','Kalp','Mide'], c: 2, e: 'Heart = Kalp. "Heart rate" = "Kalp atış hızı."', d: 1 },
  { q: '"Eye" kelimesinin Türkçe anlamı nedir?', a: ['Kulak','Burun','Göz','Ağız'], c: 2, e: 'Eye = Göz. "Beautiful eyes" = "Güzel gözler."', d: 1 },
  { q: '"Hand" kelimesinin Türkçe anlamı nedir?', a: ['Ayak','El','Kol','Parmak'], c: 1, e: 'Hand = El. "Wash your hands!" = "Ellerini yıka!"', d: 1 },
  { q: '"Leg" kelimesinin Türkçe anlamı nedir?', a: ['Kol','El','Bacak','Ayak'], c: 2, e: 'Leg = Bacak. "Broken leg" = "Kırık bacak."', d: 1 },
  { q: '"Healthy" kelimesinin Türkçe anlamı nedir?', a: ['Hasta','Yorgun','Sağlıklı','Zayıf'], c: 2, e: 'Healthy = Sağlıklı. Sick/Ill = Hasta (zıt anlamlısı).', d: 1 },
  { q: '"Medicine" kelimesinin Türkçe anlamı nedir?', a: ['Ameliyat','İlaç/Tıp','Doktor','Hastane'], c: 1, e: 'Medicine = İlaç veya tıp. "Take your medicine." = "İlacını al."', d: 1 },
  { q: '"Hospital" kelimesinin Türkçe anlamı nedir?', a: ['Eczane','Klinik','Hastane','Doktor'], c: 2, e: 'Hospital = Hastane. "Go to the hospital." = "Hastaneye git."', d: 1 },

  // Duygular ve Sıfatlar
  { q: '"Angry" kelimesinin Türkçe anlamı nedir?', a: ['Mutlu','Üzgün','Kızgın','Yorgun'], c: 2, e: 'Angry = Kızgın. "Don\'t be angry!" = "Kızma!"', d: 1 },
  { q: '"Sad" kelimesinin Türkçe anlamı nedir?', a: ['Mutlu','Üzgün','Korkmuş','Şaşırmış'], c: 1, e: 'Sad = Üzgün. Happy = Mutlu (zıt anlamlısı).', d: 1 },
  { q: '"Excited" kelimesinin Türkçe anlamı nedir?', a: ['Sıkılmış','Heyecanlı','Yorgun','Endişeli'], c: 1, e: 'Excited = Heyecanlı. "I\'m so excited!" = "Çok heyecanlıyım!"', d: 1 },
  { q: '"Tired" kelimesinin Türkçe anlamı nedir?', a: ['Dinç','Enerjik','Yorgun','Uyanık'], c: 2, e: 'Tired = Yorgun. "I\'m so tired." = "Çok yorgunum."', d: 1 },
  { q: '"Scared" kelimesinin Türkçe anlamı nedir?', a: ['Cesur','Güvenli','Korkmuş','Rahat'], c: 2, e: 'Scared = Korkmuş. "I\'m scared!" = "Korktum!"', d: 1 },
  { q: '"Surprised" kelimesinin Türkçe anlamı nedir?', a: ['Beklentili','Şaşırmış','Hayal kırıklığına uğramış','Memnun'], c: 1, e: 'Surprised = Şaşırmış. "I\'m surprised!" = "Şaşırdım!"', d: 1 },
  { q: '"Bored" kelimesinin Türkçe anlamı nedir?', a: ['Heyecanlı','Mutlu','Sıkılmış','Meraklı'], c: 2, e: 'Bored = Sıkılmış. "I\'m bored." = "Sıkıldım."', d: 1 },
  { q: '"Nervous" kelimesinin Türkçe anlamı nedir?', a: ['Rahat','Güvenli','Gergin/Sinirli','Mutlu'], c: 2, e: 'Nervous = Gergin. "I\'m nervous about the exam." = "Sınav için gerginim."', d: 2 },

  // Eğitim
  { q: '"School" kelimesinin Türkçe anlamı nedir?', a: ['Üniversite','Okul','Kütüphane','Sınıf'], c: 1, e: 'School = Okul. "Go to school." = "Okula git."', d: 1 },
  { q: '"Teacher" kelimesinin Türkçe anlamı nedir?', a: ['Öğrenci','Müdür','Öğretmen','Asistan'], c: 2, e: 'Teacher = Öğretmen. Student = Öğrenci.', d: 1 },
  { q: '"Student" kelimesinin Türkçe anlamı nedir?', a: ['Öğretmen','Öğrenci','Mezun','Stajyer'], c: 1, e: 'Student = Öğrenci. "I am a student." = "Öğrenciyim."', d: 1 },
  { q: '"Exam" kelimesinin Türkçe anlamı nedir?', a: ['Ödev','Sınav','Ders','Proje'], c: 1, e: 'Exam = Sınav. "Pass the exam." = "Sınavı geç."', d: 1 },
  { q: '"Homework" kelimesinin Türkçe anlamı nedir?', a: ['Sınav','Proje','Ev ödevi','Ders'], c: 2, e: 'Homework = Ev ödevi. "Do your homework!" = "Ödevini yap!"', d: 1 },
  { q: '"Learn" kelimesinin Türkçe anlamı nedir?', a: ['Öğretmek','Unutmak','Öğrenmek','Tekrarlamak'], c: 2, e: 'Learn = Öğrenmek. Teach = Öğretmek.', d: 1 },
  { q: '"Library" kelimesinin Türkçe anlamı nedir?', a: ['Kitapçı','Okul','Kütüphane','Arşiv'], c: 2, e: 'Library = Kütüphane. "Study in the library." = "Kütüphanede çalış."', d: 1 },

  // Ev ve Yaşam
  { q: '"Kitchen" kelimesinin Türkçe anlamı nedir?', a: ['Banyo','Yatak odası','Mutfak','Oturma odası'], c: 2, e: 'Kitchen = Mutfak. "Cook in the kitchen." = "Mutfakta pişir."', d: 1 },
  { q: '"Bedroom" kelimesinin Türkçe anlamı nedir?', a: ['Mutfak','Banyo','Yatak odası','Balkon'], c: 2, e: 'Bedroom = Yatak odası. "My bedroom is small." = "Yatak odam küçük."', d: 1 },
  { q: '"Window" kelimesinin Türkçe anlamı nedir?', a: ['Kapı','Pencere','Duvar','Tavan'], c: 1, e: 'Window = Pencere. "Open the window." = "Pencereyi aç."', d: 1 },
  { q: '"Door" kelimesinin Türkçe anlamı nedir?', a: ['Pencere','Kapı','Duvar','Merdiven'], c: 1, e: 'Door = Kapı. "Close the door." = "Kapıyı kapat."', d: 1 },
  { q: '"Clean" kelimesinin Türkçe anlamı nedir?', a: ['Kirli','Temiz','Düzenli','Dağınık'], c: 1, e: 'Clean = Temiz. Dirty = Kirli (zıt anlamlısı). "Keep it clean!" = "Temiz tut!"', d: 1 },
  { q: '"Dirty" kelimesinin Türkçe anlamı nedir?', a: ['Temiz','Parlak','Kirli','Düzgün'], c: 2, e: 'Dirty = Kirli. Clean = Temiz (zıt anlamlısı).', d: 1 },

  // Doğa ve Çevre
  { q: '"Mountain" kelimesinin Türkçe anlamı nedir?', a: ['Deniz','Nehir','Dağ','Orman'], c: 2, e: 'Mountain = Dağ. "Climb a mountain." = "Dağa tırman."', d: 1 },
  { q: '"River" kelimesinin Türkçe anlamı nedir?', a: ['Göl','Okyanus','Nehir','Dere'], c: 2, e: 'River = Nehir. "The river flows fast." = "Nehir hızlı akıyor."', d: 1 },
  { q: '"Forest" kelimesinin Türkçe anlamı nedir?', a: ['Çayır','Çöl','Orman','Bahçe'], c: 2, e: 'Forest = Orman. "Deep forest" = "Derin orman."', d: 1 },
  { q: '"Sun" kelimesinin Türkçe anlamı nedir?', a: ['Ay','Yıldız','Güneş','Bulut'], c: 2, e: 'Sun = Güneş. "The sun is shining." = "Güneş parlıyor."', d: 1 },
  { q: '"Moon" kelimesinin Türkçe anlamı nedir?', a: ['Güneş','Yıldız','Ay','Gök'], c: 2, e: 'Moon = Ay. "Full moon" = "Dolunay."', d: 1 },
  { q: '"Rain" kelimesinin Türkçe anlamı nedir?', a: ['Kar','Fırtına','Yağmur','Rüzgar'], c: 2, e: 'Rain = Yağmur. "It\'s raining." = "Yağmur yağıyor."', d: 1 },
  { q: '"Snow" kelimesinin Türkçe anlamı nedir?', a: ['Yağmur','Dolu','Kar','Buz'], c: 2, e: 'Snow = Kar. "It\'s snowing." = "Kar yağıyor."', d: 1 },
  { q: '"Wind" kelimesinin Türkçe anlamı nedir?', a: ['Yağmur','Güneş','Fırtına','Rüzgar'], c: 3, e: 'Wind = Rüzgar. "Strong wind." = "Güçlü rüzgar."', d: 1 },

  // İş Hayatı
  { q: '"Meeting" kelimesinin Türkçe anlamı nedir?', a: ['Sunum','Toplantı','Rapor','Proje'], c: 1, e: 'Meeting = Toplantı. "I have a meeting." = "Toplantım var."', d: 1 },
  { q: '"Manager" kelimesinin Türkçe anlamı nedir?', a: ['Çalışan','Müdür/Yönetici','Müşteri','Ortak'], c: 1, e: 'Manager = Müdür, yönetici. "My manager is strict." = "Müdürüm sert."', d: 2 },
  { q: '"Salary" kelimesinin Türkçe anlamı nedir?', a: ['Prim','Maaş','Vergi','Borç'], c: 1, e: 'Salary = Maaş. "Monthly salary" = "Aylık maaş."', d: 2 },
  { q: '"Company" kelimesinin Türkçe anlamı nedir?', a: ['Fabrika','Mağaza','Şirket','Ofis'], c: 2, e: 'Company = Şirket. "Big company" = "Büyük şirket."', d: 1 },
  { q: '"Project" kelimesinin Türkçe anlamı nedir?', a: ['Rapor','Sunum','Proje','Görev'], c: 2, e: 'Project = Proje. "Work on a project." = "Bir proje üzerinde çalış."', d: 1 },

  // B2 - İleri Seviye
  { q: '"Ambiguous" kelimesinin Türkçe anlamı nedir?', a: ['Net','Açık','Belirsiz/Muğlak','Kesin'], c: 2, e: 'Ambiguous = Belirsiz, muğlak. "The answer is ambiguous." = "Cevap muğlak."', d: 4 },
  { q: '"Persuade" kelimesinin Türkçe anlamı nedir?', a: ['Zorunlu kılmak','İkna etmek','Engellemek','Kandırmak'], c: 1, e: 'Persuade = İkna etmek. "I persuaded him to come." = "Onu gelmeye ikna ettim."', d: 3 },
  { q: '"Flexible" kelimesinin Türkçe anlamı nedir?', a: ['Sert','Katı','Esnek','Kırılgan'], c: 2, e: 'Flexible = Esnek. "Flexible schedule" = "Esnek program."', d: 3 },
  { q: '"Reliable" kelimesinin Türkçe anlamı nedir?', a: ['Güvenilmez','Güvenilir','Değişken','Tutarsız'], c: 1, e: 'Reliable = Güvenilir. "A reliable friend" = "Güvenilir bir arkadaş."', d: 3 },
  { q: '"Curious" kelimesinin Türkçe anlamı nedir?', a: ['Kayıtsız','Sıkılmış','Meraklı','Bilgili'], c: 2, e: 'Curious = Meraklı. "Curiosity killed the cat." = "Merak kedinin canına mal olur."', d: 2 },
  { q: '"Patience" kelimesinin Türkçe anlamı nedir?', a: ['Sinir','Sabırsızlık','Sabır','Öfke'], c: 2, e: 'Patience = Sabır. "Have patience." = "Sabırlı ol."', d: 2 },
  { q: '"Improve" kelimesinin Türkçe anlamı nedir?', a: ['Bozmak','Geliştirmek/İyileştirmek','Azaltmak','Durdurmak'], c: 1, e: 'Improve = Geliştirmek, iyileştirmek. "Improve your English." = "İngilizceni geliştir."', d: 2 },
  { q: '"Reduce" kelimesinin Türkçe anlamı nedir?', a: ['Artırmak','Azaltmak','Korumak','Değiştirmek'], c: 1, e: 'Reduce = Azaltmak. "Reduce stress." = "Stresi azalt."', d: 3 },
  { q: '"Avoid" kelimesinin Türkçe anlamı nedir?', a: ['Aramak','Bulmak','Kaçınmak','Yüzleşmek'], c: 2, e: 'Avoid = Kaçınmak. "Avoid junk food." = "Fast fooddan kaçın."', d: 3 },
  { q: '"Succeed" kelimesinin Türkçe anlamı nedir?', a: ['Başarısız olmak','Denemek','Başarmak','Vazgeçmek'], c: 2, e: 'Succeed = Başarmak. "You will succeed!" = "Başaracaksın!"', d: 2 },
  { q: '"Fail" kelimesinin Türkçe anlamı nedir?', a: ['Başarmak','Başarısız olmak','Denemek','Geçmek'], c: 1, e: 'Fail = Başarısız olmak. "Don\'t be afraid to fail." = "Başarısız olmaktan korkma."', d: 2 },

  // Sık Kullanılan İfadeler
  { q: '"Break a leg!" ne anlama gelir?', a: ['Bacağını kır','İyi şanslar','Acele et','Dinlen'], c: 1, e: '"Break a leg!" = İyi şanslar! Sahne sanatlarında kullanılan tiyatro jargonu.', d: 3 },
  { q: '"Hit the sack" ne anlama gelir?', a: ['Çantaya vur','Yatmaya gitmek','Spor yapmak','Çalışmak'], c: 1, e: '"Hit the sack" = Yatmaya gitmek. "I\'m going to hit the sack." = "Yatmaya gidiyorum."', d: 3 },
  { q: '"Under the weather" ifadesi ne anlama gelir?', a: ['Hava altında','Harika hissetmek','Kendini iyi hissememek','Dışarıda olmak'], c: 2, e: '"Under the weather" = Kendini iyi hissetmemek, hasta olmak.', d: 3 },
  { q: '"Once in a blue moon" ne anlama gelir?', a: ['Her gece','Çok nadiren','Her ay','Mavi ışıkta'], c: 1, e: '"Once in a blue moon" = Çok nadiren. "He calls once in a blue moon." = "Çok nadir arar."', d: 3 },
  { q: '"Piece of cake" ne anlama gelir?', a: ['Pasta dilimi','Çok zor','Çok kolay','Yemek zamanı'], c: 2, e: '"Piece of cake" = Çok kolay. "The test was a piece of cake." = "Sınav çok kolaydı."', d: 2 },
  { q: '"Cost an arm and a leg" ne anlama gelir?', a: ['Çok ucuz','Çok pahalı','Bedava','Orta fiyatlı'], c: 1, e: '"Cost an arm and a leg" = Çok pahalıya mal olmak. "That car costs an arm and a leg."', d: 3 },
  { q: '"Spill the beans" ne anlama gelir?', a: ['Fasulye dökmek','Sırrı ifşa etmek','Yemek yapmak','Temizlemek'], c: 1, e: '"Spill the beans" = Sırrı açığa vurmak, ağzından kaçırmak.', d: 3 },
  { q: '"It\'s raining cats and dogs" ne anlama gelir?', a: ['Hayvanlar yağıyor','Çok yoğun yağmur yağıyor','Güzel bir hava var','Rüzgar esiyor'], c: 1, e: '"It\'s raining cats and dogs" = Bardaktan boşanırcasına yağmur yağıyor.', d: 3 },

  // Zıt Anlamlılar
  { q: '"Expensive" kelimesinin zıt anlamlısı nedir?', a: ['Pahalı','Ucuz','Kaliteli','Değersiz'], c: 1, e: 'Expensive = Pahalı. Zıt anlamlısı Cheap = Ucuz.', d: 1 },
  { q: '"Fast" kelimesinin zıt anlamlısı nedir?', a: ['Hızlı','Ani','Yavaş','Ağır'], c: 2, e: 'Fast = Hızlı. Zıt anlamlısı Slow = Yavaş.', d: 1 },
  { q: '"Hard" kelimesinin zıt anlamlısı nedir?', a: ['Sert','Yumuşak','Katı','Kırılgan'], c: 1, e: 'Hard = Sert/Zor. Zıt anlamlısı Soft = Yumuşak / Easy = Kolay.', d: 2 },
  { q: '"Light" kelimesinin zıt anlamlısı nedir?', a: ['Parlak','Açık','Ağır','Karanlık'], c: 2, e: 'Light = Hafif/Aydınlık. Zıt anlamlısı Heavy = Ağır / Dark = Karanlık.', d: 2 },
  { q: '"Hot" kelimesinin zıt anlamlısı nedir?', a: ['Sıcak','Soğuk','Ilık','Donuk'], c: 1, e: 'Hot = Sıcak. Zıt anlamlısı Cold = Soğuk.', d: 1 },
  { q: '"Long" kelimesinin zıt anlamlısı nedir?', a: ['Uzun','Kısa','Geniş','Dar'], c: 1, e: 'Long = Uzun. Zıt anlamlısı Short = Kısa.', d: 1 },
  { q: '"Old" kelimesinin zıt anlamlısı nedir?', a: ['Yaşlı','Eski','Yeni/Genç','Büyük'], c: 2, e: 'Old = Eski/Yaşlı. Zıt anlamlısı New = Yeni / Young = Genç.', d: 1 },
  { q: '"Full" kelimesinin zıt anlamlısı nedir?', a: ['Dolu','Boş','Açık','Az'], c: 1, e: 'Full = Dolu. Zıt anlamlısı Empty = Boş.', d: 1 },

  // Dilbilgisi Soruları
  { q: '"She ___ to school every day." cümlesinde boşluğa ne gelir?', a: ['go','goes','going','gone'], c: 1, e: 'She/He/It ile geniş zaman: fiil + s/es. "She goes" doğrudur.', d: 2 },
  { q: '"I ___ watching TV when you called." cümlesinde boşluğa ne gelir?', a: ['was','were','am','is'], c: 0, e: 'I ile geçmiş süregelen zaman: "I was". "I was watching TV."', d: 3 },
  { q: '"They ___ friends for 10 years." cümlesinde boşluğa ne gelir?', a: ['are','were','have been','will be'], c: 2, e: '"For 10 years" ile present perfect kullanılır: "have been."', d: 3 },
  { q: '"If I ___ rich, I would travel the world." cümlesinde boşluğa ne gelir?', a: ['am','was','were','will be'], c: 2, e: 'İkinci tip koşul cümlelerinde "if" den sonra "were" kullanılır.', d: 4 },
  { q: '"She ___ her keys." — Anahtarlarını kaybetti. Boşluğa ne gelir?', a: ['lose','lost','loses','losing'], c: 1, e: 'Geçmiş zaman (past simple): lose → lost. "She lost her keys."', d: 2 },
  { q: '"Can you speak ___ slowly, please?" — Boşluğa ne gelir?', a: ['more','most','very','much'], c: 0, e: 'Karşılaştırma (comparative): slowly → more slowly. "Can you speak more slowly?"', d: 3 },

  // Sayılar ve Matematik
  { q: '"Hundred" kaç anlamına gelir?', a: ['10','50','100','1000'], c: 2, e: 'Hundred = 100. "One hundred" = 100, "Two hundred" = 200.', d: 1 },
  { q: '"Thousand" kaç anlamına gelir?', a: ['100','500','1.000','10.000'], c: 2, e: 'Thousand = 1.000. "Five thousand" = 5.000.', d: 1 },
  { q: '"Half" ne anlama gelir?', a: ['Çeyrek','Yarım','Üçte bir','Tamamı'], c: 1, e: 'Half = Yarım. "Half an hour" = "Yarım saat."', d: 1 },
  { q: '"Double" ne anlama gelir?', a: ['Yarısı','İki katı','Üç katı','Dörtte biri'], c: 1, e: 'Double = İki katı. "Double the price" = "Fiyatın iki katı."', d: 2 },

  // Bağlaçlar ve Prepositions
  { q: '"Although" kelimesinin Türkçe anlamı nedir?', a: ['Çünkü','Eğer','Her ne kadar/Rağmen','Bu yüzden'], c: 2, e: 'Although = Her ne kadar, rağmen. "Although it rained, we went out."', d: 3 },
  { q: '"However" kelimesinin Türkçe anlamı nedir?', a: ['Ayrıca','Bununla birlikte/Ancak','Bu yüzden','Örneğin'], c: 1, e: 'However = Ancak, bununla birlikte. Contrast (zıtlık) için kullanılır.', d: 3 },
  { q: '"Therefore" kelimesinin Türkçe anlamı nedir?', a: ['Ancak','Ayrıca','Bu yüzden/Dolayısıyla','Her ne kadar'], c: 2, e: 'Therefore = Bu yüzden. "It was raining, therefore we stayed home."', d: 3 },
  { q: '"Besides" kelimesinin Türkçe anlamı nedir?', a: ['Bunun yerine','Aksine','Bunun yanı sıra','Rağmen'], c: 2, e: 'Besides = Bunun yanı sıra. "Besides English, I speak French."', d: 3 },
  { q: '"Instead" kelimesinin Türkçe anlamı nedir?', a: ['Ayrıca','Bunun yerine','Rağmen','Sonuç olarak'], c: 1, e: 'Instead = Bunun yerine. "Instead of coffee, I had tea."', d: 3 },

  // Hayvanlar
  { q: '"Dog" kelimesinin Türkçe anlamı nedir?', a: ['Kedi','Köpek','At','Tavşan'], c: 1, e: 'Dog = Köpek. "Good dog!" = "Aferin köpeğim!"', d: 1 },
  { q: '"Cat" kelimesinin Türkçe anlamı nedir?', a: ['Köpek','Fare','Kedi','Kuş'], c: 2, e: 'Cat = Kedi. "Cats are independent animals." = "Kediler bağımsız hayvanlardır."', d: 1 },
  { q: '"Horse" kelimesinin Türkçe anlamı nedir?', a: ['İnek','At','Eşek','Deve'], c: 1, e: 'Horse = At. "Ride a horse." = "Ata bin."', d: 1 },
  { q: '"Bird" kelimesinin Türkçe anlamı nedir?', a: ['Balık','Böcek','Kuş','Kelebek'], c: 2, e: 'Bird = Kuş. "Birds can fly." = "Kuşlar uçabilir."', d: 1 },
  { q: '"Fish" kelimesinin Türkçe anlamı nedir?', a: ['Kurbağa','Balık','Yılan','Timsah'], c: 1, e: 'Fish = Balık. "Catch a fish." = "Balık tut."', d: 1 },

  // Sosyal Medya ve Modern Kavramlar
  { q: '"Follower" kelimesinin Türkçe anlamı nedir?', a: ['Takipçi','Lider','Arkadaş','Abone'], c: 0, e: 'Follower = Takipçi. Sosyal medyada hesabı takip eden kişi.', d: 1 },
  { q: '"Share" kelimesinin Türkçe anlamı nedir?', a: ['Saklamak','Silmek','Paylaşmak','Yüklemek'], c: 2, e: 'Share = Paylaşmak. "Share this post." = "Bu gönderiyi paylaş."', d: 1 },
  { q: '"Comment" kelimesinin Türkçe anlamı nedir?', a: ['Beğeni','Yorum','Gönderi','Hikaye'], c: 1, e: 'Comment = Yorum. "Leave a comment." = "Yorum bırak."', d: 1 },
  { q: '"Notification" kelimesinin Türkçe anlamı nedir?', a: ['Mesaj','Bildirim','Arama','Hatırlatma'], c: 1, e: 'Notification = Bildirim. "Turn off notifications." = "Bildirimleri kapat."', d: 2 },
  { q: '"Subscription" kelimesinin Türkçe anlamı nedir?', a: ['İndirim','Üyelik/Abonelik','Ödeme','Hesap'], c: 1, e: 'Subscription = Abonelik. "Monthly subscription" = "Aylık abonelik."', d: 2 },

  // Alışveriş
  { q: '"Discount" kelimesinin Türkçe anlamı nedir?', a: ['Zam','İndirim','Fiyat','Vergi'], c: 1, e: 'Discount = İndirim. "10% discount" = "%10 indirim."', d: 1 },
  { q: '"Receipt" kelimesinin Türkçe anlamı nedir?', a: ['Fatura','Fiş/Makbuz','Sözleşme','Kart'], c: 1, e: 'Receipt = Makbuz, fiş. "Keep your receipt." = "Fişini sakla."', d: 2 },
  { q: '"Refund" kelimesinin Türkçe anlamı nedir?', a: ['Ödeme','Para iadesi','Değişim','İndirim'], c: 1, e: 'Refund = Para iadesi. "I want a refund." = "Para iadesi istiyorum."', d: 2 },
  { q: '"Cash" kelimesinin Türkçe anlamı nedir?', a: ['Kredi kartı','Çek','Nakit','Havale'], c: 2, e: 'Cash = Nakit. "Pay in cash." = "Nakit öde."', d: 1 },
  { q: '"Afford" kelimesinin Türkçe anlamı nedir?', a: ['Harcamak','Kazanmak','Karşılayabilmek','Tasarruf etmek'], c: 2, e: 'Afford = Maddi olarak karşılayabilmek. "I can\'t afford it." = "Buna param yetmez."', d: 2 },

  // Meslekler
  { q: '"Doctor" kelimesinin Türkçe anlamı nedir?', a: ['Hemşire','Diş hekimi','Doktor','Eczacı'], c: 2, e: 'Doctor = Doktor. "See a doctor." = "Doktora git."', d: 1 },
  { q: '"Engineer" kelimesinin Türkçe anlamı nedir?', a: ['Mimar','Mühendis','Teknisyen','Bilim insanı'], c: 1, e: 'Engineer = Mühendis. "Software engineer" = "Yazılım mühendisi."', d: 1 },
  { q: '"Lawyer" kelimesinin Türkçe anlamı nedir?', a: ['Hakim','Avukat','Savcı','Noter'], c: 1, e: 'Lawyer = Avukat. "I need a lawyer." = "Bir avukata ihtiyacım var."', d: 2 },
  { q: '"Chef" kelimesinin Türkçe anlamı nedir?', a: ['Garson','Aşçı/Şef','Kasap','Fırıncı'], c: 1, e: 'Chef = Aşçı, şef. "Head chef" = "Baş aşçı."', d: 1 },
  { q: '"Pilot" kelimesinin Türkçe anlamı nedir?', a: ['Kaptan','Pilot','Hostes','Kontrolör'], c: 1, e: 'Pilot = Pilot. "The pilot landed safely." = "Pilot güvenli indi."', d: 1 },

  // Spor
  { q: '"Win" kelimesinin Türkçe anlamı nedir?', a: ['Kaybetmek','Berabere kalmak','Kazanmak','Oynamak'], c: 2, e: 'Win = Kazanmak. Lose = Kaybetmek (zıt anlamlısı).', d: 1 },
  { q: '"Lose" kelimesinin Türkçe anlamı nedir?', a: ['Kazanmak','Kaybetmek','Berabere kalmak','Oynamak'], c: 1, e: 'Lose = Kaybetmek. Win = Kazanmak (zıt anlamlısı).', d: 1 },
  { q: '"Score" kelimesinin Türkçe anlamı nedir?', a: ['Saat','Skor/Puan','Gol','Maç'], c: 1, e: 'Score = Skor, puan. "What\'s the score?" = "Skor kaç?"', d: 1 },
  { q: '"Team" kelimesinin Türkçe anlamı nedir?', a: ['Oyuncu','Takım','Antrenör','Hakem'], c: 1, e: 'Team = Takım. "Team player" = "Takım oyuncusu."', d: 1 },
  { q: '"Champion" kelimesinin Türkçe anlamı nedir?', a: ['Finalist','Şampiyon','Yarı finalist','Aday'], c: 1, e: 'Champion = Şampiyon. "World champion" = "Dünya şampiyonu."', d: 1 },
  { q: '"Practice" kelimesinin Türkçe anlamı nedir?', a: ['Dinlenmek','Maç yapmak','Antrenman/Pratik yapmak','Yarışmak'], c: 2, e: 'Practice = Pratik yapmak, antrenman. "Practice makes perfect." = "Pratik mükemmeli yaratır."', d: 2 },

  // Karakter ve Kişilik
  { q: '"Honest" kelimesinin Türkçe anlamı nedir?', a: ['Yalancı','Dürüst','Kıskanç','Bencil'], c: 1, e: 'Honest = Dürüst. Dishonest = Dürüst olmayan.', d: 2 },
  { q: '"Lazy" kelimesinin Türkçe anlamı nedir?', a: ['Çalışkan','Hızlı','Tembel','Güçlü'], c: 2, e: 'Lazy = Tembel. Hardworking = Çalışkan (zıt anlamlısı).', d: 1 },
  { q: '"Smart" kelimesinin Türkçe anlamı nedir?', a: ['Aptal','Zeki/Akıllı','Güçlü','Hızlı'], c: 1, e: 'Smart = Zeki, akıllı. "Smart student" = "Zeki öğrenci."', d: 1 },
  { q: '"Polite" kelimesinin Türkçe anlamı nedir?', a: ['Kaba','Kibar','Sessiz','Çekingen'], c: 1, e: 'Polite = Kibar. Rude = Kaba (zıt anlamlısı).', d: 2 },
  { q: '"Rude" kelimesinin Türkçe anlamı nedir?', a: ['Kibar','Nazik','Kaba','Saygılı'], c: 2, e: 'Rude = Kaba. Polite = Kibar (zıt anlamlısı).', d: 2 },
  { q: '"Clever" kelimesinin Türkçe anlamı nedir?', a: ['Aptal','Yavaş','Zeki','Tembel'], c: 2, e: 'Clever = Zeki, kurnaz. Smart ile benzer anlam.', d: 2 },
  { q: '"Shy" kelimesinin Türkçe anlamı nedir?', a: ['Dışa dönük','Sosyal','Çekingen/Utangaç','Cesur'], c: 2, e: 'Shy = Çekingen, utangaç. Outgoing = Dışa dönük (zıt anlamlısı).', d: 2 },
  { q: '"Kind" kelimesinin Türkçe anlamı nedir?', a: ['Kötü','Acımasız','Nazik/İyi kalpli','Bencil'], c: 2, e: 'Kind = Nazik, iyi kalpli. "Be kind to others." = "Başkalarına nazik ol."', d: 1 },

  // Duyular
  { q: '"Smell" kelimesinin Türkçe anlamı nedir?', a: ['Dokunmak','Görmek','Koklama/Koku','Tatmak'], c: 2, e: 'Smell = Koku / Koklamak. "What\'s that smell?" = "Bu ne kokusu?"', d: 1 },
  { q: '"Touch" kelimesinin Türkçe anlamı nedir?', a: ['Görmek','Duymak','Dokunmak','Tatmak'], c: 2, e: 'Touch = Dokunmak. "Don\'t touch!" = "Dokunma!"', d: 1 },
  { q: '"Hear" kelimesinin Türkçe anlamı nedir?', a: ['Görmek','Duymak','Hissetmek','Tatmak'], c: 1, e: 'Hear = Duymak. Listen = Dinlemek (aktif dinleme). "I hear music." = "Müzik duyuyorum."', d: 1 },
  { q: '"Taste" kelimesinin Türkçe anlamı nedir?', a: ['Koklama','Dokunma','Görme','Tat/Tatmak'], c: 3, e: 'Taste = Tat, tatmak. "It tastes good!" = "İyi tadı var!"', d: 1 },

  // Zaman Kalıpları
  { q: '"Right now" ne anlama gelir?', a: ['Hemen sonra','Şu an/Hemen şimdi','Biraz sonra','Daha önce'], c: 1, e: '"Right now" = Şu an, tam şu anda. "I\'m busy right now." = "Şu an meşgulüm."', d: 1 },
  { q: '"So far" ne anlama gelir?', a: ['Çok uzakta','Şimdiye kadar','İleride','Sonunda'], c: 1, e: '"So far" = Şimdiye kadar. "So far so good." = "Şimdiye kadar iyi."', d: 2 },
  { q: '"From now on" ne anlama gelir?', a: ['Bundan önce','Bundan sonra/Artık','Arada bir','Geçmişte'], c: 1, e: '"From now on" = Bundan sonra, artık. "From now on, I will exercise daily."', d: 2 },
  { q: '"At the moment" ne anlama gelir?', a: ['Bir an için','Şu an/Şu sıralar','Uzun süre önce','Çok yakında'], c: 1, e: '"At the moment" = Şu an, şu sıralar. "I\'m busy at the moment."', d: 2 },

  // Yer ve Konum
  { q: '"Nearby" kelimesinin Türkçe anlamı nedir?', a: ['Uzakta','Yakınlarda','Ortada','Aşağıda'], c: 1, e: 'Nearby = Yakınlarda. "Is there a pharmacy nearby?" = "Yakınlarda eczane var mı?"', d: 2 },
  { q: '"Opposite" kelimesinin Türkçe anlamı nedir?', a: ['Yanında','Arkasında','Karşısında','Üstünde'], c: 2, e: 'Opposite = Karşısında, zıt. "Opposite the school" = "Okulun karşısında."', d: 2 },
  { q: '"Between" kelimesinin Türkçe anlamı nedir?', a: ['Üstünde','Altında','Arasında (iki şey)','Yanında'], c: 2, e: 'Between = Arasında (iki şey için). "Between the trees" = "Ağaçların arasında."', d: 2 },
  { q: '"Among" kelimesinin Türkçe anlamı nedir?', a: ['Üstünde','Arasında (çok şey)','Altında','Dışında'], c: 1, e: 'Among = Arasında (üçten fazla için). "Among friends" = "Arkadaşlar arasında."', d: 3 },

  // Faydalı Kelimeler
  { q: '"Emergency" kelimesinin Türkçe anlamı nedir?', a: ['Acil durum','Rutin','Plan','Görev'], c: 0, e: 'Emergency = Acil durum. "Emergency exit" = "Acil çıkış."', d: 2 },
  { q: '"Careful" kelimesinin Türkçe anlamı nedir?', a: ['Dikkatsiz','Dikkatli','Hızlı','Rahat'], c: 1, e: 'Careful = Dikkatli. "Be careful!" = "Dikkatli ol!"', d: 1 },
  { q: '"Enough" kelimesinin Türkçe anlamı nedir?', a: ['Fazla','Yeterli','Az','Hiç'], c: 1, e: 'Enough = Yeterli. "That\'s enough!" = "Bu yeter!"', d: 1 },
  { q: '"Both" kelimesinin Türkçe anlamı nedir?', a: ['Hiçbiri','Biri','Her ikisi de','Diğeri'], c: 2, e: 'Both = Her ikisi de. "Both of them" = "Her ikisi de."', d: 2 },
  { q: '"Neither" kelimesinin Türkçe anlamı nedir?', a: ['Her ikisi de','Biri','Ne biri ne diğeri','İkisi de değil'], c: 2, e: 'Neither = Ne biri ne de diğeri. "Neither of them came." = "İkisi de gelmedi."', d: 3 },
  { q: '"Whether" kelimesinin Türkçe anlamı nedir?', a: ['Hava durumu','Eğer/Olup olmadığı','Ne zaman','Neden'], c: 1, e: 'Whether = Olup olmadığı. "I don\'t know whether he\'ll come."', d: 3 },
  { q: '"Throughout" kelimesinin Türkçe anlamı nedir?', a: ['Başlangıçta','Boyunca/Süresince','Sonunda','Bazen'], c: 1, e: 'Throughout = Boyunca. "Throughout the year" = "Yıl boyunca."', d: 3 },
  { q: '"Meanwhile" kelimesinin Türkçe anlamı nedir?', a: ['Sonradan','Bu arada/Bu süreçte','Önce','Sırasıyla'], c: 1, e: 'Meanwhile = Bu arada, bu sırada. "Meanwhile, the others waited."', d: 3 },
  { q: '"Eventually" kelimesinin Türkçe anlamı nedir?', a: ['Hemen','Nadiren','Sonunda/Eninde sonunda','Bazen'], c: 2, e: 'Eventually = Sonunda, eninde sonunda. "Eventually he agreed."', d: 3 },
  { q: '"Furthermore" kelimesinin Türkçe anlamı nedir?', a: ['Aksine','Ayrıca/Dahası','Sonuç olarak','Bu yüzden'], c: 1, e: 'Furthermore = Ayrıca, dahası, üstelik. Bir fikre ek bilgi eklemek için.', d: 4 },

  // Modal Fiiller
  { q: '"Must" ne anlama gelir?', a: ['Yapabilmek','Yapmak zorunda olmak','Yapabilirsin','Yapmalısın (tavsiye)'], c: 1, e: 'Must = Zorunluluk. "You must wear a seatbelt." = "Emniyet kemeri takmalısın."', d: 2 },
  { q: '"Should" ne anlama gelir?', a: ['Zorunlu','Yapmalısın (tavsiye)','Yapabilirsin','Yapacaksın'], c: 1, e: 'Should = Tavsiye. "You should sleep early." = "Erken uyumalısın."', d: 2 },
  { q: '"Could" ne anlama gelir?', a: ['Yapacak','Yapabilirdi/Yapabilir miydi','Yapmalı','Yapıyor'], c: 1, e: 'Could = Can\'ın geçmiş hali veya kibarca ricada kullanılır. "Could you help me?"', d: 3 },
  { q: '"Would" hangi amaçla kullanılır?', a: ['Zorunluluk','Rica/Koşullu anlam','Yetenek','Gereklilik'], c: 1, e: '"Would" = Rica ve koşul cümlelerinde. "Would you like coffee?" = "Kahve ister misiniz?"', d: 3 },
  { q: '"Might" ne anlama gelir?', a: ['Kesinlikle','Olabilir/Belki','Zorunlu','Yapamaz'], c: 1, e: 'Might = Belki, olabilir (düşük ihtimal). "It might rain." = "Yağmur yağabilir."', d: 3 },

  // Fiil Zamanları
  { q: '"I have eaten." cümlesi hangi zamanı ifade eder?', a: ['Geçmiş basit','Şimdiki zaman','Present perfect','Gelecek zaman'], c: 2, e: '"Have/Has + V3" = Present Perfect (geçmişte yapılmış, şu anla bağlantılı eylem).', d: 3 },
  { q: '"She was sleeping." cümlesi hangi zamanı ifade eder?', a: ['Geçmiş basit','Geçmiş süregelen','Present perfect','Gelecek'], c: 1, e: '"Was/Were + Ving" = Past Continuous (geçmişte süregelen eylem).', d: 3 },
  { q: '"I will call you." cümlesinde hangi zaman kullanılmıştır?', a: ['Geçmiş zaman','Şimdiki zaman','Gelecek zaman','Present perfect'], c: 2, e: '"Will + fiil" = Gelecek zaman (Simple Future). "I will call." = "Arayacağım."', d: 2 },

  // Sık Hata Yapılan Kelimeler
  { q: '"Borrow" ile "Lend" arasındaki fark nedir?', a: ['İkisi aynı anlama gelir','Borrow = almak, Lend = vermek','Borrow = vermek, Lend = almak','İkisi de "satmak" demek'], c: 1, e: 'Borrow = ödünç almak (sen alırsın). Lend = ödünç vermek (sen verirsin).', d: 3 },
  { q: '"Say" ile "Tell" arasındaki fark nedir?', a: ['Aynı anlama gelir','Say direkt konuşur, Tell birine söyler','Tell daha resmidir','Say daha uzundur'], c: 1, e: '"Say something" (bir şey söyle) vs "Tell someone" (birine söyle). "Tell me!" = "Söyle bana!"', d: 3 },
  { q: '"Look", "See" ve "Watch" arasındaki temel fark nedir?', a: ['Hepsi aynı','Look=kasıtlı bakmak, See=görmek, Watch=izlemek','Look=görmek, See=bakmak','Watch sadece TV için'], c: 1, e: 'Look = Kasıtlı bakmak. See = Görmek (otomatik). Watch = Hareketli şeyleri izlemek.', d: 4 },
  { q: '"Make" ve "Do" arasındaki fark nedir?', a: ['İkisi aynı','Make = üretmek/yaratmak, Do = yapmak (genel)','Do = üretmek','Make daha formeldir'], c: 1, e: 'Make = bir şey üretmek (make coffee, make a mistake). Do = genel eylem (do homework, do sport).', d: 3 },

  // Akademik Kelimeler
  { q: '"Analysis" kelimesinin Türkçe anlamı nedir?', a: ['Sonuç','Analiz/İnceleme','Teori','Uygulama'], c: 1, e: 'Analysis = Analiz, inceleme. "Data analysis" = "Veri analizi."', d: 3 },
  { q: '"Evidence" kelimesinin Türkçe anlamı nedir?', a: ['Teori','Soru','Kanıt/Delil','Yargı'], c: 2, e: 'Evidence = Kanıt, delil. "Show evidence." = "Kanıt göster."', d: 3 },
  { q: '"Emphasize" kelimesinin Türkçe anlamı nedir?', a: ['Küçümsemek','Vurgulamak','Azaltmak','Görmezden gelmek'], c: 1, e: 'Emphasize = Vurgulamak. "I want to emphasize this point." = "Bu noktayı vurgulamak istiyorum."', d: 3 },
  { q: '"Assumption" kelimesinin Türkçe anlamı nedir?', a: ['Kanıt','Varsayım/Faraziye','Sonuç','Gerçek'], c: 1, e: 'Assumption = Varsayım. "Don\'t make assumptions." = "Varsayımda bulunma."', d: 4 },

  // Duygusal Zeka
  { q: '"Empathy" kelimesinin Türkçe anlamı nedir?', a: ['Sempatik olmak','Empati/Duygu paylaşımı','Acıma','Yargılama'], c: 1, e: 'Empathy = Empati, karşıdakinin duygularını anlama yetisi.', d: 3 },
  { q: '"Confidence" kelimesinin Türkçe anlamı nedir?', a: ['Korku','Özgüven/Güven','Endişe','Şüphe'], c: 1, e: 'Confidence = Özgüven. "Self-confidence" = "Özgüven."', d: 2 },
  { q: '"Grateful" kelimesinin Türkçe anlamı nedir?', a: ['Şikayet eden','Minnettar','Kayıtsız','Mutsuz'], c: 1, e: 'Grateful = Minnettar. "I\'m grateful for your help." = "Yardımın için minnettarım."', d: 2 },
  { q: '"Forgive" kelimesinin Türkçe anlamı nedir?', a: ['Cezalandırmak','Suçlamak','Affetmek','Unutmak'], c: 2, e: 'Forgive = Affetmek. "Can you forgive me?" = "Beni affedebilir misin?"', d: 2 },

  // Teknoloji ve Bilim
  { q: '"Artificial" kelimesinin Türkçe anlamı nedir?', a: ['Doğal','Yapay','Gerçek','Organik'], c: 1, e: 'Artificial = Yapay. "Artificial intelligence" = "Yapay zeka" (AI).', d: 2 },
  { q: '"Data" kelimesinin Türkçe anlamı nedir?', a: ['Bilgi (genel)','Program','Veri','Sistem'], c: 2, e: 'Data = Veri. "Big data" = "Büyük veri."', d: 2 },
  { q: '"Software" kelimesinin Türkçe anlamı nedir?', a: ['Donanım','Yazılım','Ağ','Sunucu'], c: 1, e: 'Software = Yazılım. Hardware = Donanım (zıt anlamlısı).', d: 2 },
  { q: '"Network" kelimesinin Türkçe anlamı nedir?', a: ['Sunucu','Ağ/Şebeke','Program','Veritabanı'], c: 1, e: 'Network = Ağ. "Social network" = "Sosyal ağ."', d: 2 },
  { q: '"Search" kelimesinin Türkçe anlamı nedir?', a: ['Bulmak','Aramak','Taramak','Yüklemek'], c: 1, e: 'Search = Aramak. "Search the web." = "İnternette ara."', d: 1 },

  // Çevre ve Sürdürülebilirlik
  { q: '"Environment" kelimesinin Türkçe anlamı nedir?', a: ['Hava','Çevre/Doğa','İklim','Toprak'], c: 1, e: 'Environment = Çevre. "Protect the environment." = "Çevreyi koru."', d: 2 },
  { q: '"Recycle" kelimesinin Türkçe anlamı nedir?', a: ['Yakmak','Gömmek','Geri dönüştürmek','Atmak'], c: 2, e: 'Recycle = Geri dönüştürmek. "Recycle paper." = "Kağıdı geri dönüştür."', d: 2 },
  { q: '"Pollution" kelimesinin Türkçe anlamı nedir?', a: ['Temizlik','Kirlilik','Doğallık','Sürdürülebilirlik'], c: 1, e: 'Pollution = Kirlilik. "Air pollution" = "Hava kirliliği."', d: 2 },
  { q: '"Sustainable" kelimesinin Türkçe anlamı nedir?', a: ['Zararlı','Geçici','Sürdürülebilir','Pahalı'], c: 2, e: 'Sustainable = Sürdürülebilir. "Sustainable energy" = "Sürdürülebilir enerji."', d: 3 },

  // Son Kelimeler
  { q: '"Absolutely" kelimesinin Türkçe anlamı nedir?', a: ['Belki','Kesinlikle/Tabii ki','Neredeyse','Hiç'], c: 1, e: 'Absolutely = Kesinlikle, tabii ki. "Absolutely!" = "Kesinlikle!"', d: 2 },
  { q: '"Actually" kelimesinin Türkçe anlamı nedir?', a: ['Normalde','Aslında/Gerçekte','Genellikle','Bazen'], c: 1, e: 'Actually = Aslında. "Actually, I changed my mind." = "Aslında fikrimi değiştirdim."', d: 2 },
  { q: '"Basically" kelimesinin Türkçe anlamı nedir?', a: ['Karmaşık şekilde','Temel olarak/Kısacası','Ayrıntılı olarak','Resmi olarak'], c: 1, e: 'Basically = Temel olarak, kısacası. "Basically, it\'s simple." = "Kısacası, bu basit."', d: 2 },
  { q: '"Literally" kelimesinin Türkçe anlamı nedir?', a: ['Mecazi olarak','Tam anlamıyla/Gerçekten','Neredeyse','Yaklaşık'], c: 1, e: 'Literally = Tam anlamıyla. "I\'m literally dying of laughter." = "Gerçekten gülmekten ölüyorum."', d: 3 },
  { q: '"Definitely" kelimesinin Türkçe anlamı nedir?', a: ['Belki','Muhtemelen','Kesinlikle','Nadiren'], c: 2, e: 'Definitely = Kesinlikle. "Definitely yes!" = "Kesinlikle evet!"', d: 2 },
  { q: '"Exactly" kelimesinin Türkçe anlamı nedir?', a: ['Yaklaşık','Neredeyse','Tam olarak','Hemen hemen'], c: 2, e: 'Exactly = Tam olarak. "Exactly right!" = "Tam olarak doğru!"', d: 1 },
  { q: '"Mistake" kelimesinin Türkçe anlamı nedir?', a: ['Başarı','Hata','Karar','Sonuç'], c: 1, e: 'Mistake = Hata. "Make a mistake." = "Hata yapmak."', d: 1 },
  { q: '"Advice" kelimesinin Türkçe anlamı nedir?', a: ['Emir','Tavsiye/Öneri','Eleştiri','Şikayet'], c: 1, e: 'Advice = Tavsiye. "Give me your advice." = "Bana tavsiyeni ver."', d: 2 },
  { q: '"Purpose" kelimesinin Türkçe anlamı nedir?', a: ['Sonuç','Kaza','Amaç/Gaye','Plan'], c: 2, e: 'Purpose = Amaç. "What\'s your purpose?" = "Amacın ne?"', d: 2 },
  { q: '"Habit" kelimesinin Türkçe anlamı nedir?', a: ['Kural','Alışkanlık','Görev','Zorunluluk'], c: 1, e: 'Habit = Alışkanlık. "Good habit" = "İyi alışkanlık."', d: 2 },
  { q: '"Imagine" kelimesinin Türkçe anlamı nedir?', a: ['Hatırlamak','Görmek','Hayal etmek','Düşünmek'], c: 2, e: 'Imagine = Hayal etmek. "Imagine a better world." = "Daha iyi bir dünya hayal et."', d: 2 },
  { q: '"Respect" kelimesinin Türkçe anlamı nedir?', a: ['Aşağılamak','Saygı/Saygı göstermek','Sevmek','Korkmak'], c: 1, e: 'Respect = Saygı. "Respect each other." = "Birbirinize saygı gösterin."', d: 2 },
  { q: '"Accept" kelimesinin Türkçe anlamı nedir?', a: ['Reddetmek','Kabul etmek','Teklif etmek','İtiraz etmek'], c: 1, e: 'Accept = Kabul etmek. Refuse/Reject = Reddetmek (zıt anlamlısı).', d: 2 },
  { q: '"Protect" kelimesinin Türkçe anlamı nedir?', a: ['Tehdit etmek','Korumak','Zarar vermek','Terketmek'], c: 1, e: 'Protect = Korumak. "Protect the environment." = "Çevreyi koru."', d: 2 },
  { q: '"Celebrate" kelimesinin Türkçe anlamı nedir?', a: ['Yas tutmak','Kutlamak','Hatırlamak','Planlamak'], c: 1, e: 'Celebrate = Kutlamak. "Celebrate a birthday." = "Doğum günü kutlamak."', d: 2 },
  { q: '"Achieve" ile "Succeed" arasındaki fark nedir?', a: ['İkisi aynı anlama gelir','Achieve = belirli bir hedef, Succeed = genel başarı','Succeed daha resmidir','Achieve sadece işte kullanılır'], c: 1, e: 'Achieve = belirli bir hedefe ulaşmak. Succeed = genel olarak başarılı olmak.', d: 4 },

  // Eğlence ve Medya
  { q: '"Movie" kelimesinin Türkçe anlamı nedir?', a: ['Müzik','Film','Dizi','Belgesel'], c: 1, e: 'Movie = Film. "Watch a movie." = "Film izle."', d: 1 },
  { q: '"Song" kelimesinin Türkçe anlamı nedir?', a: ['Albüm','Konser','Şarkı','Müzisyen'], c: 2, e: 'Song = Şarkı. "My favourite song" = "En sevdiğim şarkı."', d: 1 },
  { q: '"Concert" kelimesinin Türkçe anlamı nedir?', a: ['Film','Tiyatro','Konser','Festival'], c: 2, e: 'Concert = Konser. "Go to a concert." = "Konsere git."', d: 1 },
  { q: '"Stage" kelimesinin Türkçe anlamı nedir?', a: ['Perde','Sahne','Işık','Dekor'], c: 1, e: 'Stage = Sahne. "On stage" = "Sahnede."', d: 2 },
  { q: '"Award" kelimesinin Türkçe anlamı nedir?', a: ['Ceza','Ödül','Sertifika','Kupa'], c: 1, e: 'Award = Ödül. "Win an award." = "Ödül kazan."', d: 2 },

  // Boyut ve Miktar
  { q: '"Huge" kelimesinin Türkçe anlamı nedir?', a: ['Küçük','Büyük','Dev gibi/Çok büyük','Orta'], c: 2, e: 'Huge = Dev gibi, çok büyük. Big\'den daha güçlü.', d: 2 },
  { q: '"Tiny" kelimesinin Türkçe anlamı nedir?', a: ['Büyük','Orta','Çok küçük','Küçük'], c: 2, e: 'Tiny = Çok küçük. Small\'dan daha küçük.', d: 2 },
  { q: '"Several" kelimesinin Türkçe anlamı nedir?', a: ['Bir','İki','Birkaç/Çeşitli','Çok fazla'], c: 2, e: 'Several = Birkaç. "Several times" = "Birkaç kez."', d: 2 },
  { q: '"Plenty" kelimesinin Türkçe anlamı nedir?', a: ['Az','Yetersiz','Bol miktarda','Biraz'], c: 2, e: 'Plenty = Bol miktarda. "Plenty of time" = "Bol zaman."', d: 2 },
];

export default english;
