import type { QuizQuestion } from '../../types/quiz';

// En �ok kullanılan İngilizce kelimeler � T�rk�e anlamlarıyla
const english: QuizQuestion[] = [
  // A1 - Temel Kelimeler
  { q: '"Happy" kelimesinin T�rk�e anlamı nedir?', a: ['�zg�n','Mutlu','Kızgın','Yorgun'], c: 1, e: 'Happy = Mutlu. "I am happy today." = "Bug�n mutluyum."', d: 1 },
  { q: '"Beautiful" kelimesinin T�rk�e anlamı nedir?', a: ['�irkin','Korkutucu','G�zel','K���k'], c: 2, e: 'Beautiful = G�zel. �ok g��l� bir sıfat.', d: 1 },
  { q: '"Friend" kelimesinin T�rk�e anlamı nedir?', a: ['D�şman','Arkadaş','Yabancı','Komşu'], c: 1, e: 'Friend = Arkadaş. Best friend = En iyi arkadaş.', d: 1 },
  { q: '"House" kelimesinin T�rk�e anlamı nedir?', a: ['Araba','Okul','Ev','Ofis'], c: 2, e: 'House = Ev. Home da ev anlamına gelir ama daha "yuva" hissi verir.', d: 1 },
  { q: '"Water" kelimesinin T�rk�e anlamı nedir?', a: ['Ateş','Su','Hava','Toprak'], c: 1, e: 'Water = Su. "Can I have some water?" = "Biraz su alabilir miyim?"', d: 1 },
  { q: '"Book" kelimesinin T�rk�e anlamı nedir?', a: ['Kalem','Kitap','Defter','Masa'], c: 1, e: 'Book = Kitap. Aynı zamanda "rezervasyon yapmak" fiili olarak da kullanılır.', d: 1 },
  { q: '"Time" kelimesinin T�rk�e anlamı nedir?', a: ['Yer','Zaman','Para','İş'], c: 1, e: 'Time = Zaman/Vakit. "What time is it?" = "Saat ka�?"', d: 1 },
  { q: '"Work" kelimesinin T�rk�e anlamı nedir?', a: ['Oynamak','�alışmak','Uyumak','Yemek'], c: 1, e: 'Work = �alışmak / İş. Hem fiil hem isim olarak kullanılır.', d: 1 },
  { q: '"Love" kelimesinin T�rk�e anlamı nedir?', a: ['Nefret','Korku','Sevgi','�z�nt�'], c: 2, e: 'Love = Sevgi/Aşk. "I love you" = "Seni seviyorum."', d: 1 },
  { q: '"Big" kelimesinin T�rk�e anlamı nedir?', a: ['K���k','B�y�k','Uzak','Yakın'], c: 1, e: 'Big = B�y�k. Large da aynı anlama gelir.', d: 1 },

  // A2 - Orta Seviye
  { q: '"Understand" kelimesinin T�rk�e anlamı nedir?', a: ['Anlamak','Yazmak','Okumak','Konuşmak'], c: 0, e: 'Understand = Anlamak. "Do you understand?" = "Anlıyor musun?"', d: 2 },
  { q: '"Important" kelimesinin T�rk�e anlamı nedir?', a: ['Tehlikeli','�nemli','Ucuz','Uzak'], c: 1, e: 'Important = �nemli. "This is very important." = "Bu �ok �nemli."', d: 2 },
  { q: '"Remember" kelimesinin T�rk�e anlamı nedir?', a: ['Unutmak','Hatırlamak','�ğrenmek','G�rmek'], c: 1, e: 'Remember = Hatırlamak. Forget = Unutmak (zıt anlamlısı).', d: 2 },
  { q: '"Choose" kelimesinin T�rk�e anlamı nedir?', a: ['Kaybetmek','Bulmak','Se�mek','Vermek'], c: 2, e: 'Choose = Se�mek. "You can choose one." = "Birini se�ebilirsin."', d: 2 },
  { q: '"Strong" kelimesinin T�rk�e anlamı nedir?', a: ['Zayıf','G��l�','Yumuşak','Sessiz'], c: 1, e: 'Strong = G��l�/Sağlam. Weak = Zayıf (zıt anlamlısı).', d: 2 },
  { q: '"Different" kelimesinin T�rk�e anlamı nedir?', a: ['Aynı','Benzer','Farklı','Yakın'], c: 2, e: 'Different = Farklı. Same = Aynı (zıt anlamlısı).', d: 2 },
  { q: '"Possible" kelimesinin T�rk�e anlamı nedir?', a: ['İmk�nsız','M�mk�n','Zorunlu','Gerekli'], c: 1, e: 'Possible = M�mk�n. Impossible = İmk�nsız (zıt anlamlısı).', d: 2 },
  { q: '"Explain" kelimesinin T�rk�e anlamı nedir?', a: ['Sormak','Anlatmak/A�ıklamak','Dinlemek','Cevaplamak'], c: 1, e: 'Explain = A�ıklamak/Anlatmak. "Can you explain?" = "A�ıklayabilir misin?"', d: 2 },
  { q: '"Decide" kelimesinin T�rk�e anlamı nedir?', a: ['Ş�phelenmek','Karar vermek','Beklemek','Sorgulamak'], c: 1, e: 'Decide = Karar vermek. "I decided to go." = "Gitmeye karar verdim."', d: 2 },
  { q: '"Promise" kelimesinin T�rk�e anlamı nedir?', a: ['Tehdit','S�z/Vaat','Şik�yet','İstek'], c: 1, e: 'Promise = S�z/Vaat. "I promise!" = "S�z veriyorum!"', d: 2 },

  // B1 - İleri Seviye
  { q: '"Achieve" kelimesinin T�rk�e anlamı nedir?', a: ['Başarısız olmak','Başarmak/Elde etmek','Denemek','Ka�mak'], c: 1, e: 'Achieve = Başarmak, elde etmek. "Achieve your goals" = "Hedeflerine ulaş."', d: 3 },
  { q: '"Challenge" kelimesinin T�rk�e anlamı nedir?', a: ['Ka�ınmak','Reddetmek','Meydan okumak','Kabul etmek'], c: 2, e: 'Challenge = Meydan okumak / Zorluk. "A big challenge" = "B�y�k bir zorluk."', d: 3 },
  { q: '"Significant" kelimesinin T�rk�e anlamı nedir?', a: ['�nemsiz','�nemli/Anlamlı','K���k','Belirsiz'], c: 1, e: 'Significant = �nemli, anlamlı. Important ile benzer ama daha resmi.', d: 3 },
  { q: '"Opportunity" kelimesinin T�rk�e anlamı nedir?', a: ['Tehlike','Sorun','Fırsat','Engel'], c: 2, e: 'Opportunity = Fırsat. "A great opportunity" = "Harika bir fırsat."', d: 3 },
  { q: '"Maintain" kelimesinin T�rk�e anlamı nedir?', a: ['Bozmak','S�rd�rmek/Korumak','Yaratmak','Yıkmak'], c: 1, e: 'Maintain = S�rd�rmek, korumak. "Maintain a healthy lifestyle" = "Sağlıklı yaşamı s�rd�r."', d: 3 },
  { q: '"Consequence" kelimesinin T�rk�e anlamı nedir?', a: ['Sebep','��z�m','Sonu�','Plan'], c: 2, e: 'Consequence = Sonu�, netice. "As a consequence" = "Sonu� olarak."', d: 3 },
  { q: '"Efficient" kelimesinin T�rk�e anlamı nedir?', a: ['Verimsiz','Verimli/Etkin','Pahalı','Yorucu'], c: 1, e: 'Efficient = Verimli, etkin. "An efficient system" = "Verimli bir sistem."', d: 3 },
  { q: '"Appreciate" kelimesinin T�rk�e anlamı nedir?', a: ['Şik�yet etmek','Reddetmek','Takdir etmek','G�rmezden gelmek'], c: 2, e: 'Appreciate = Takdir etmek, değerini bilmek. "I appreciate it" = "Takdir ediyorum."', d: 3 },
  { q: '"Determine" kelimesinin T�rk�e anlamı nedir?', a: ['Ş�phelenmek','Belirlemek/Kararlı olmak','Ka�ınmak','Ertelemek'], c: 1, e: 'Determine = Belirlemek. "Determined" = Kararlı.', d: 3 },
  { q: '"Contribute" kelimesinin T�rk�e anlamı nedir?', a: ['Almak','Katkıda bulunmak','Engellemek','Bozmak'], c: 1, e: 'Contribute = Katkıda bulunmak. "Contribute to society" = "Topluma katkıda bulun."', d: 3 },

  // G�nl�k İfadeler
  { q: '"What\'s up?" ifadesi ne anlama gelir?', a: ['Yukarıda ne var?','Nasılsın? / Ne var ne yok?','Adresi ne?','Ne zaman?'], c: 1, e: '"What\'s up?" = Ne var ne yok? / Nasılsın? G�nl�k konuşmada sık kullanılır.', d: 2 },
  { q: '"Take it easy" ifadesi ne anlama gelir?', a: ['Kolayı al','Endişelenme / Rahat ol','�abuk ol','Dikkatli ol'], c: 1, e: '"Take it easy" = Rahat ol, endişelenme. Veda ifadesi olarak da kullanılır.', d: 2 },
  { q: '"By the way" ifadesi ne anlama gelir?', a: ['Bu arada','Yol ile','Her neyse','Ayrıca'], c: 0, e: '"By the way" = Bu arada. Konu değiştirirken kullanılır.', d: 2 },
  { q: '"As soon as possible" ne anlama gelir?', a: ['M�mk�n olduğunca ge�','En kısa s�rede','Zaman zaman','Hemen hemen'], c: 1, e: '"As soon as possible" (ASAP) = En kısa s�rede, m�mk�n olan en kısa zamanda.', d: 2 },
  { q: '"Keep in touch" ne anlama gelir?', a: ['Uzaklaş','İletişimi koru','Sessiz kal','Hızlı git'], c: 1, e: '"Keep in touch" = İletişimi koru, haberleş. Veda ederken kullanılır.', d: 2 },

  // Zıt Anlamlılar
  { q: '"Ancient" kelimesinin zıt anlamlısı nedir?', a: ['Eski','Antik','Modern','B�y�k'], c: 2, e: 'Ancient = Eski, antik. Zıt anlamlısı Modern (�ağdaş, yeni).', d: 2 },
  { q: '"Generous" kelimesinin T�rk�e anlamı nedir?', a: ['Cimri','C�mert','Kıskan�','Bencil'], c: 1, e: 'Generous = C�mert. Stingy/Greedy = Cimri (zıt anlamlısı).', d: 2 },
  { q: '"Brave" kelimesinin T�rk�e anlamı nedir?', a: ['Korkak','Cesur','Tembel','Akıllı'], c: 1, e: 'Brave = Cesur. Coward = Korkak (zıt anlamlısı).', d: 2 },

  // İş ve Kariyer
  { q: '"Experience" kelimesinin T�rk�e anlamı nedir?', a: ['Bilgisizlik','Deneyim/Tecr�be','Eğitim','Yetenek'], c: 1, e: 'Experience = Deneyim, tecr�be. "Work experience" = "İş deneyimi."', d: 2 },
  { q: '"Deadline" kelimesinin T�rk�e anlamı nedir?', a: ['Başlangı� tarihi','Son teslim tarihi','Tatil g�n�','Toplantı'], c: 1, e: 'Deadline = Son teslim tarihi. "The deadline is Friday." = "Son tarih Cuma."', d: 2 },

  // Teknoloji
  { q: '"Download" kelimesinin T�rk�e anlamı nedir?', a: ['Y�klemek','İndirmek','Silmek','A�mak'], c: 1, e: 'Download = İndirmek (internetten). Upload = Y�klemek (zıt anlamlısı).', d: 1 },
  { q: '"Password" kelimesinin T�rk�e anlamı nedir?', a: ['Kullanıcı adı','E-posta','Şifre/Parola','Hesap'], c: 2, e: 'Password = Şifre, parola. "Enter your password" = "Şifrenizi girin."', d: 1 },
  { q: '"Update" kelimesinin T�rk�e anlamı nedir?', a: ['Silmek','G�ncellemek','Kurmak','Kapatmak'], c: 1, e: 'Update = G�ncellemek. "Software update" = "Yazılım g�ncellemesi."', d: 1 },

  // Sayılar ve Rakamlar
  { q: '"Dozen" kelimesi ka� anlamına gelir?', a: ['5','10','12','20'], c: 2, e: '"A dozen" = 12. "A dozen eggs" = "12 yumurta."', d: 2 },
  { q: '"Couple" kelimesi genellikle ka� anlamında kullanılır?', a: ['1','2','5','10'], c: 1, e: '"A couple of" = 2 ya da birka�. "A couple of days" = "Birka� g�n."', d: 2 },

  // Sağlık
  { q: '"Headache" kelimesinin T�rk�e anlamı nedir?', a: ['Karın ağrısı','Baş ağrısı','Diş ağrısı','Boyun ağrısı'], c: 1, e: 'Headache = Baş ağrısı. Head = Baş + Ache = Ağrı.', d: 1 },
  { q: '"Fever" kelimesinin T�rk�e anlamı nedir?', a: ['�ks�r�k','Yorgunluk','Ateş (hastalık)','Burun akıntısı'], c: 2, e: 'Fever = Ateş (hastalık). "I have a fever" = "Ateşim var."', d: 2 },

  // Temel Fiiller
  { q: '"Run" kelimesinin T�rk�e anlamı nedir?', a: ['Y�r�mek','Koşmak','Atlamak','Oturmak'], c: 1, e: 'Run = Koşmak. "Run fast!" = "Hızlı koş!"', d: 1 },
  { q: '"Eat" kelimesinin T�rk�e anlamı nedir?', a: ['İ�mek','Uyumak','Yemek','Oynamak'], c: 2, e: 'Eat = Yemek. "What do you eat?" = "Ne yersin?"', d: 1 },
  { q: '"Sleep" kelimesinin T�rk�e anlamı nedir?', a: ['Uyanmak','Uyumak','Dinlenmek','Oturmak'], c: 1, e: 'Sleep = Uyumak. "I need to sleep." = "Uyumam lazım."', d: 1 },
  { q: '"Speak" kelimesinin T�rk�e anlamı nedir?', a: ['Dinlemek','Yazmak','Konuşmak','Okumak'], c: 2, e: 'Speak = Konuşmak. "Do you speak English?" = "İngilizce konuşuyor musun?"', d: 1 },
  { q: '"Buy" kelimesinin T�rk�e anlamı nedir?', a: ['Satmak','Almak/Satın almak','Vermek','�demek'], c: 1, e: 'Buy = Satın almak. Sell = Satmak (zıt anlamlısı).', d: 1 },
  { q: '"Come" kelimesinin T�rk�e anlamı nedir?', a: ['Gitmek','Gelmek','Kalmak','D�nmek'], c: 1, e: 'Come = Gelmek. Go = Gitmek (zıt anlamlısı).', d: 1 },
  { q: '"Give" kelimesinin T�rk�e anlamı nedir?', a: ['Almak','Vermek','G�ndermek','Tutmak'], c: 1, e: 'Give = Vermek. Take = Almak (zıt anlamlısı).', d: 1 },
  { q: '"Know" kelimesinin T�rk�e anlamı nedir?', a: ['�ğrenmek','Bilmek','Unutmak','Tahmin etmek'], c: 1, e: 'Know = Bilmek. "I don\'t know." = "Bilmiyorum."', d: 1 },
  { q: '"Think" kelimesinin T�rk�e anlamı nedir?', a: ['Hissetmek','G�rmek','D�ş�nmek','İnanmak'], c: 2, e: 'Think = D�ş�nmek. "I think so." = "�yle d�ş�n�yorum."', d: 1 },
  { q: '"Feel" kelimesinin T�rk�e anlamı nedir?', a: ['D�ş�nmek','Hissetmek','G�rmek','Duymak'], c: 1, e: 'Feel = Hissetmek. "How do you feel?" = "Nasıl hissediyorsun?"', d: 1 },
  { q: '"Leave" kelimesinin T�rk�e anlamı nedir?', a: ['Gelmek','Kalmak','Ayrılmak/Bırakmak','Gitmek'], c: 2, e: 'Leave = Ayrılmak, bırakmak. "I\'m leaving now." = "Şimdi ayrılıyorum."', d: 2 },
  { q: '"Need" kelimesinin T�rk�e anlamı nedir?', a: ['İstemek','İhtiya� duymak','Sevmek','Denemek'], c: 1, e: 'Need = İhtiya� duymak. "I need help." = "Yardıma ihtiyacım var."', d: 1 },
  { q: '"Wait" kelimesinin T�rk�e anlamı nedir?', a: ['Koşmak','Beklemek','Durmak','Gitmek'], c: 1, e: 'Wait = Beklemek. "Wait for me!" = "Beni bekle!"', d: 1 },
  { q: '"Help" kelimesinin T�rk�e anlamı nedir?', a: ['Engellemek','Yardım etmek','Zorlamak','Reddetmek'], c: 1, e: 'Help = Yardım etmek. "Can you help me?" = "Bana yardım edebilir misin?"', d: 1 },
  { q: '"Start" kelimesinin T�rk�e anlamı nedir?', a: ['Bitirmek','Durdurmak','Başlamak','Devam etmek'], c: 2, e: 'Start = Başlamak. Finish/End = Bitirmek (zıt anlamlısı).', d: 1 },
  { q: '"Try" kelimesinin T�rk�e anlamı nedir?', a: ['Vazge�mek','Denemek','Başarmak','Beklemek'], c: 1, e: 'Try = Denemek. "Try again!" = "Tekrar dene!"', d: 1 },
  { q: '"Show" kelimesinin T�rk�e anlamı nedir?', a: ['Saklamak','G�stermek','Bulmak','Kaybetmek'], c: 1, e: 'Show = G�stermek. "Show me!" = "G�ster bana!"', d: 1 },
  { q: '"Ask" kelimesinin T�rk�e anlamı nedir?', a: ['Cevaplamak','Sormak','S�ylemek','Dinlemek'], c: 1, e: 'Ask = Sormak. Answer = Cevaplamak (zıt anlamlısı).', d: 1 },
  { q: '"Find" kelimesinin T�rk�e anlamı nedir?', a: ['Kaybetmek','Aramak','Bulmak','Saklamak'], c: 2, e: 'Find = Bulmak. Lose = Kaybetmek (zıt anlamlısı).', d: 1 },
  { q: '"Open" kelimesinin T�rk�e anlamı nedir?', a: ['Kapatmak','A�mak','Kırmak','Taşımak'], c: 1, e: 'Open = A�mak. Close/Shut = Kapatmak (zıt anlamlısı).', d: 1 },
  { q: '"Bring" kelimesinin T�rk�e anlamı nedir?', a: ['G�t�rmek','Bırakmak','Getirmek','Atmak'], c: 2, e: 'Bring = Getirmek. Take = G�t�rmek (zıt anlamlısı).', d: 1 },
  { q: '"Put" kelimesinin T�rk�e anlamı nedir?', a: ['Almak','Koymak/Yerleştirmek','Kaldırmak','Taşımak'], c: 1, e: 'Put = Koymak. "Put it here." = "Buraya koy."', d: 1 },
  { q: '"Keep" kelimesinin T�rk�e anlamı nedir?', a: ['Vermek','Atmak','Tutmak/Saklamak','Kaybetmek'], c: 2, e: 'Keep = Tutmak, saklamak. "Keep it!" = "Sakla onu!"', d: 2 },
  { q: '"Change" kelimesinin T�rk�e anlamı nedir?', a: ['Korumak','Değiştirmek','Tekrarlamak','S�rd�rmek'], c: 1, e: 'Change = Değiştirmek. "Change your mind." = "Fikrini değiştir."', d: 1 },
  { q: '"Meet" kelimesinin T�rk�e anlamı nedir?', a: ['Ayrılmak','Tanışmak/Buluşmak','Ka�mak','Beklemek'], c: 1, e: 'Meet = Tanışmak, buluşmak. "Nice to meet you!" = "Tanıştığımıza memnun oldum!"', d: 1 },

  // Renk ve Şekil
  { q: '"Red" kelimesinin T�rk�e anlamı nedir?', a: ['Mavi','Yeşil','Kırmızı','Sarı'], c: 2, e: 'Red = Kırmızı. "Red rose" = "Kırmızı g�l."', d: 1 },
  { q: '"Blue" kelimesinin T�rk�e anlamı nedir?', a: ['Kırmızı','Mavi','Yeşil','Mor'], c: 1, e: 'Blue = Mavi. "Blue sky" = "Mavi g�ky�z�."', d: 1 },
  { q: '"Green" kelimesinin T�rk�e anlamı nedir?', a: ['Sarı','Turuncu','Yeşil','Kahverengi'], c: 2, e: 'Green = Yeşil. "Green park" = "Yeşil park."', d: 1 },
  { q: '"Yellow" kelimesinin T�rk�e anlamı nedir?', a: ['Beyaz','Sarı','Siyah','Gri'], c: 1, e: 'Yellow = Sarı. "Yellow sunflower" = "Sarı ay�i�eği."', d: 1 },
  { q: '"Black" kelimesinin T�rk�e anlamı nedir?', a: ['Beyaz','Gri','Siyah','Lacivert'], c: 2, e: 'Black = Siyah. White = Beyaz (zıt anlamlısı).', d: 1 },
  { q: '"White" kelimesinin T�rk�e anlamı nedir?', a: ['Siyah','Gri','Krem','Beyaz'], c: 3, e: 'White = Beyaz. Black = Siyah (zıt anlamlısı).', d: 1 },
  { q: '"Purple" kelimesinin T�rk�e anlamı nedir?', a: ['Pembe','Turuncu','Mor','Lacivert'], c: 2, e: 'Purple = Mor. "Purple grape" = "Mor �z�m."', d: 1 },
  { q: '"Orange" kelimesinin T�rk�e anlamı nedir?', a: ['Sarı','Turuncu','Kırmızı','Pembe'], c: 1, e: 'Orange = Turuncu (hem renk hem meyve). "Orange juice" = "Portakal suyu."', d: 1 },

  // Zaman ve Tarih
  { q: '"Yesterday" kelimesinin T�rk�e anlamı nedir?', a: ['Yarın','Bug�n','D�n','Ge�en hafta'], c: 2, e: 'Yesterday = D�n. Today = Bug�n, Tomorrow = Yarın.', d: 1 },
  { q: '"Tomorrow" kelimesinin T�rk�e anlamı nedir?', a: ['D�n','Bug�n','Yarın','�n�m�zdeki hafta'], c: 2, e: 'Tomorrow = Yarın. Yesterday = D�n (zıt anlamlısı).', d: 1 },
  { q: '"Always" kelimesinin T�rk�e anlamı nedir?', a: ['Hi�bir zaman','Bazen','Her zaman','Nadiren'], c: 2, e: 'Always = Her zaman. Never = Hi�bir zaman (zıt anlamlısı).', d: 1 },
  { q: '"Never" kelimesinin T�rk�e anlamı nedir?', a: ['Her zaman','Bazen','Nadiren','Hi�bir zaman'], c: 3, e: 'Never = Hi�bir zaman. "Never give up!" = "Asla pes etme!"', d: 1 },
  { q: '"Soon" kelimesinin T�rk�e anlamı nedir?', a: ['Ge�','Yakında/Kısa s�re sonra','Nadiren','Uzun s�re sonra'], c: 1, e: 'Soon = Yakında. "See you soon!" = "G�r�ş�r�z yakında!"', d: 1 },
  { q: '"Late" kelimesinin T�rk�e anlamı nedir?', a: ['Erken','Ge�','Hızlı','Yavaş'], c: 1, e: 'Late = Ge�. Early = Erken (zıt anlamlısı). "I\'m late!" = "Ge� kaldım!"', d: 1 },
  { q: '"Early" kelimesinin T�rk�e anlamı nedir?', a: ['Ge�','Erken','Hızlı','Zamanında'], c: 1, e: 'Early = Erken. "Wake up early!" = "Erken uyan!"', d: 1 },
  { q: '"Daily" kelimesinin T�rk�e anlamı nedir?', a: ['Haftalık','Aylık','G�nl�k','Yıllık'], c: 2, e: 'Daily = G�nl�k. Weekly = Haftalık, Monthly = Aylık.', d: 2 },
  { q: '"Weekly" kelimesinin T�rk�e anlamı nedir?', a: ['G�nl�k','Haftalık','Aylık','Yıllık'], c: 1, e: 'Weekly = Haftalık. "Weekly meeting" = "Haftalık toplantı."', d: 2 },

  // Yiyecek ve İ�ecek
  { q: '"Breakfast" kelimesinin T�rk�e anlamı nedir?', a: ['�ğle yemeği','Akşam yemeği','Kahvaltı','Atıştırmalık'], c: 2, e: 'Breakfast = Kahvaltı. "What\'s for breakfast?" = "Kahvaltıda ne var?"', d: 1 },
  { q: '"Lunch" kelimesinin T�rk�e anlamı nedir?', a: ['Kahvaltı','�ğle yemeği','Akşam yemeği','Ara �ğ�n'], c: 1, e: 'Lunch = �ğle yemeği. "Let\'s have lunch!" = "�ğle yemeği yiyelim!"', d: 1 },
  { q: '"Dinner" kelimesinin T�rk�e anlamı nedir?', a: ['Kahvaltı','�ğle yemeği','Akşam yemeği','Gece yemeği'], c: 2, e: 'Dinner = Akşam yemeği. "Dinner is ready!" = "Akşam yemeği hazır!"', d: 1 },
  { q: '"Hungry" kelimesinin T�rk�e anlamı nedir?', a: ['Tok','A�','Susuz','Yorgun'], c: 1, e: 'Hungry = A�. Full = Tok (zıt anlamlısı). "I\'m hungry!" = "A�ım!"', d: 1 },
  { q: '"Thirsty" kelimesinin T�rk�e anlamı nedir?', a: ['A�','Tok','Susuz','Hasta'], c: 2, e: 'Thirsty = Susuz. "I\'m thirsty." = "Susadım."', d: 1 },
  { q: '"Delicious" kelimesinin T�rk�e anlamı nedir?', a: ['Tatsız','Lezzetli','Acı','Tatlı'], c: 1, e: 'Delicious = Lezzetli, nefis. "It\'s delicious!" = "�ok lezzetli!"', d: 1 },
  { q: '"Sweet" kelimesinin T�rk�e anlamı nedir?', a: ['Acı','Ekşi','Tuzlu','Tatlı'], c: 3, e: 'Sweet = Tatlı. Bitter = Acı (zıt anlamlısı).', d: 1 },
  { q: '"Bitter" kelimesinin T�rk�e anlamı nedir?', a: ['Tatlı','Ekşi','Acı','Tuzlu'], c: 2, e: 'Bitter = Acı (tat). "Bitter coffee" = "Acı kahve."', d: 2 },
  { q: '"Milk" kelimesinin T�rk�e anlamı nedir?', a: ['Su','S�t','Meyve suyu','�ay'], c: 1, e: 'Milk = S�t. "A glass of milk" = "Bir bardak s�t."', d: 1 },
  { q: '"Bread" kelimesinin T�rk�e anlamı nedir?', a: ['Pirin�','Makarna','Ekmek','Un'], c: 2, e: 'Bread = Ekmek. "Fresh bread" = "Taze ekmek."', d: 1 },
  { q: '"Chicken" kelimesinin T�rk�e anlamı nedir?', a: ['Balık','Tavuk','Et','Dana'], c: 1, e: 'Chicken = Tavuk (yiyecek olarak). "Chicken soup" = "Tavuk �orbası."', d: 1 },

  // Ulaşım ve Seyahat
  { q: '"Airport" kelimesinin T�rk�e anlamı nedir?', a: ['Liman','Tren garı','Havalimanı','Otob�s terminali'], c: 2, e: 'Airport = Havalimanı. "I\'m at the airport." = "Havalimanındayım."', d: 1 },
  { q: '"Ticket" kelimesinin T�rk�e anlamı nedir?', a: ['Pasaport','Vize','Bilet','Rezervasyon'], c: 2, e: 'Ticket = Bilet. "Two tickets, please!" = "İki bilet l�tfen!"', d: 1 },
  { q: '"Passport" kelimesinin T�rk�e anlamı nedir?', a: ['Kimlik','Pasaport','Vize','Ehliyet'], c: 1, e: 'Passport = Pasaport. "Show your passport." = "Pasaportunuzu g�sterin."', d: 1 },
  { q: '"Hotel" kelimesinin T�rk�e anlamı nedir?', a: ['Restoran','Otel','Hastane','Okul'], c: 1, e: 'Hotel = Otel. "Book a hotel room." = "Otel odası ayırt."', d: 1 },
  { q: '"Journey" kelimesinin T�rk�e anlamı nedir?', a: ['Tatil','Yolculuk','Macera','Keşif'], c: 1, e: 'Journey = Yolculuk. Trip ve Travel ile benzer anlam taşır.', d: 2 },
  { q: '"Departure" kelimesinin T�rk�e anlamı nedir?', a: ['Varış','Kalkış/Ayrılış','Bekleme','Gecikmе'], c: 1, e: 'Departure = Kalkış, ayrılış. Arrival = Varış (zıt anlamlısı).', d: 2 },
  { q: '"Arrival" kelimesinin T�rk�e anlamı nedir?', a: ['Kalkış','Varış','Gecikmе','Biniş'], c: 1, e: 'Arrival = Varış. Departure = Kalkış (zıt anlamlısı).', d: 2 },

  // V�cut ve Sağlık
  { q: '"Heart" kelimesinin T�rk�e anlamı nedir?', a: ['Akciğer','Beyin','Kalp','Mide'], c: 2, e: 'Heart = Kalp. "Heart rate" = "Kalp atış hızı."', d: 1 },
  { q: '"Eye" kelimesinin T�rk�e anlamı nedir?', a: ['Kulak','Burun','G�z','Ağız'], c: 2, e: 'Eye = G�z. "Beautiful eyes" = "G�zel g�zler."', d: 1 },
  { q: '"Hand" kelimesinin T�rk�e anlamı nedir?', a: ['Ayak','El','Kol','Parmak'], c: 1, e: 'Hand = El. "Wash your hands!" = "Ellerini yıka!"', d: 1 },
  { q: '"Leg" kelimesinin T�rk�e anlamı nedir?', a: ['Kol','El','Bacak','Ayak'], c: 2, e: 'Leg = Bacak. "Broken leg" = "Kırık bacak."', d: 1 },
  { q: '"Healthy" kelimesinin T�rk�e anlamı nedir?', a: ['Hasta','Yorgun','Sağlıklı','Zayıf'], c: 2, e: 'Healthy = Sağlıklı. Sick/Ill = Hasta (zıt anlamlısı).', d: 1 },
  { q: '"Medicine" kelimesinin T�rk�e anlamı nedir?', a: ['Ameliyat','İla�/Tıp','Doktor','Hastane'], c: 1, e: 'Medicine = İla� veya tıp. "Take your medicine." = "İlacını al."', d: 1 },
  { q: '"Hospital" kelimesinin T�rk�e anlamı nedir?', a: ['Eczane','Klinik','Hastane','Doktor'], c: 2, e: 'Hospital = Hastane. "Go to the hospital." = "Hastaneye git."', d: 1 },

  // Duygular ve Sıfatlar
  { q: '"Angry" kelimesinin T�rk�e anlamı nedir?', a: ['Mutlu','�zg�n','Kızgın','Yorgun'], c: 2, e: 'Angry = Kızgın. "Don\'t be angry!" = "Kızma!"', d: 1 },
  { q: '"Sad" kelimesinin T�rk�e anlamı nedir?', a: ['Mutlu','�zg�n','Korkmuş','Şaşırmış'], c: 1, e: 'Sad = �zg�n. Happy = Mutlu (zıt anlamlısı).', d: 1 },
  { q: '"Excited" kelimesinin T�rk�e anlamı nedir?', a: ['Sıkılmış','Heyecanlı','Yorgun','Endişeli'], c: 1, e: 'Excited = Heyecanlı. "I\'m so excited!" = "�ok heyecanlıyım!"', d: 1 },
  { q: '"Tired" kelimesinin T�rk�e anlamı nedir?', a: ['Din�','Enerjik','Yorgun','Uyanık'], c: 2, e: 'Tired = Yorgun. "I\'m so tired." = "�ok yorgunum."', d: 1 },
  { q: '"Scared" kelimesinin T�rk�e anlamı nedir?', a: ['Cesur','G�venli','Korkmuş','Rahat'], c: 2, e: 'Scared = Korkmuş. "I\'m scared!" = "Korktum!"', d: 1 },
  { q: '"Surprised" kelimesinin T�rk�e anlamı nedir?', a: ['Beklentili','Şaşırmış','Hayal kırıklığına uğramış','Memnun'], c: 1, e: 'Surprised = Şaşırmış. "I\'m surprised!" = "Şaşırdım!"', d: 1 },
  { q: '"Bored" kelimesinin T�rk�e anlamı nedir?', a: ['Heyecanlı','Mutlu','Sıkılmış','Meraklı'], c: 2, e: 'Bored = Sıkılmış. "I\'m bored." = "Sıkıldım."', d: 1 },
  { q: '"Nervous" kelimesinin T�rk�e anlamı nedir?', a: ['Rahat','G�venli','Gergin/Sinirli','Mutlu'], c: 2, e: 'Nervous = Gergin. "I\'m nervous about the exam." = "Sınav i�in gerginim."', d: 2 },

  // Eğitim
  { q: '"School" kelimesinin T�rk�e anlamı nedir?', a: ['�niversite','Okul','K�t�phane','Sınıf'], c: 1, e: 'School = Okul. "Go to school." = "Okula git."', d: 1 },
  { q: '"Teacher" kelimesinin T�rk�e anlamı nedir?', a: ['�ğrenci','M�d�r','�ğretmen','Asistan'], c: 2, e: 'Teacher = �ğretmen. Student = �ğrenci.', d: 1 },
  { q: '"Student" kelimesinin T�rk�e anlamı nedir?', a: ['�ğretmen','�ğrenci','Mezun','Stajyer'], c: 1, e: 'Student = �ğrenci. "I am a student." = "�ğrenciyim."', d: 1 },
  { q: '"Exam" kelimesinin T�rk�e anlamı nedir?', a: ['�dev','Sınav','Ders','Proje'], c: 1, e: 'Exam = Sınav. "Pass the exam." = "Sınavı ge�."', d: 1 },
  { q: '"Homework" kelimesinin T�rk�e anlamı nedir?', a: ['Sınav','Proje','Ev �devi','Ders'], c: 2, e: 'Homework = Ev �devi. "Do your homework!" = "�devini yap!"', d: 1 },
  { q: '"Learn" kelimesinin T�rk�e anlamı nedir?', a: ['�ğretmek','Unutmak','�ğrenmek','Tekrarlamak'], c: 2, e: 'Learn = �ğrenmek. Teach = �ğretmek.', d: 1 },
  { q: '"Library" kelimesinin T�rk�e anlamı nedir?', a: ['Kitap�ı','Okul','K�t�phane','Arşiv'], c: 2, e: 'Library = K�t�phane. "Study in the library." = "K�t�phanede �alış."', d: 1 },

  // Ev ve Yaşam
  { q: '"Kitchen" kelimesinin T�rk�e anlamı nedir?', a: ['Banyo','Yatak odası','Mutfak','Oturma odası'], c: 2, e: 'Kitchen = Mutfak. "Cook in the kitchen." = "Mutfakta pişir."', d: 1 },
  { q: '"Bedroom" kelimesinin T�rk�e anlamı nedir?', a: ['Mutfak','Banyo','Yatak odası','Balkon'], c: 2, e: 'Bedroom = Yatak odası. "My bedroom is small." = "Yatak odam k���k."', d: 1 },
  { q: '"Window" kelimesinin T�rk�e anlamı nedir?', a: ['Kapı','Pencere','Duvar','Tavan'], c: 1, e: 'Window = Pencere. "Open the window." = "Pencereyi a�."', d: 1 },
  { q: '"Door" kelimesinin T�rk�e anlamı nedir?', a: ['Pencere','Kapı','Duvar','Merdiven'], c: 1, e: 'Door = Kapı. "Close the door." = "Kapıyı kapat."', d: 1 },
  { q: '"Clean" kelimesinin T�rk�e anlamı nedir?', a: ['Kirli','Temiz','D�zenli','Dağınık'], c: 1, e: 'Clean = Temiz. Dirty = Kirli (zıt anlamlısı). "Keep it clean!" = "Temiz tut!"', d: 1 },
  { q: '"Dirty" kelimesinin T�rk�e anlamı nedir?', a: ['Temiz','Parlak','Kirli','D�zg�n'], c: 2, e: 'Dirty = Kirli. Clean = Temiz (zıt anlamlısı).', d: 1 },

  // Doğa ve �evre
  { q: '"Mountain" kelimesinin T�rk�e anlamı nedir?', a: ['Deniz','Nehir','Dağ','Orman'], c: 2, e: 'Mountain = Dağ. "Climb a mountain." = "Dağa tırman."', d: 1 },
  { q: '"River" kelimesinin T�rk�e anlamı nedir?', a: ['G�l','Okyanus','Nehir','Dere'], c: 2, e: 'River = Nehir. "The river flows fast." = "Nehir hızlı akıyor."', d: 1 },
  { q: '"Forest" kelimesinin T�rk�e anlamı nedir?', a: ['�ayır','��l','Orman','Bah�e'], c: 2, e: 'Forest = Orman. "Deep forest" = "Derin orman."', d: 1 },
  { q: '"Sun" kelimesinin T�rk�e anlamı nedir?', a: ['Ay','Yıldız','G�neş','Bulut'], c: 2, e: 'Sun = G�neş. "The sun is shining." = "G�neş parlıyor."', d: 1 },
  { q: '"Moon" kelimesinin T�rk�e anlamı nedir?', a: ['G�neş','Yıldız','Ay','G�k'], c: 2, e: 'Moon = Ay. "Full moon" = "Dolunay."', d: 1 },
  { q: '"Rain" kelimesinin T�rk�e anlamı nedir?', a: ['Kar','Fırtına','Yağmur','R�zgar'], c: 2, e: 'Rain = Yağmur. "It\'s raining." = "Yağmur yağıyor."', d: 1 },
  { q: '"Snow" kelimesinin T�rk�e anlamı nedir?', a: ['Yağmur','Dolu','Kar','Buz'], c: 2, e: 'Snow = Kar. "It\'s snowing." = "Kar yağıyor."', d: 1 },
  { q: '"Wind" kelimesinin T�rk�e anlamı nedir?', a: ['Yağmur','G�neş','Fırtına','R�zgar'], c: 3, e: 'Wind = R�zgar. "Strong wind." = "G��l� r�zgar."', d: 1 },

  // İş Hayatı
  { q: '"Meeting" kelimesinin T�rk�e anlamı nedir?', a: ['Sunum','Toplantı','Rapor','Proje'], c: 1, e: 'Meeting = Toplantı. "I have a meeting." = "Toplantım var."', d: 1 },
  { q: '"Manager" kelimesinin T�rk�e anlamı nedir?', a: ['�alışan','M�d�r/Y�netici','M�şteri','Ortak'], c: 1, e: 'Manager = M�d�r, y�netici. "My manager is strict." = "M�d�r�m sert."', d: 2 },
  { q: '"Salary" kelimesinin T�rk�e anlamı nedir?', a: ['Prim','Maaş','Vergi','Bor�'], c: 1, e: 'Salary = Maaş. "Monthly salary" = "Aylık maaş."', d: 2 },
  { q: '"Company" kelimesinin T�rk�e anlamı nedir?', a: ['Fabrika','Mağaza','Şirket','Ofis'], c: 2, e: 'Company = Şirket. "Big company" = "B�y�k şirket."', d: 1 },
  { q: '"Project" kelimesinin T�rk�e anlamı nedir?', a: ['Rapor','Sunum','Proje','G�rev'], c: 2, e: 'Project = Proje. "Work on a project." = "Bir proje �zerinde �alış."', d: 1 },

  // B2 - İleri Seviye
  { q: '"Ambiguous" kelimesinin T�rk�e anlamı nedir?', a: ['Net','A�ık','Belirsiz/Muğlak','Kesin'], c: 2, e: 'Ambiguous = Belirsiz, muğlak. "The answer is ambiguous." = "Cevap muğlak."', d: 3 },
  { q: '"Persuade" kelimesinin T�rk�e anlamı nedir?', a: ['Zorunlu kılmak','İkna etmek','Engellemek','Kandırmak'], c: 1, e: 'Persuade = İkna etmek. "I persuaded him to come." = "Onu gelmeye ikna ettim."', d: 3 },
  { q: '"Flexible" kelimesinin T�rk�e anlamı nedir?', a: ['Sert','Katı','Esnek','Kırılgan'], c: 2, e: 'Flexible = Esnek. "Flexible schedule" = "Esnek program."', d: 3 },
  { q: '"Reliable" kelimesinin T�rk�e anlamı nedir?', a: ['G�venilmez','G�venilir','Değişken','Tutarsız'], c: 1, e: 'Reliable = G�venilir. "A reliable friend" = "G�venilir bir arkadaş."', d: 3 },
  { q: '"Curious" kelimesinin T�rk�e anlamı nedir?', a: ['Kayıtsız','Sıkılmış','Meraklı','Bilgili'], c: 2, e: 'Curious = Meraklı. "Curiosity killed the cat." = "Merak kedinin canına mal olur."', d: 2 },
  { q: '"Patience" kelimesinin T�rk�e anlamı nedir?', a: ['Sinir','Sabırsızlık','Sabır','�fke'], c: 2, e: 'Patience = Sabır. "Have patience." = "Sabırlı ol."', d: 2 },
  { q: '"Improve" kelimesinin T�rk�e anlamı nedir?', a: ['Bozmak','Geliştirmek/İyileştirmek','Azaltmak','Durdurmak'], c: 1, e: 'Improve = Geliştirmek, iyileştirmek. "Improve your English." = "İngilizceni geliştir."', d: 2 },
  { q: '"Reduce" kelimesinin T�rk�e anlamı nedir?', a: ['Artırmak','Azaltmak','Korumak','Değiştirmek'], c: 1, e: 'Reduce = Azaltmak. "Reduce stress." = "Stresi azalt."', d: 3 },
  { q: '"Avoid" kelimesinin T�rk�e anlamı nedir?', a: ['Aramak','Bulmak','Ka�ınmak','Y�zleşmek'], c: 2, e: 'Avoid = Ka�ınmak. "Avoid junk food." = "Fast fooddan ka�ın."', d: 3 },
  { q: '"Succeed" kelimesinin T�rk�e anlamı nedir?', a: ['Başarısız olmak','Denemek','Başarmak','Vazge�mek'], c: 2, e: 'Succeed = Başarmak. "You will succeed!" = "Başaracaksın!"', d: 2 },
  { q: '"Fail" kelimesinin T�rk�e anlamı nedir?', a: ['Başarmak','Başarısız olmak','Denemek','Ge�mek'], c: 1, e: 'Fail = Başarısız olmak. "Don\'t be afraid to fail." = "Başarısız olmaktan korkma."', d: 2 },

  // Sık Kullanılan İfadeler
  { q: '"Break a leg!" ne anlama gelir?', a: ['Bacağını kır','İyi şanslar','Acele et','Dinlen'], c: 1, e: '"Break a leg!" = İyi şanslar! Sahne sanatlarında kullanılan tiyatro jargonu.', d: 3 },
  { q: '"Hit the sack" ne anlama gelir?', a: ['�antaya vur','Yatmaya gitmek','Spor yapmak','�alışmak'], c: 1, e: '"Hit the sack" = Yatmaya gitmek. "I\'m going to hit the sack." = "Yatmaya gidiyorum."', d: 3 },
  { q: '"Under the weather" ifadesi ne anlama gelir?', a: ['Hava altında','Harika hissetmek','Kendini iyi hissememek','Dışarıda olmak'], c: 2, e: '"Under the weather" = Kendini iyi hissetmemek, hasta olmak.', d: 3 },
  { q: '"Once in a blue moon" ne anlama gelir?', a: ['Her gece','�ok nadiren','Her ay','Mavi ışıkta'], c: 1, e: '"Once in a blue moon" = �ok nadiren. "He calls once in a blue moon." = "�ok nadir arar."', d: 3 },
  { q: '"Piece of cake" ne anlama gelir?', a: ['Pasta dilimi','�ok zor','�ok kolay','Yemek zamanı'], c: 2, e: '"Piece of cake" = �ok kolay. "The test was a piece of cake." = "Sınav �ok kolaydı."', d: 2 },
  { q: '"Cost an arm and a leg" ne anlama gelir?', a: ['�ok ucuz','�ok pahalı','Bedava','Orta fiyatlı'], c: 1, e: '"Cost an arm and a leg" = �ok pahalıya mal olmak. "That car costs an arm and a leg."', d: 3 },
  { q: '"Spill the beans" ne anlama gelir?', a: ['Fasulye d�kmek','Sırrı ifşa etmek','Yemek yapmak','Temizlemek'], c: 1, e: '"Spill the beans" = Sırrı a�ığa vurmak, ağzından ka�ırmak.', d: 3 },
  { q: '"It\'s raining cats and dogs" ne anlama gelir?', a: ['Hayvanlar yağıyor','�ok yoğun yağmur yağıyor','G�zel bir hava var','R�zgar esiyor'], c: 1, e: '"It\'s raining cats and dogs" = Bardaktan boşanırcasına yağmur yağıyor.', d: 3 },

  // Zıt Anlamlılar
  { q: '"Expensive" kelimesinin zıt anlamlısı nedir?', a: ['Pahalı','Ucuz','Kaliteli','Değersiz'], c: 1, e: 'Expensive = Pahalı. Zıt anlamlısı Cheap = Ucuz.', d: 1 },
  { q: '"Fast" kelimesinin zıt anlamlısı nedir?', a: ['Hızlı','Ani','Yavaş','Ağır'], c: 2, e: 'Fast = Hızlı. Zıt anlamlısı Slow = Yavaş.', d: 1 },
  { q: '"Hard" kelimesinin zıt anlamlısı nedir?', a: ['Sert','Yumuşak','Katı','Kırılgan'], c: 1, e: 'Hard = Sert/Zor. Zıt anlamlısı Soft = Yumuşak / Easy = Kolay.', d: 2 },
  { q: '"Light" kelimesinin zıt anlamlısı nedir?', a: ['Parlak','A�ık','Ağır','Karanlık'], c: 2, e: 'Light = Hafif/Aydınlık. Zıt anlamlısı Heavy = Ağır / Dark = Karanlık.', d: 2 },
  { q: '"Hot" kelimesinin zıt anlamlısı nedir?', a: ['Sıcak','Soğuk','Ilık','Donuk'], c: 1, e: 'Hot = Sıcak. Zıt anlamlısı Cold = Soğuk.', d: 1 },
  { q: '"Long" kelimesinin zıt anlamlısı nedir?', a: ['Uzun','Kısa','Geniş','Dar'], c: 1, e: 'Long = Uzun. Zıt anlamlısı Short = Kısa.', d: 1 },
  { q: '"Old" kelimesinin zıt anlamlısı nedir?', a: ['Yaşlı','Eski','Yeni/Gen�','B�y�k'], c: 2, e: 'Old = Eski/Yaşlı. Zıt anlamlısı New = Yeni / Young = Gen�.', d: 1 },
  { q: '"Full" kelimesinin zıt anlamlısı nedir?', a: ['Dolu','Boş','A�ık','Az'], c: 1, e: 'Full = Dolu. Zıt anlamlısı Empty = Boş.', d: 1 },

  // Dilbilgisi Soruları
  { q: '"She ___ to school every day." c�mlesinde boşluğa ne gelir?', a: ['go','goes','going','gone'], c: 1, e: 'She/He/It ile geniş zaman: fiil + s/es. "She goes" doğrudur.', d: 2 },
  { q: '"I ___ watching TV when you called." c�mlesinde boşluğa ne gelir?', a: ['was','were','am','is'], c: 0, e: 'I ile ge�miş s�regelen zaman: "I was". "I was watching TV."', d: 3 },
  { q: '"They ___ friends for 10 years." c�mlesinde boşluğa ne gelir?', a: ['are','were','have been','will be'], c: 2, e: '"For 10 years" ile present perfect kullanılır: "have been."', d: 3 },
  { q: '"If I ___ rich, I would travel the world." c�mlesinde boşluğa ne gelir?', a: ['am','was','were','will be'], c: 2, e: 'İkinci tip koşul c�mlelerinde "if" den sonra "were" kullanılır.', d: 3 },
  { q: '"She ___ her keys." � Anahtarlarını kaybetti. Boşluğa ne gelir?', a: ['lose','lost','loses','losing'], c: 1, e: 'Ge�miş zaman (past simple): lose → lost. "She lost her keys."', d: 2 },
  { q: '"Can you speak ___ slowly, please?" � Boşluğa ne gelir?', a: ['more','most','very','much'], c: 0, e: 'Karşılaştırma (comparative): slowly → more slowly. "Can you speak more slowly?"', d: 3 },

  // Sayılar ve Matematik
  { q: '"Hundred" ka� anlamına gelir?', a: ['10','50','100','1000'], c: 2, e: 'Hundred = 100. "One hundred" = 100, "Two hundred" = 200.', d: 1 },
  { q: '"Thousand" ka� anlamına gelir?', a: ['100','500','1.000','10.000'], c: 2, e: 'Thousand = 1.000. "Five thousand" = 5.000.', d: 1 },
  { q: '"Half" ne anlama gelir?', a: ['�eyrek','Yarım','��te bir','Tamamı'], c: 1, e: 'Half = Yarım. "Half an hour" = "Yarım saat."', d: 1 },
  { q: '"Double" ne anlama gelir?', a: ['Yarısı','İki katı','�� katı','D�rtte biri'], c: 1, e: 'Double = İki katı. "Double the price" = "Fiyatın iki katı."', d: 2 },

  // Bağla�lar ve Prepositions
  { q: '"Although" kelimesinin T�rk�e anlamı nedir?', a: ['��nk�','Eğer','Her ne kadar/Rağmen','Bu y�zden'], c: 2, e: 'Although = Her ne kadar, rağmen. "Although it rained, we went out."', d: 3 },
  { q: '"However" kelimesinin T�rk�e anlamı nedir?', a: ['Ayrıca','Bununla birlikte/Ancak','Bu y�zden','�rneğin'], c: 1, e: 'However = Ancak, bununla birlikte. Contrast (zıtlık) i�in kullanılır.', d: 3 },
  { q: '"Therefore" kelimesinin T�rk�e anlamı nedir?', a: ['Ancak','Ayrıca','Bu y�zden/Dolayısıyla','Her ne kadar'], c: 2, e: 'Therefore = Bu y�zden. "It was raining, therefore we stayed home."', d: 3 },
  { q: '"Besides" kelimesinin T�rk�e anlamı nedir?', a: ['Bunun yerine','Aksine','Bunun yanı sıra','Rağmen'], c: 2, e: 'Besides = Bunun yanı sıra. "Besides English, I speak French."', d: 3 },
  { q: '"Instead" kelimesinin T�rk�e anlamı nedir?', a: ['Ayrıca','Bunun yerine','Rağmen','Sonu� olarak'], c: 1, e: 'Instead = Bunun yerine. "Instead of coffee, I had tea."', d: 3 },

  // Hayvanlar
  { q: '"Dog" kelimesinin T�rk�e anlamı nedir?', a: ['Kedi','K�pek','At','Tavşan'], c: 1, e: 'Dog = K�pek. "Good dog!" = "Aferin k�peğim!"', d: 1 },
  { q: '"Cat" kelimesinin T�rk�e anlamı nedir?', a: ['K�pek','Fare','Kedi','Kuş'], c: 2, e: 'Cat = Kedi. "Cats are independent animals." = "Kediler bağımsız hayvanlardır."', d: 1 },
  { q: '"Horse" kelimesinin T�rk�e anlamı nedir?', a: ['İnek','At','Eşek','Deve'], c: 1, e: 'Horse = At. "Ride a horse." = "Ata bin."', d: 1 },
  { q: '"Bird" kelimesinin T�rk�e anlamı nedir?', a: ['Balık','B�cek','Kuş','Kelebek'], c: 2, e: 'Bird = Kuş. "Birds can fly." = "Kuşlar u�abilir."', d: 1 },
  { q: '"Fish" kelimesinin T�rk�e anlamı nedir?', a: ['Kurbağa','Balık','Yılan','Timsah'], c: 1, e: 'Fish = Balık. "Catch a fish." = "Balık tut."', d: 1 },

  // Sosyal Medya ve Modern Kavramlar
  { q: '"Follower" kelimesinin T�rk�e anlamı nedir?', a: ['Takip�i','Lider','Arkadaş','Abone'], c: 0, e: 'Follower = Takip�i. Sosyal medyada hesabı takip eden kişi.', d: 1 },
  { q: '"Share" kelimesinin T�rk�e anlamı nedir?', a: ['Saklamak','Silmek','Paylaşmak','Y�klemek'], c: 2, e: 'Share = Paylaşmak. "Share this post." = "Bu g�nderiyi paylaş."', d: 1 },
  { q: '"Comment" kelimesinin T�rk�e anlamı nedir?', a: ['Beğeni','Yorum','G�nderi','Hikaye'], c: 1, e: 'Comment = Yorum. "Leave a comment." = "Yorum bırak."', d: 1 },
  { q: '"Notification" kelimesinin T�rk�e anlamı nedir?', a: ['Mesaj','Bildirim','Arama','Hatırlatma'], c: 1, e: 'Notification = Bildirim. "Turn off notifications." = "Bildirimleri kapat."', d: 2 },
  { q: '"Subscription" kelimesinin T�rk�e anlamı nedir?', a: ['İndirim','�yelik/Abonelik','�deme','Hesap'], c: 1, e: 'Subscription = Abonelik. "Monthly subscription" = "Aylık abonelik."', d: 2 },

  // Alışveriş
  { q: '"Discount" kelimesinin T�rk�e anlamı nedir?', a: ['Zam','İndirim','Fiyat','Vergi'], c: 1, e: 'Discount = İndirim. "10% discount" = "%10 indirim."', d: 1 },
  { q: '"Receipt" kelimesinin T�rk�e anlamı nedir?', a: ['Fatura','Fiş/Makbuz','S�zleşme','Kart'], c: 1, e: 'Receipt = Makbuz, fiş. "Keep your receipt." = "Fişini sakla."', d: 2 },
  { q: '"Refund" kelimesinin T�rk�e anlamı nedir?', a: ['�deme','Para iadesi','Değişim','İndirim'], c: 1, e: 'Refund = Para iadesi. "I want a refund." = "Para iadesi istiyorum."', d: 2 },
  { q: '"Cash" kelimesinin T�rk�e anlamı nedir?', a: ['Kredi kartı','�ek','Nakit','Havale'], c: 2, e: 'Cash = Nakit. "Pay in cash." = "Nakit �de."', d: 1 },
  { q: '"Afford" kelimesinin T�rk�e anlamı nedir?', a: ['Harcamak','Kazanmak','Karşılayabilmek','Tasarruf etmek'], c: 2, e: 'Afford = Maddi olarak karşılayabilmek. "I can\'t afford it." = "Buna param yetmez."', d: 2 },

  // Meslekler
  { q: '"Doctor" kelimesinin T�rk�e anlamı nedir?', a: ['Hemşire','Diş hekimi','Doktor','Eczacı'], c: 2, e: 'Doctor = Doktor. "See a doctor." = "Doktora git."', d: 1 },
  { q: '"Engineer" kelimesinin T�rk�e anlamı nedir?', a: ['Mimar','M�hendis','Teknisyen','Bilim insanı'], c: 1, e: 'Engineer = M�hendis. "Software engineer" = "Yazılım m�hendisi."', d: 1 },
  { q: '"Lawyer" kelimesinin T�rk�e anlamı nedir?', a: ['Hakim','Avukat','Savcı','Noter'], c: 1, e: 'Lawyer = Avukat. "I need a lawyer." = "Bir avukata ihtiyacım var."', d: 2 },
  { q: '"Chef" kelimesinin T�rk�e anlamı nedir?', a: ['Garson','Aş�ı/Şef','Kasap','Fırıncı'], c: 1, e: 'Chef = Aş�ı, şef. "Head chef" = "Baş aş�ı."', d: 1 },
  { q: '"Pilot" kelimesinin T�rk�e anlamı nedir?', a: ['Kaptan','Pilot','Hostes','Kontrol�r'], c: 1, e: 'Pilot = Pilot. "The pilot landed safely." = "Pilot g�venli indi."', d: 1 },

  // Spor
  { q: '"Win" kelimesinin T�rk�e anlamı nedir?', a: ['Kaybetmek','Berabere kalmak','Kazanmak','Oynamak'], c: 2, e: 'Win = Kazanmak. Lose = Kaybetmek (zıt anlamlısı).', d: 1 },
  { q: '"Lose" kelimesinin T�rk�e anlamı nedir?', a: ['Kazanmak','Kaybetmek','Berabere kalmak','Oynamak'], c: 1, e: 'Lose = Kaybetmek. Win = Kazanmak (zıt anlamlısı).', d: 1 },
  { q: '"Score" kelimesinin T�rk�e anlamı nedir?', a: ['Saat','Skor/Puan','Gol','Ma�'], c: 1, e: 'Score = Skor, puan. "What\'s the score?" = "Skor ka�?"', d: 1 },
  { q: '"Team" kelimesinin T�rk�e anlamı nedir?', a: ['Oyuncu','Takım','Antren�r','Hakem'], c: 1, e: 'Team = Takım. "Team player" = "Takım oyuncusu."', d: 1 },
  { q: '"Champion" kelimesinin T�rk�e anlamı nedir?', a: ['Finalist','Şampiyon','Yarı finalist','Aday'], c: 1, e: 'Champion = Şampiyon. "World champion" = "D�nya şampiyonu."', d: 1 },
  { q: '"Practice" kelimesinin T�rk�e anlamı nedir?', a: ['Dinlenmek','Ma� yapmak','Antrenman/Pratik yapmak','Yarışmak'], c: 2, e: 'Practice = Pratik yapmak, antrenman. "Practice makes perfect." = "Pratik m�kemmeli yaratır."', d: 2 },

  // Karakter ve Kişilik
  { q: '"Honest" kelimesinin T�rk�e anlamı nedir?', a: ['Yalancı','D�r�st','Kıskan�','Bencil'], c: 1, e: 'Honest = D�r�st. Dishonest = D�r�st olmayan.', d: 2 },
  { q: '"Lazy" kelimesinin T�rk�e anlamı nedir?', a: ['�alışkan','Hızlı','Tembel','G��l�'], c: 2, e: 'Lazy = Tembel. Hardworking = �alışkan (zıt anlamlısı).', d: 1 },
  { q: '"Smart" kelimesinin T�rk�e anlamı nedir?', a: ['Aptal','Zeki/Akıllı','G��l�','Hızlı'], c: 1, e: 'Smart = Zeki, akıllı. "Smart student" = "Zeki �ğrenci."', d: 1 },
  { q: '"Polite" kelimesinin T�rk�e anlamı nedir?', a: ['Kaba','Kibar','Sessiz','�ekingen'], c: 1, e: 'Polite = Kibar. Rude = Kaba (zıt anlamlısı).', d: 2 },
  { q: '"Rude" kelimesinin T�rk�e anlamı nedir?', a: ['Kibar','Nazik','Kaba','Saygılı'], c: 2, e: 'Rude = Kaba. Polite = Kibar (zıt anlamlısı).', d: 2 },
  { q: '"Clever" kelimesinin T�rk�e anlamı nedir?', a: ['Aptal','Yavaş','Zeki','Tembel'], c: 2, e: 'Clever = Zeki, kurnaz. Smart ile benzer anlam.', d: 2 },
  { q: '"Shy" kelimesinin T�rk�e anlamı nedir?', a: ['Dışa d�n�k','Sosyal','�ekingen/Utanga�','Cesur'], c: 2, e: 'Shy = �ekingen, utanga�. Outgoing = Dışa d�n�k (zıt anlamlısı).', d: 2 },
  { q: '"Kind" kelimesinin T�rk�e anlamı nedir?', a: ['K�t�','Acımasız','Nazik/İyi kalpli','Bencil'], c: 2, e: 'Kind = Nazik, iyi kalpli. "Be kind to others." = "Başkalarına nazik ol."', d: 1 },

  // Duyular
  { q: '"Smell" kelimesinin T�rk�e anlamı nedir?', a: ['Dokunmak','G�rmek','Koklama/Koku','Tatmak'], c: 2, e: 'Smell = Koku / Koklamak. "What\'s that smell?" = "Bu ne kokusu?"', d: 1 },
  { q: '"Touch" kelimesinin T�rk�e anlamı nedir?', a: ['G�rmek','Duymak','Dokunmak','Tatmak'], c: 2, e: 'Touch = Dokunmak. "Don\'t touch!" = "Dokunma!"', d: 1 },
  { q: '"Hear" kelimesinin T�rk�e anlamı nedir?', a: ['G�rmek','Duymak','Hissetmek','Tatmak'], c: 1, e: 'Hear = Duymak. Listen = Dinlemek (aktif dinleme). "I hear music." = "M�zik duyuyorum."', d: 1 },
  { q: '"Taste" kelimesinin T�rk�e anlamı nedir?', a: ['Koklama','Dokunma','G�rme','Tat/Tatmak'], c: 3, e: 'Taste = Tat, tatmak. "It tastes good!" = "İyi tadı var!"', d: 1 },

  // Zaman Kalıpları
  { q: '"Right now" ne anlama gelir?', a: ['Hemen sonra','Şu an/Hemen şimdi','Biraz sonra','Daha �nce'], c: 1, e: '"Right now" = Şu an, tam şu anda. "I\'m busy right now." = "Şu an meşgul�m."', d: 1 },
  { q: '"So far" ne anlama gelir?', a: ['�ok uzakta','Şimdiye kadar','İleride','Sonunda'], c: 1, e: '"So far" = Şimdiye kadar. "So far so good." = "Şimdiye kadar iyi."', d: 2 },
  { q: '"From now on" ne anlama gelir?', a: ['Bundan �nce','Bundan sonra/Artık','Arada bir','Ge�mişte'], c: 1, e: '"From now on" = Bundan sonra, artık. "From now on, I will exercise daily."', d: 2 },
  { q: '"At the moment" ne anlama gelir?', a: ['Bir an i�in','Şu an/Şu sıralar','Uzun s�re �nce','�ok yakında'], c: 1, e: '"At the moment" = Şu an, şu sıralar. "I\'m busy at the moment."', d: 2 },

  // Yer ve Konum
  { q: '"Nearby" kelimesinin T�rk�e anlamı nedir?', a: ['Uzakta','Yakınlarda','Ortada','Aşağıda'], c: 1, e: 'Nearby = Yakınlarda. "Is there a pharmacy nearby?" = "Yakınlarda eczane var mı?"', d: 2 },
  { q: '"Opposite" kelimesinin T�rk�e anlamı nedir?', a: ['Yanında','Arkasında','Karşısında','�st�nde'], c: 2, e: 'Opposite = Karşısında, zıt. "Opposite the school" = "Okulun karşısında."', d: 2 },
  { q: '"Between" kelimesinin T�rk�e anlamı nedir?', a: ['�st�nde','Altında','Arasında (iki şey)','Yanında'], c: 2, e: 'Between = Arasında (iki şey i�in). "Between the trees" = "Ağa�ların arasında."', d: 2 },
  { q: '"Among" kelimesinin T�rk�e anlamı nedir?', a: ['�st�nde','Arasında (�ok şey)','Altında','Dışında'], c: 1, e: 'Among = Arasında (��ten fazla i�in). "Among friends" = "Arkadaşlar arasında."', d: 3 },

  // Faydalı Kelimeler
  { q: '"Emergency" kelimesinin T�rk�e anlamı nedir?', a: ['Acil durum','Rutin','Plan','G�rev'], c: 0, e: 'Emergency = Acil durum. "Emergency exit" = "Acil �ıkış."', d: 2 },
  { q: '"Careful" kelimesinin T�rk�e anlamı nedir?', a: ['Dikkatsiz','Dikkatli','Hızlı','Rahat'], c: 1, e: 'Careful = Dikkatli. "Be careful!" = "Dikkatli ol!"', d: 1 },
  { q: '"Enough" kelimesinin T�rk�e anlamı nedir?', a: ['Fazla','Yeterli','Az','Hi�'], c: 1, e: 'Enough = Yeterli. "That\'s enough!" = "Bu yeter!"', d: 1 },
  { q: '"Both" kelimesinin T�rk�e anlamı nedir?', a: ['Hi�biri','Biri','Her ikisi de','Diğeri'], c: 2, e: 'Both = Her ikisi de. "Both of them" = "Her ikisi de."', d: 2 },
  { q: '"Neither" kelimesinin T�rk�e anlamı nedir?', a: ['Her ikisi de','Biri','Ne biri ne diğeri','İkisi de değil'], c: 2, e: 'Neither = Ne biri ne de diğeri. "Neither of them came." = "İkisi de gelmedi."', d: 3 },
  { q: '"Whether" kelimesinin T�rk�e anlamı nedir?', a: ['Hava durumu','Eğer/Olup olmadığı','Ne zaman','Neden'], c: 1, e: 'Whether = Olup olmadığı. "I don\'t know whether he\'ll come."', d: 3 },
  { q: '"Throughout" kelimesinin T�rk�e anlamı nedir?', a: ['Başlangı�ta','Boyunca/S�resince','Sonunda','Bazen'], c: 1, e: 'Throughout = Boyunca. "Throughout the year" = "Yıl boyunca."', d: 3 },
  { q: '"Meanwhile" kelimesinin T�rk�e anlamı nedir?', a: ['Sonradan','Bu arada/Bu s�re�te','�nce','Sırasıyla'], c: 1, e: 'Meanwhile = Bu arada, bu sırada. "Meanwhile, the others waited."', d: 3 },
  { q: '"Eventually" kelimesinin T�rk�e anlamı nedir?', a: ['Hemen','Nadiren','Sonunda/Eninde sonunda','Bazen'], c: 2, e: 'Eventually = Sonunda, eninde sonunda. "Eventually he agreed."', d: 3 },
  { q: '"Furthermore" kelimesinin T�rk�e anlamı nedir?', a: ['Aksine','Ayrıca/Dahası','Sonu� olarak','Bu y�zden'], c: 1, e: 'Furthermore = Ayrıca, dahası, �stelik. Bir fikre ek bilgi eklemek i�in.', d: 3 },

  // Modal Fiiller
  { q: '"Must" ne anlama gelir?', a: ['Yapabilmek','Yapmak zorunda olmak','Yapabilirsin','Yapmalısın (tavsiye)'], c: 1, e: 'Must = Zorunluluk. "You must wear a seatbelt." = "Emniyet kemeri takmalısın."', d: 2 },
  { q: '"Should" ne anlama gelir?', a: ['Zorunlu','Yapmalısın (tavsiye)','Yapabilirsin','Yapacaksın'], c: 1, e: 'Should = Tavsiye. "You should sleep early." = "Erken uyumalısın."', d: 2 },
  { q: '"Could" ne anlama gelir?', a: ['Yapacak','Yapabilirdi/Yapabilir miydi','Yapmalı','Yapıyor'], c: 1, e: 'Could = Can\'ın ge�miş hali veya kibarca ricada kullanılır. "Could you help me?"', d: 3 },
  { q: '"Would" hangi ama�la kullanılır?', a: ['Zorunluluk','Rica/Koşullu anlam','Yetenek','Gereklilik'], c: 1, e: '"Would" = Rica ve koşul c�mlelerinde. "Would you like coffee?" = "Kahve ister misiniz?"', d: 3 },
  { q: '"Might" ne anlama gelir?', a: ['Kesinlikle','Olabilir/Belki','Zorunlu','Yapamaz'], c: 1, e: 'Might = Belki, olabilir (d�ş�k ihtimal). "It might rain." = "Yağmur yağabilir."', d: 3 },

  // Fiil Zamanları
  { q: '"I have eaten." c�mlesi hangi zamanı ifade eder?', a: ['Ge�miş basit','Şimdiki zaman','Present perfect','Gelecek zaman'], c: 2, e: '"Have/Has + V3" = Present Perfect (ge�mişte yapılmış, şu anla bağlantılı eylem).', d: 3 },
  { q: '"She was sleeping." c�mlesi hangi zamanı ifade eder?', a: ['Ge�miş basit','Ge�miş s�regelen','Present perfect','Gelecek'], c: 1, e: '"Was/Were + Ving" = Past Continuous (ge�mişte s�regelen eylem).', d: 3 },
  { q: '"I will call you." c�mlesinde hangi zaman kullanılmıştır?', a: ['Ge�miş zaman','Şimdiki zaman','Gelecek zaman','Present perfect'], c: 2, e: '"Will + fiil" = Gelecek zaman (Simple Future). "I will call." = "Arayacağım."', d: 2 },

  // Sık Hata Yapılan Kelimeler
  { q: '"Borrow" ile "Lend" arasındaki fark nedir?', a: ['İkisi aynı anlama gelir','Borrow = almak, Lend = vermek','Borrow = vermek, Lend = almak','İkisi de "satmak" demek'], c: 1, e: 'Borrow = �d�n� almak (sen alırsın). Lend = �d�n� vermek (sen verirsin).', d: 3 },
  { q: '"Say" ile "Tell" arasındaki fark nedir?', a: ['Aynı anlama gelir','Say direkt konuşur, Tell birine s�yler','Tell daha resmidir','Say daha uzundur'], c: 1, e: '"Say something" (bir şey s�yle) vs "Tell someone" (birine s�yle). "Tell me!" = "S�yle bana!"', d: 3 },
  { q: '"Look", "See" ve "Watch" arasındaki temel fark nedir?', a: ['Hepsi aynı','Look=kasıtlı bakmak, See=g�rmek, Watch=izlemek','Look=g�rmek, See=bakmak','Watch sadece TV i�in'], c: 1, e: 'Look = Kasıtlı bakmak. See = G�rmek (otomatik). Watch = Hareketli şeyleri izlemek.', d: 3 },
  { q: '"Make" ve "Do" arasındaki fark nedir?', a: ['İkisi aynı','Make = �retmek/yaratmak, Do = yapmak (genel)','Do = �retmek','Make daha formeldir'], c: 1, e: 'Make = bir şey �retmek (make coffee, make a mistake). Do = genel eylem (do homework, do sport).', d: 3 },

  // Akademik Kelimeler
  { q: '"Analysis" kelimesinin T�rk�e anlamı nedir?', a: ['Sonu�','Analiz/İnceleme','Teori','Uygulama'], c: 1, e: 'Analysis = Analiz, inceleme. "Data analysis" = "Veri analizi."', d: 3 },
  { q: '"Evidence" kelimesinin T�rk�e anlamı nedir?', a: ['Teori','Soru','Kanıt/Delil','Yargı'], c: 2, e: 'Evidence = Kanıt, delil. "Show evidence." = "Kanıt g�ster."', d: 3 },
  { q: '"Emphasize" kelimesinin T�rk�e anlamı nedir?', a: ['K���msemek','Vurgulamak','Azaltmak','G�rmezden gelmek'], c: 1, e: 'Emphasize = Vurgulamak. "I want to emphasize this point." = "Bu noktayı vurgulamak istiyorum."', d: 3 },
  { q: '"Assumption" kelimesinin T�rk�e anlamı nedir?', a: ['Kanıt','Varsayım/Faraziye','Sonu�','Ger�ek'], c: 1, e: 'Assumption = Varsayım. "Don\'t make assumptions." = "Varsayımda bulunma."', d: 3 },

  // Duygusal Zeka
  { q: '"Empathy" kelimesinin T�rk�e anlamı nedir?', a: ['Sempatik olmak','Empati/Duygu paylaşımı','Acıma','Yargılama'], c: 1, e: 'Empathy = Empati, karşıdakinin duygularını anlama yetisi.', d: 3 },
  { q: '"Confidence" kelimesinin T�rk�e anlamı nedir?', a: ['Korku','�zg�ven/G�ven','Endişe','Ş�phe'], c: 1, e: 'Confidence = �zg�ven. "Self-confidence" = "�zg�ven."', d: 2 },
  { q: '"Grateful" kelimesinin T�rk�e anlamı nedir?', a: ['Şikayet eden','Minnettar','Kayıtsız','Mutsuz'], c: 1, e: 'Grateful = Minnettar. "I\'m grateful for your help." = "Yardımın i�in minnettarım."', d: 2 },
  { q: '"Forgive" kelimesinin T�rk�e anlamı nedir?', a: ['Cezalandırmak','Su�lamak','Affetmek','Unutmak'], c: 2, e: 'Forgive = Affetmek. "Can you forgive me?" = "Beni affedebilir misin?"', d: 2 },

  // Teknoloji ve Bilim
  { q: '"Artificial" kelimesinin T�rk�e anlamı nedir?', a: ['Doğal','Yapay','Ger�ek','Organik'], c: 1, e: 'Artificial = Yapay. "Artificial intelligence" = "Yapay zeka" (AI).', d: 2 },
  { q: '"Data" kelimesinin T�rk�e anlamı nedir?', a: ['Bilgi (genel)','Program','Veri','Sistem'], c: 2, e: 'Data = Veri. "Big data" = "B�y�k veri."', d: 2 },
  { q: '"Software" kelimesinin T�rk�e anlamı nedir?', a: ['Donanım','Yazılım','Ağ','Sunucu'], c: 1, e: 'Software = Yazılım. Hardware = Donanım (zıt anlamlısı).', d: 2 },
  { q: '"Network" kelimesinin T�rk�e anlamı nedir?', a: ['Sunucu','Ağ/Şebeke','Program','Veritabanı'], c: 1, e: 'Network = Ağ. "Social network" = "Sosyal ağ."', d: 2 },
  { q: '"Search" kelimesinin T�rk�e anlamı nedir?', a: ['Bulmak','Aramak','Taramak','Y�klemek'], c: 1, e: 'Search = Aramak. "Search the web." = "İnternette ara."', d: 1 },

  // �evre ve S�rd�r�lebilirlik
  { q: '"Environment" kelimesinin T�rk�e anlamı nedir?', a: ['Hava','�evre/Doğa','İklim','Toprak'], c: 1, e: 'Environment = �evre. "Protect the environment." = "�evreyi koru."', d: 2 },
  { q: '"Recycle" kelimesinin T�rk�e anlamı nedir?', a: ['Yakmak','G�mmek','Geri d�n�şt�rmek','Atmak'], c: 2, e: 'Recycle = Geri d�n�şt�rmek. "Recycle paper." = "Kağıdı geri d�n�şt�r."', d: 2 },
  { q: '"Pollution" kelimesinin T�rk�e anlamı nedir?', a: ['Temizlik','Kirlilik','Doğallık','S�rd�r�lebilirlik'], c: 1, e: 'Pollution = Kirlilik. "Air pollution" = "Hava kirliliği."', d: 2 },
  { q: '"Sustainable" kelimesinin T�rk�e anlamı nedir?', a: ['Zararlı','Ge�ici','S�rd�r�lebilir','Pahalı'], c: 2, e: 'Sustainable = S�rd�r�lebilir. "Sustainable energy" = "S�rd�r�lebilir enerji."', d: 3 },

  // Son Kelimeler
  { q: '"Absolutely" kelimesinin T�rk�e anlamı nedir?', a: ['Belki','Kesinlikle/Tabii ki','Neredeyse','Hi�'], c: 1, e: 'Absolutely = Kesinlikle, tabii ki. "Absolutely!" = "Kesinlikle!"', d: 2 },
  { q: '"Actually" kelimesinin T�rk�e anlamı nedir?', a: ['Normalde','Aslında/Ger�ekte','Genellikle','Bazen'], c: 1, e: 'Actually = Aslında. "Actually, I changed my mind." = "Aslında fikrimi değiştirdim."', d: 2 },
  { q: '"Basically" kelimesinin T�rk�e anlamı nedir?', a: ['Karmaşık şekilde','Temel olarak/Kısacası','Ayrıntılı olarak','Resmi olarak'], c: 1, e: 'Basically = Temel olarak, kısacası. "Basically, it\'s simple." = "Kısacası, bu basit."', d: 2 },
  { q: '"Literally" kelimesinin T�rk�e anlamı nedir?', a: ['Mecazi olarak','Tam anlamıyla/Ger�ekten','Neredeyse','Yaklaşık'], c: 1, e: 'Literally = Tam anlamıyla. "I\'m literally dying of laughter." = "Ger�ekten g�lmekten �l�yorum."', d: 3 },
  { q: '"Definitely" kelimesinin T�rk�e anlamı nedir?', a: ['Belki','Muhtemelen','Kesinlikle','Nadiren'], c: 2, e: 'Definitely = Kesinlikle. "Definitely yes!" = "Kesinlikle evet!"', d: 2 },
  { q: '"Exactly" kelimesinin T�rk�e anlamı nedir?', a: ['Yaklaşık','Neredeyse','Tam olarak','Hemen hemen'], c: 2, e: 'Exactly = Tam olarak. "Exactly right!" = "Tam olarak doğru!"', d: 1 },
  { q: '"Mistake" kelimesinin T�rk�e anlamı nedir?', a: ['Başarı','Hata','Karar','Sonu�'], c: 1, e: 'Mistake = Hata. "Make a mistake." = "Hata yapmak."', d: 1 },
  { q: '"Advice" kelimesinin T�rk�e anlamı nedir?', a: ['Emir','Tavsiye/�neri','Eleştiri','Şikayet'], c: 1, e: 'Advice = Tavsiye. "Give me your advice." = "Bana tavsiyeni ver."', d: 2 },
  { q: '"Purpose" kelimesinin T�rk�e anlamı nedir?', a: ['Sonu�','Kaza','Ama�/Gaye','Plan'], c: 2, e: 'Purpose = Ama�. "What\'s your purpose?" = "Amacın ne?"', d: 2 },
  { q: '"Habit" kelimesinin T�rk�e anlamı nedir?', a: ['Kural','Alışkanlık','G�rev','Zorunluluk'], c: 1, e: 'Habit = Alışkanlık. "Good habit" = "İyi alışkanlık."', d: 2 },
  { q: '"Imagine" kelimesinin T�rk�e anlamı nedir?', a: ['Hatırlamak','G�rmek','Hayal etmek','D�ş�nmek'], c: 2, e: 'Imagine = Hayal etmek. "Imagine a better world." = "Daha iyi bir d�nya hayal et."', d: 2 },
  { q: '"Respect" kelimesinin T�rk�e anlamı nedir?', a: ['Aşağılamak','Saygı/Saygı g�stermek','Sevmek','Korkmak'], c: 1, e: 'Respect = Saygı. "Respect each other." = "Birbirinize saygı g�sterin."', d: 2 },
  { q: '"Accept" kelimesinin T�rk�e anlamı nedir?', a: ['Reddetmek','Kabul etmek','Teklif etmek','İtiraz etmek'], c: 1, e: 'Accept = Kabul etmek. Refuse/Reject = Reddetmek (zıt anlamlısı).', d: 2 },
  { q: '"Protect" kelimesinin T�rk�e anlamı nedir?', a: ['Tehdit etmek','Korumak','Zarar vermek','Terketmek'], c: 1, e: 'Protect = Korumak. "Protect the environment." = "�evreyi koru."', d: 2 },
  { q: '"Celebrate" kelimesinin T�rk�e anlamı nedir?', a: ['Yas tutmak','Kutlamak','Hatırlamak','Planlamak'], c: 1, e: 'Celebrate = Kutlamak. "Celebrate a birthday." = "Doğum g�n� kutlamak."', d: 2 },
  { q: '"Achieve" ile "Succeed" arasındaki fark nedir?', a: ['İkisi aynı anlama gelir','Achieve = belirli bir hedef, Succeed = genel başarı','Succeed daha resmidir','Achieve sadece işte kullanılır'], c: 1, e: 'Achieve = belirli bir hedefe ulaşmak. Succeed = genel olarak başarılı olmak.', d: 3 },

  // Eğlence ve Medya
  { q: '"Movie" kelimesinin T�rk�e anlamı nedir?', a: ['M�zik','Film','Dizi','Belgesel'], c: 1, e: 'Movie = Film. "Watch a movie." = "Film izle."', d: 1 },
  { q: '"Song" kelimesinin T�rk�e anlamı nedir?', a: ['Alb�m','Konser','Şarkı','M�zisyen'], c: 2, e: 'Song = Şarkı. "My favourite song" = "En sevdiğim şarkı."', d: 1 },
  { q: '"Concert" kelimesinin T�rk�e anlamı nedir?', a: ['Film','Tiyatro','Konser','Festival'], c: 2, e: 'Concert = Konser. "Go to a concert." = "Konsere git."', d: 1 },
  { q: '"Stage" kelimesinin T�rk�e anlamı nedir?', a: ['Perde','Sahne','Işık','Dekor'], c: 1, e: 'Stage = Sahne. "On stage" = "Sahnede."', d: 2 },
  { q: '"Award" kelimesinin T�rk�e anlamı nedir?', a: ['Ceza','�d�l','Sertifika','Kupa'], c: 1, e: 'Award = �d�l. "Win an award." = "�d�l kazan."', d: 2 },

  // Boyut ve Miktar
  { q: '"Huge" kelimesinin T�rk�e anlamı nedir?', a: ['K���k','B�y�k','Dev gibi/�ok b�y�k','Orta'], c: 2, e: 'Huge = Dev gibi, �ok b�y�k. Big\'den daha g��l�.', d: 2 },
  { q: '"Tiny" kelimesinin T�rk�e anlamı nedir?', a: ['B�y�k','Orta','�ok k���k','K���k'], c: 2, e: 'Tiny = �ok k���k. Small\'dan daha k���k.', d: 2 },
  { q: '"Several" kelimesinin T�rk�e anlamı nedir?', a: ['Bir','İki','Birka�/�eşitli','�ok fazla'], c: 2, e: 'Several = Birka�. "Several times" = "Birka� kez."', d: 2 },
  { q: '"Plenty" kelimesinin T�rk�e anlamı nedir?', a: ['Az','Yetersiz','Bol miktarda','Biraz'], c: 2, e: 'Plenty = Bol miktarda. "Plenty of time" = "Bol zaman."', d: 2 },


  // ── Vay Be! Soruları ──
  { q: 'İngilizcenin en sık kullanılan harfi hangisidir?', a: ['A', 'T', 'E', 'S'], c: 2, d: 1, vb: true, e: '"E" harfi İngilizce metinlerin yaklaşık %13\'�nde en sık g�r�len harftir. Bu y�zden "lipogram" adlı edebi t�rde "E" harfi olmadan kitap yazmak �ok zor bir sanatsal meydan okuma sayılır.' },
  { q: 'Shakespeare İngilizceye ka� yeni kelime kattı?', a: ['100', '500', '1.700+', '10.000'], c: 2, d: 2, vb: true, e: 'Shakespeare yaklaşık 1.700 kelime icat etmiş ya da ilk kez yazıya d�km�şt�r: bedroom, lonely, generous, laughable, rant, swagger bunların bir kısmıdır. Bug�n sıradan İngilizce c�mlelerde bu kelimeler fark edilmeden kullanılır.' },
  { q: '"Set" kelimesinin İngilizce s�zl�kteki anlam sayısı nedir?', a: ['10', '50', '100', '430+'], c: 3, d: 3, vb: true, e: '"Set" İngilizce\'nin en fazla anlama sahip kelimesidir: Oxford s�zl�ğ� 430\'dan fazla farklı anlamını listeler. Fiil, isim, sıfat olarak kullanılır; set � kurulmak, set � g�neşin batması, set � tenis seti gibi.' },
  { q: 'İngilizce tahminen ka� kelime i�erir?', a: ['10.000', '50.000', '170.000+', '1 milyon+'], c: 2, d: 2, vb: true, e: 'Oxford İngilizce S�zl�ğ� 170.000\'den fazla mevcut kelime listeler. Ancak argolar, teknik terimler ve eski kelimeler eklendiğinde bazı tahminler 1 milyona ulaşır. Bu İngilizce\'yi bilinen en zengin kelime hazinesine sahip dil yapar.' },
  { q: '"Alphabet" kelimesi nereden geliyor?', a: ['Latince "alfa"dan', 'Yunan harfleri Alpha + Beta\'dan', 'İngilizce invented', 'Arap�adan'], c: 1, d: 2, vb: true, e: '"Alphabet" Yunanca\'nın ilk iki harfi Alpha (Α) ve Beta (Β)\'dan t�retilmiştir. Bu Yunan harfleri de Fenike alfabesinden adapte edilmiştir; yani modern alfabe sistemi 3.000 yıl �nceki Fenike t�ccarlarına dayanır.' },
  { q: 'İngilizcede hangi kelime hem soru hem cevap olarak kullanılabilir?', a: ['Yes', 'No', 'OK', '"I am" � en kısa tam İngilizce c�mle de sayılır'], c: 3, d: 2, vb: true, e: '"I am" İngilizce\'nin en kısa tam c�mlesidir (�zne + y�klem). �te yandan "OK" d�nya dillerinde en yaygın tanınan İngilizce kelimedir; 1839\'da Amerikan gazetesinde şakadan doğan bu kısaltma k�resel standart haline geldi.' },
];

export default english;
