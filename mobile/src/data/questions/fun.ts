import type { QuizQuestion } from '../../types/quiz';

const fun: QuizQuestion[] = [
  // İlginç Gerçekler
  { q: 'Bir ahtapotun kaç kalbi vardır?', a: ['1','2','3','4'], c: 2, e: 'Ahtapotun 3 kalbi var: 2 solungaç, 1 vücut kalbi.', d: 2 },
  { q: 'Hangi hayvanın parmak izi insanınkiyle neredeyse aynıdır?', a: ['Şempanze','Goril','Koala','Orangutan'], c: 2, e: 'Koalaların parmak izi insan parmak iziyle neredeyse ayırt edilemez!', d: 2 },
  { q: 'Bir insanın kaç kemiği vardır (yetişkin)?', a: ['180','206','250','300'], c: 1, e: 'Yetişkin insan iskeletinde 206 kemik bulunur.', d: 1 },
  { q: 'Hangi meyve botanik olarak "çilek" sayılır?', a: ['Çilek','Muz','Elma','Kiraz'], c: 1, e: 'Botanik açıdan muz bir çilektir! Gerçek çilek ise meyvedir.', d: 3 },
  { q: 'Bir bulutun ağırlığı ortalama kaçtır?', a: ['1 ton','500 ton','500.000 ton','10 milyon ton'], c: 2, e: 'Ortalama bir bulut yaklaşık 500.000 ton ağırlığındadır!', d: 2 },
  { q: 'Hangi renk arıları daha sakin yapar?', a: ['Kırmızı','Sarı','Beyaz','Siyah'], c: 2, e: 'Beyaz renk arıları sakinleştirir — arıcılar bu yüzden beyaz giyinir.', d: 2 },
  { q: 'İnsan gözü kaç rengi ayırt edebilir?', a: ['100.000','1.000.000','10.000.000','100.000.000'], c: 2, e: 'İnsan gözü yaklaşık 10 milyon farklı rengi ayırt edebilir.', d: 2 },
  { q: 'Hangi ülkede "Evet" anlamında baş sallamak aslında "Hayır" demektir?', a: ['Japonya','Hindistan','Bulgaristan','Yunanistan'], c: 2, e: 'Bulgaristan\'da baş aşağı-yukarı sallamak HAYIR, sağa-sola EVET anlamındadır!', d: 2 },
  { q: 'Bir insan ömrü boyunca ortalama kaç km yürür?', a: ['10.000 km','50.000 km','100.000 km','500.000 km'], c: 2, e: 'Ortalama bir insan hayatı boyunca ~100.000 km yürür — Dünya\'yı 2,5 kez dolaşır!', d: 2 },
  { q: 'Hangi hayvan hiç su içmez?', a: ['Deve','Kanguru sıçanı','Koala','Kertenkele'], c: 1, e: 'Kanguru sıçanı yediği tohumlardan gerekli suyu üretir, asla su içmez!', d: 2 },
  { q: 'Deniz atlarında yavrularla kim ilgilenir?', a: ['Dişi','Erkek','İkisi birlikte','Hiçbiri'], c: 1, e: 'Deniz atlarında erkek hamile kalır ve yavrular doğurur — benzersiz!', d: 2 },
  { q: 'Bir zürafanın dili hangi renktedir?', a: ['Pembe','Kırmızı','Siyah-mor','Mavi'], c: 2, e: 'Zürafanın dili koyu mavi-mor renktedir, güneşten korunmak için.', d: 2 },
  { q: 'Elmas hangi elementten oluşur?', a: ['Silikon','Karbon','Azot','Oksijen'], c: 1, e: 'Elmas saf karbondan oluşur — grafit de karbon! Fark sadece atom düzenidir.', d: 2 },
  { q: 'Bal ne kadar süre bozulmadan kalır?', a: ['5 yıl','50 yıl','100 yıl','Sonsuza kadar'], c: 3, e: 'Mısır piramitlerinde 3000 yıllık bal bulundu ve hala yenilebilir durumdaydı!', d: 1 },
  { q: 'Dünya\'nın en büyük çölü hangisidir?', a: ['Sahara','Gobi','Arabistan','Antarktika'], c: 3, e: 'Antarktika 14,2 milyon km² ile soğuk çöldür — Sahara\'dan büyük!', d: 2 },

  // Pop Kültür
  { q: '"Squid Game"de toplam katılımcı sayısı kaçtır?', a: ['100','365','456','999'], c: 2, e: 'Squid Game\'de 456 katılımcı var. Dizi 2021\'de dünya rekoru kırdı.', d: 1 },
  { q: 'Instagram\'ın kurucu ortakları kimlerdir?', a: ['Zuckerberg ve Dorsey','Kevin Systrom ve Mike Krieger','Gates ve Jobs','Musk ve Bezos'], c: 1, e: 'Kevin Systrom ve Mike Krieger Instagram\'ı Ekim 2010\'da kurdu.', d: 2 },
  { q: 'TikTok hangi ülkeden çıktı?', a: ['Japonya','Güney Kore','Çin','Singapur'], c: 2, e: 'TikTok (Douyin) 2016\'da Çin\'li ByteDance tarafından kuruldu.', d: 1 },
  { q: 'YouTube\'u Google kaç milyar dolara satın aldı?', a: ['0,5 milyar','1,65 milyar','5 milyar','10 milyar'], c: 1, e: 'Google YouTube\'u Ekim 2006\'da 1,65 milyar dolara satın aldı.', d: 2 },
  { q: 'Dünyanın en çok izlenen YouTube videosu hangisidir?', a: ['Gangnam Style','Despacito','Baby Shark','Shape of You'], c: 2, e: 'Baby Shark 13 milyar+ izlemeyle en çok izlenen video.', d: 1 },
  { q: '"Emoji" kelimesi hangi dildene gelir?', a: ['Çince','Japonca','Korece','İngilizce'], c: 1, e: 'Emoji Japoncada "resim" (e) + "karakter" (moji) kelimelerinden oluşur.', d: 2 },
  { q: 'Dünyanın en çok kullanılan şifre hangisidir?', a: ['123456','password','qwerty','abc123'], c: 0, e: '"123456" her yıl dünyanın en yaygın ve en kötü şifresi seçiliyor.', d: 1 },
  { q: 'Wi-Fi kelimesi neyin kısaltmasıdır?', a: ['Wireless Fidelity','Wide Field Internet','Wireless First','Hiçbirinin kısaltması değil'], c: 3, e: 'Wi-Fi hiçbir şeyin kısaltması değil — tamamen pazarlama amaçlı uydurulmuş!', d: 3 },
  { q: 'Google\'ın ilk adı neydi?', a: ['SearchNow','BackRub','WebSearch','PageRank'], c: 1, e: 'Larry Page ve Sergey Brin projeyi 1996\'da "BackRub" adıyla başlattı.', d: 2 },
  { q: 'Netflix hangi yılda streaming\'e geçti?', a: ['2000','2004','2007','2010'], c: 2, e: 'Netflix 1997\'de DVD kiralama servisi olarak kuruldu, streaming\'e 2007\'de geçti.', d: 2 },
  { q: '"Selfie" kelimesi Oxford sözlüğüne hangi yıl girdi?', a: ['2010','2011','2013','2015'], c: 2, e: '"Selfie" 2013\'te Oxford sözlüğüne "yılın kelimesi" olarak girdi.', d: 2 },

  // Komik & Sürpriz
  { q: 'Coca-Cola\'nın orijinal rengi neydi?', a: ['Kırmızı','Yeşil','Sarı','Siyah'], c: 1, e: 'İlk üretildiğinde Coca-Cola yeşil renkti! Karamel boyası sonradan eklendi.', d: 2 },
  { q: '"Piece of cake" deyimi ne anlama gelir?', a: ['Pasta dilimi','Çok zor','Çok kolay','Yemek zamanı'], c: 2, e: '"Piece of cake" = Çok kolay. "The test was a piece of cake."', d: 2 },
  { q: '"Break a leg" deyimi ne anlama gelir?', a: ['Bacağını kır','İyi şanslar','Acele et','Dikkatli ol'], c: 1, e: '"Break a leg!" = İyi şanslar! Tiyatro jargonundan gelen deyim.', d: 2 },
  { q: '"It\'s raining cats and dogs" ne anlama gelir?', a: ['Hayvanlar yağıyor','Kötü hava var','Bardaktan boşanırcasına yağıyor','Fırtına kopacak'], c: 2, e: 'Bu İngilizce deyim bardaktan boşanırcasına yağmur yağması demektir.', d: 2 },
  { q: 'Bir insan gözü kaç megapiksel gücündedir?', a: ['8 MP','20 MP','100 MP','576 MP'], c: 3, e: 'İnsan gözü ~576 megapiksel çözünürlüğe sahip — en iyi kameraları geride bırakır.', d: 3 },
  { q: 'Kahkaha atmak kaç kası çalıştırır?', a: ['5','15','43','100'], c: 1, e: 'Gülmek yaklaşık 15 farklı kas grubunu çalıştırır.', d: 2 },
  { q: 'Hangi aktivite beyni en fazla çalıştırır?', a: ['Satranç','Koşu','Müzik aleti çalmak','Matematik'], c: 2, e: 'Müzik aleti çalmak beynin en fazla bölgesini aynı anda aktif eden faaliyettir.', d: 2 },
  { q: 'İnsan beyni uyku sırasında ne yapar?', a: ['Dinlenir','Durur','Gündüz deneyimleri işler','Yavaşlar'], c: 2, e: 'Beyin uyku sırasında gün içindeki deneyimleri işler — en yoğun aktivite uykuda!', d: 2 },
  { q: '"Nomophobia" nedir?', a: ['Yükseklik korkusu','Telefonsuz kalma korkusu','Kapalı alan korkusu','Sosyal fobi'], c: 1, e: '"Nomophobia" = No Mobile Phobia. Telefonsuz kalma korkusu.', d: 2 },

  // Hayvan Dünyası
  { q: 'Ahtapot sıkışınca ne yapar?', a: ['Saklanır','Kolunu koparır','Renk değiştirir','Mürekkep sıkar'], c: 1, e: 'Ahtapot kolunu düşmanın ağzında bırakıp kaçar — kol yeniden çıkar!', d: 2 },
  { q: 'Hangi kuş geriye doğru uçabilir?', a: ['Guguk','Sinek kuşu','Kartal','Papağan'], c: 1, e: 'Sinek kuşu geriye, yana ve hatta baş aşağı uçabilir.', d: 2 },
  { q: 'Hangi hayvanın en uzun hafızası vardır?', a: ['Yunus','Fil','Karga','Orangutan'], c: 1, e: 'Filler onlarca yıl sonra bile tanıdıkları insanları veya hayvanları tanıyabilir.', d: 2 },
  { q: 'Hangi böcek ışık yayar?', a: ['Arı','Kelebek','Ateşböceği','Çekirge'], c: 2, e: 'Ateşböceği biyoluminesans ile ışık üretir — eş bulmak için.', d: 1 },
  { q: 'Kaç tane böcek türü keşfedilmiştir?', a: ['100.000','500.000','1 milyon+','5 milyon+'], c: 2, e: '1 milyonun üzerinde böcek türü kayıt altına alınmış, gerçek sayı çok daha fazla.', d: 2 },
  { q: 'Hangi hayvan dünyada en hızlı kara hayvanıdır?', a: ['Aslan','Pars','Çita','At'], c: 2, e: 'Çita saatte 110-120 km hızla dünyanın en hızlı kara hayvanıdır.', d: 1 },

  // Yiyecek & İçecek
  { q: 'Dünya\'nın en pahalı baharatı hangisidir?', a: ['Vanilya','Safran','Karabiber','Tarçın'], c: 1, e: 'Safran 1 kg\'ı 10.000$\'a kadar çıkabilen en pahalı baharattır.', d: 2 },
  { q: 'Çikolata ilk olarak nasıl tüketildi?', a: ['Katı tablet','Acı sıcak içecek','Dondurma','Kek'], c: 1, e: 'Aztekler çikolatayı "xocoatl" adıyla acı, baharatlı sıcak içecek olarak içerdi.', d: 2 },
  { q: '"Umami" hangi ülkenin bulduğu tat kavramıdır?', a: ['Çin','Güney Kore','Japonya','Vietnam'], c: 2, e: '"Umami" (lezzetli tat) 1908\'de Japonya\'da Ikeda Kikunae tarafından tanımlandı.', d: 2 },
  { q: 'Hangi meyvenin içinde en fazla C vitamini vardır?', a: ['Limon','Portakal','Kivi','Çilek'], c: 2, e: 'Kivi, portakaldan 2 kat fazla C vitamini içerir!', d: 2 },
  { q: 'Türkiye\'de günde kaç döner tüketilir?', a: ['100.000','500.000','1 milyon','3 milyon+'], c: 3, e: 'Türkiye\'de günde 3 milyon\'dan fazla döner tüketildiği tahmin edilmektedir.', d: 2 },

  // Teknoloji
  { q: 'İlk gönderilen e-posta ne zaman gönderildi?', a: ['1965','1971','1975','1980'], c: 1, e: 'İlk e-posta 1971\'de Ray Tomlinson tarafından kendisine gönderildi.', d: 2 },
  { q: 'iPhone\'u halka ilk kez tanıtan tarih nedir?', a: ['Ocak 2005','Ocak 2006','Ocak 2007','Ocak 2008'], c: 2, e: 'Steve Jobs ilk iPhone\'u 9 Ocak 2007\'de Macworld\'de sahneye çıkardı.', d: 2 },
  { q: 'Twitter\'ın eski karakter sınırı kaçtı?', a: ['100','120','140','160'], c: 2, e: 'Twitter 2017\'ye kadar 140 karakter sınırı uyguladı, sonra 280\'e çıkardı.', d: 2 },
  { q: 'Dünyanın ilk web sitesi hâlâ erişilebilir mi?', a: ['Evet','Hayır','Arşivde var','Bilinmiyor'], c: 0, e: 'Evet! info.cern.ch hâlâ erişilebilir. Tim Berners-Lee 1991\'de yayınladı.', d: 2 },

  // Dünya Rekorları
  { q: 'Dünyanın en küçük ülkesi hangisidir?', a: ['Monako','San Marino','Vatikan','Liechtenstein'], c: 2, e: 'Vatikan 0,44 km² ile dünyanın en küçük ülkesidir.', d: 1 },
  { q: 'Dünyanın en çok dil konuşan ülkesi hangisidir?', a: ['Hindistan','Çin','Nijerya','Papua Yeni Gine'], c: 3, e: 'Papua Yeni Gine\'de 800\'den fazla farklı dil konuşulmaktadır.', d: 2 },
  { q: 'Tokyo\'nun nüfusu kaçtır? (yaklaşık)', a: ['10 milyon','20 milyon','38 milyon','55 milyon'], c: 2, e: 'Tokyo büyük şehir alanıyla 38 milyon+ nüfusuyla dünya birincisi.', d: 2 },
  { q: 'Dünyanın en pahalı sporu hangisidir?', a: ['Formula 1','Golf','Polo','America\'s Cup yelken'], c: 3, e: 'America\'s Cup yelken yarışı, Formula 1\'i bile maliyet açısından geride bırakıyor.', d: 3 },
  { q: 'Dünya\'nın en çok satılan roman serisi hangisidir?', a: ['Harry Potter','James Bond','Lord of the Rings','Agatha Christie'], c: 0, e: 'Harry Potter serisi 500 milyon+ satışla en çok satan roman serisidir.', d: 1 },

  // Türkiye Eğlence
  { q: 'Türk Hava Yolları kaç ülkeye uçuş yapar? (yaklaşık)', a: ['50','80','100','130+'], c: 3, e: 'THY 130+ ülkeye direkt uçuşla en fazla ülkeye uçan havayolu.', d: 1 },
  { q: '"Mavi boncuk" Türkiye\'de ne için kullanılır?', a: ['Süs','Nazardan korunma','Şans getirme','Hepsi'], c: 3, e: 'Nazar boncuğu hem nazardan korunmak hem süs hem şans için kullanılır.', d: 1 },
  { q: 'Türk kahvesi UNESCO listesine hangi yılda girdi?', a: ['2010','2013','2015','2018'], c: 1, e: 'Türk kahvesi kültürü 2013\'te UNESCO somut olmayan kültürel miras listesine alındı.', d: 1 },
  { q: 'Türkiye kişi başına çay tüketiminde dünyada kaçıncı?', a: ['1.','3.','5.','10.'], c: 0, e: 'Türkiye kişi başına çay tüketiminde dünya birincisidir.', d: 1 },
  { q: 'Diriliş Ertuğrul kaç ülkede izlendi?', a: ['50','100','150+','200+'], c: 2, e: '"Diriliş Ertuğrul" 150+ ülkede izlenerek Türk dizilerinin rekorunu kırdı.', d: 1 },

  // Spor Eğlence
  { q: 'Maraton neden tam 42,195 km\'dir?', a: ['Antik Yunan geleneği','İngiliz kraliyet ailesi için ayarlandı','Rastgele','Olimpiyat kuralı'], c: 1, e: '1908 Londra Olimpiyatları\'nda güzergah kraliyet ailesi penceresinden bitecek şekilde ayarlandı.', d: 2 },
  { q: 'Futbol topunun siyah-beyaz deseni neden var?', a: ['Moda','TV\'de görünürlük için','Gelenek','Kural'], c: 1, e: 'Siyah-beyaz desen siyah-beyaz TV yayınında topun daha iyi görünmesi için tasarlandı.', d: 2 },
  { q: 'Golf topundaki çukurcuklar ne işe yarar?', a: ['Görünüş için','Az sürtünme','Daha uzak gitmek için','Tutunma için'], c: 2, e: 'Çukurcuklar aerodinamiği artırarak topun %40 daha uzağa gitmesini sağlar.', d: 2 },
  { q: 'Hangi ülke en fazla olimpiyat madalyası kazandı (tarihsel)?', a: ['Rusya','Çin','Almanya','ABD'], c: 3, e: 'ABD 1.000+ olimpiyat madalyasıyla tarihsel sıralamada açık ara birinci.', d: 2 },
];

export default fun;
