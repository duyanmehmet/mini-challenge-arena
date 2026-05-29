import type { QuizQuestion } from '../../types/quiz';

const fun: QuizQuestion[] = [
  // İlgin� Ger�ekler
  { q: 'Bir ahtapotun ka� kalbi vardır?', a: ['1','2','3','4'], c: 2, e: 'Ahtapotun 3 kalbi var: 2 solunga�, 1 v�cut kalbi.', d: 2 },
  { q: 'Hangi hayvanın parmak izi insanınkiyle neredeyse aynıdır?', a: ['Şempanze','Goril','Koala','Orangutan'], c: 2, e: 'Koalaların parmak izi insan parmak iziyle neredeyse ayırt edilemez!', d: 2 },
  { q: 'Bir insanın ka� kemiği vardır (yetişkin)?', a: ['180','206','250','300'], c: 1, e: 'Yetişkin insan iskeletinde 206 kemik bulunur.', d: 1 },
  { q: 'Hangi meyve botanik olarak "�ilek" sayılır?', a: ['�ilek','Muz','Elma','Kiraz'], c: 1, e: 'Botanik a�ıdan muz bir �ilektir! Ger�ek �ilek ise meyvedir.', d: 3 },
  { q: 'Bir bulutun ağırlığı ortalama ka�tır?', a: ['1 ton','500 ton','500.000 ton','10 milyon ton'], c: 2, e: 'Ortalama bir bulut yaklaşık 500.000 ton ağırlığındadır!', d: 2 },
  { q: 'Hangi renk arıları daha sakin yapar?', a: ['Kırmızı','Sarı','Beyaz','Siyah'], c: 2, e: 'Beyaz renk arıları sakinleştirir � arıcılar bu y�zden beyaz giyinir.', d: 2 },
  { q: 'İnsan g�z� ka� rengi ayırt edebilir?', a: ['100.000','1.000.000','10.000.000','100.000.000'], c: 2, e: 'İnsan g�z� yaklaşık 10 milyon farklı rengi ayırt edebilir.', d: 2 },
  { q: 'Hangi �lkede "Evet" anlamında baş sallamak aslında "Hayır" demektir?', a: ['Japonya','Hindistan','Bulgaristan','Yunanistan'], c: 2, e: 'Bulgaristan\'da baş aşağı-yukarı sallamak HAYIR, sağa-sola EVET anlamındadır!', d: 2 },
  { q: 'Bir insan �mr� boyunca ortalama ka� km y�r�r?', a: ['10.000 km','50.000 km','100.000 km','500.000 km'], c: 2, e: 'Ortalama bir insan hayatı boyunca ~100.000 km y�r�r � D�nya\'yı 2,5 kez dolaşır!', d: 2 },
  { q: 'Hangi hayvan hi� su i�mez?', a: ['Deve','Kanguru sı�anı','Koala','Kertenkele'], c: 1, e: 'Kanguru sı�anı yediği tohumlardan gerekli suyu �retir, asla su i�mez!', d: 2 },
  { q: 'Deniz atlarında yavrularla kim ilgilenir?', a: ['Dişi','Erkek','İkisi birlikte','Hi�biri'], c: 1, e: 'Deniz atlarında erkek hamile kalır ve yavrular doğurur � benzersiz!', d: 2 },
  { q: 'Bir z�rafanın dili hangi renktedir?', a: ['Pembe','Kırmızı','Siyah-mor','Mavi'], c: 2, e: 'Z�rafanın dili koyu mavi-mor renktedir, g�neşten korunmak i�in.', d: 2 },
  { q: 'Elmas hangi elementten oluşur?', a: ['Silikon','Karbon','Azot','Oksijen'], c: 1, e: 'Elmas saf karbondan oluşur � grafit de karbon! Fark sadece atom d�zenidir.', d: 2 },
  { q: 'Bal ne kadar s�re bozulmadan kalır?', a: ['5 yıl','50 yıl','100 yıl','Sonsuza kadar'], c: 3, e: 'Mısır piramitlerinde 3000 yıllık bal bulundu ve hala yenilebilir durumdaydı!', d: 1 },
  { q: 'D�nya\'nın en b�y�k ��l� hangisidir?', a: ['Sahara','Gobi','Arabistan','Antarktika'], c: 3, e: 'Antarktika 14,2 milyon km� ile soğuk ��ld�r � Sahara\'dan b�y�k!', d: 2 },

  // Pop K�lt�r
  { q: '"Squid Game"de toplam katılımcı sayısı ka�tır?', a: ['100','365','456','999'], c: 2, e: 'Squid Game\'de 456 katılımcı var. Dizi 2021\'de d�nya rekoru kırdı.', d: 1 },
  { q: 'Instagram\'ın kurucu ortakları kimlerdir?', a: ['Zuckerberg ve Dorsey','Kevin Systrom ve Mike Krieger','Gates ve Jobs','Musk ve Bezos'], c: 1, e: 'Kevin Systrom ve Mike Krieger Instagram\'ı Ekim 2010\'da kurdu.', d: 2 },
  { q: 'TikTok hangi �lkeden �ıktı?', a: ['Japonya','G�ney Kore','�in','Singapur'], c: 2, e: 'TikTok (Douyin) 2016\'da �in\'li ByteDance tarafından kuruldu.', d: 1 },
  { q: 'YouTube\'u Google ka� milyar dolara satın aldı?', a: ['0,5 milyar','1,65 milyar','5 milyar','10 milyar'], c: 1, e: 'Google YouTube\'u Ekim 2006\'da 1,65 milyar dolara satın aldı.', d: 2 },
  { q: 'D�nyanın en �ok izlenen YouTube videosu hangisidir?', a: ['Gangnam Style','Despacito','Baby Shark','Shape of You'], c: 2, e: 'Baby Shark 13 milyar+ izlemeyle en �ok izlenen video.', d: 1 },
  { q: '"Emoji" kelimesi hangi dildene gelir?', a: ['�ince','Japonca','Korece','İngilizce'], c: 1, e: 'Emoji Japoncada "resim" (e) + "karakter" (moji) kelimelerinden oluşur.', d: 2 },
  { q: 'D�nyanın en �ok kullanılan şifre hangisidir?', a: ['123456','password','qwerty','abc123'], c: 0, e: '"123456" her yıl d�nyanın en yaygın ve en k�t� şifresi se�iliyor.', d: 1 },
  { q: 'Wi-Fi kelimesi neyin kısaltmasıdır?', a: ['Wireless Fidelity','Wide Field Internet','Wireless First','Hi�birinin kısaltması değil'], c: 3, e: 'Wi-Fi hi�bir şeyin kısaltması değil � tamamen pazarlama ama�lı uydurulmuş!', d: 3 },
  { q: 'Google\'ın ilk adı neydi?', a: ['SearchNow','BackRub','WebSearch','PageRank'], c: 1, e: 'Larry Page ve Sergey Brin projeyi 1996\'da "BackRub" adıyla başlattı.', d: 2 },
  { q: 'Netflix hangi yılda streaming\'e ge�ti?', a: ['2000','2004','2007','2010'], c: 2, e: 'Netflix 1997\'de DVD kiralama servisi olarak kuruldu, streaming\'e 2007\'de ge�ti.', d: 2 },
  { q: '"Selfie" kelimesi Oxford s�zl�ğ�ne hangi yıl girdi?', a: ['2010','2011','2013','2015'], c: 2, e: '"Selfie" 2013\'te Oxford s�zl�ğ�ne "yılın kelimesi" olarak girdi.', d: 2 },

  // Komik & S�rpriz
  { q: 'Coca-Cola\'nın orijinal rengi neydi?', a: ['Kırmızı','Yeşil','Sarı','Siyah'], c: 1, e: 'İlk �retildiğinde Coca-Cola yeşil renkti! Karamel boyası sonradan eklendi.', d: 2 },
  { q: '"Piece of cake" deyimi ne anlama gelir?', a: ['Pasta dilimi','�ok zor','�ok kolay','Yemek zamanı'], c: 2, e: '"Piece of cake" = �ok kolay. "The test was a piece of cake."', d: 2 },
  { q: '"Break a leg" deyimi ne anlama gelir?', a: ['Bacağını kır','İyi şanslar','Acele et','Dikkatli ol'], c: 1, e: '"Break a leg!" = İyi şanslar! Tiyatro jargonundan gelen deyim.', d: 2 },
  { q: '"It\'s raining cats and dogs" ne anlama gelir?', a: ['Hayvanlar yağıyor','K�t� hava var','Bardaktan boşanırcasına yağıyor','Fırtına kopacak'], c: 2, e: 'Bu İngilizce deyim bardaktan boşanırcasına yağmur yağması demektir.', d: 2 },
  { q: 'Bir insan g�z� ka� megapiksel g�c�ndedir?', a: ['8 MP','20 MP','100 MP','576 MP'], c: 3, e: 'İnsan g�z� ~576 megapiksel ��z�n�rl�ğe sahip � en iyi kameraları geride bırakır.', d: 3 },
  { q: 'Kahkaha atmak ka� kası �alıştırır?', a: ['5','15','43','100'], c: 1, e: 'G�lmek yaklaşık 15 farklı kas grubunu �alıştırır.', d: 2 },
  { q: 'Hangi aktivite beyni en fazla �alıştırır?', a: ['Satran�','Koşu','M�zik aleti �almak','Matematik'], c: 2, e: 'M�zik aleti �almak beynin en fazla b�lgesini aynı anda aktif eden faaliyettir.', d: 2 },
  { q: 'İnsan beyni uyku sırasında ne yapar?', a: ['Dinlenir','Durur','G�nd�z deneyimleri işler','Yavaşlar'], c: 2, e: 'Beyin uyku sırasında g�n i�indeki deneyimleri işler � en yoğun aktivite uykuda!', d: 2 },
  { q: '"Nomophobia" nedir?', a: ['Y�kseklik korkusu','Telefonsuz kalma korkusu','Kapalı alan korkusu','Sosyal fobi'], c: 1, e: '"Nomophobia" = No Mobile Phobia. Telefonsuz kalma korkusu.', d: 2 },

  // Hayvan D�nyası
  { q: 'Ahtapot sıkışınca ne yapar?', a: ['Saklanır','Kolunu koparır','Renk değiştirir','M�rekkep sıkar'], c: 1, e: 'Ahtapot kolunu d�şmanın ağzında bırakıp ka�ar � kol yeniden �ıkar!', d: 2 },
  { q: 'Hangi kuş geriye doğru u�abilir?', a: ['Guguk','Sinek kuşu','Kartal','Papağan'], c: 1, e: 'Sinek kuşu geriye, yana ve hatta baş aşağı u�abilir.', d: 2 },
  { q: 'Hangi hayvanın en uzun hafızası vardır?', a: ['Yunus','Fil','Karga','Orangutan'], c: 1, e: 'Filler onlarca yıl sonra bile tanıdıkları insanları veya hayvanları tanıyabilir.', d: 2 },
  { q: 'Hangi b�cek ışık yayar?', a: ['Arı','Kelebek','Ateşb�ceği','�ekirge'], c: 2, e: 'Ateşb�ceği biyoluminesans ile ışık �retir � eş bulmak i�in.', d: 1 },
  { q: 'Ka� tane b�cek t�r� keşfedilmiştir?', a: ['100.000','500.000','1 milyon+','5 milyon+'], c: 2, e: '1 milyonun �zerinde b�cek t�r� kayıt altına alınmış, ger�ek sayı �ok daha fazla.', d: 2 },
  { q: 'Hangi hayvan d�nyada en hızlı kara hayvanıdır?', a: ['Aslan','Pars','�ita','At'], c: 2, e: '�ita saatte 110-120 km hızla d�nyanın en hızlı kara hayvanıdır.', d: 1 },

  // Yiyecek & İ�ecek
  { q: 'D�nya\'nın en pahalı baharatı hangisidir?', a: ['Vanilya','Safran','Karabiber','Tar�ın'], c: 1, e: 'Safran 1 kg\'ı 10.000$\'a kadar �ıkabilen en pahalı baharattır.', d: 2 },
  { q: '�ikolata ilk olarak nasıl t�ketildi?', a: ['Katı tablet','Acı sıcak i�ecek','Dondurma','Kek'], c: 1, e: 'Aztekler �ikolatayı "xocoatl" adıyla acı, baharatlı sıcak i�ecek olarak i�erdi.', d: 2 },
  { q: '"Umami" hangi �lkenin bulduğu tat kavramıdır?', a: ['�in','G�ney Kore','Japonya','Vietnam'], c: 2, e: '"Umami" (lezzetli tat) 1908\'de Japonya\'da Ikeda Kikunae tarafından tanımlandı.', d: 2 },
  { q: 'Hangi meyvenin i�inde en fazla C vitamini vardır?', a: ['Limon','Portakal','Kivi','�ilek'], c: 2, e: 'Kivi, portakaldan 2 kat fazla C vitamini i�erir!', d: 2 },
  { q: 'T�rkiye\'de g�nde ka� d�ner t�ketilir?', a: ['100.000','500.000','1 milyon','3 milyon+'], c: 3, e: 'T�rkiye\'de g�nde 3 milyon\'dan fazla d�ner t�ketildiği tahmin edilmektedir.', d: 2 },

  // Teknoloji
  { q: 'İlk g�nderilen e-posta ne zaman g�nderildi?', a: ['1965','1971','1975','1980'], c: 1, e: 'İlk e-posta 1971\'de Ray Tomlinson tarafından kendisine g�nderildi.', d: 2 },
  { q: 'iPhone\'u halka ilk kez tanıtan tarih nedir?', a: ['Ocak 2005','Ocak 2006','Ocak 2007','Ocak 2008'], c: 2, e: 'Steve Jobs ilk iPhone\'u 9 Ocak 2007\'de Macworld\'de sahneye �ıkardı.', d: 2 },
  { q: 'Twitter\'ın eski karakter sınırı ka�tı?', a: ['100','120','140','160'], c: 2, e: 'Twitter 2017\'ye kadar 140 karakter sınırı uyguladı, sonra 280\'e �ıkardı.', d: 2 },
  { q: 'D�nyanın ilk web sitesi h�l� erişilebilir mi?', a: ['Evet','Hayır','Arşivde var','Bilinmiyor'], c: 0, e: 'Evet! info.cern.ch h�l� erişilebilir. Tim Berners-Lee 1991\'de yayınladı.', d: 2 },

  // D�nya Rekorları
  { q: 'D�nyanın en k���k �lkesi hangisidir?', a: ['Monako','San Marino','Vatikan','Liechtenstein'], c: 2, e: 'Vatikan 0,44 km� ile d�nyanın en k���k �lkesidir.', d: 1 },
  { q: 'D�nyanın en �ok dil konuşan �lkesi hangisidir?', a: ['Hindistan','�in','Nijerya','Papua Yeni Gine'], c: 3, e: 'Papua Yeni Gine\'de 800\'den fazla farklı dil konuşulmaktadır.', d: 2 },
  { q: 'Tokyo\'nun n�fusu ka�tır? (yaklaşık)', a: ['10 milyon','20 milyon','38 milyon','55 milyon'], c: 2, e: 'Tokyo b�y�k şehir alanıyla 38 milyon+ n�fusuyla d�nya birincisi.', d: 2 },
  { q: 'D�nyanın en pahalı sporu hangisidir?', a: ['Formula 1','Golf','Polo','America\'s Cup yelken'], c: 3, e: 'America\'s Cup yelken yarışı, Formula 1\'i bile maliyet a�ısından geride bırakıyor.', d: 3 },
  { q: 'D�nya\'nın en �ok satılan roman serisi hangisidir?', a: ['Harry Potter','James Bond','Lord of the Rings','Agatha Christie'], c: 0, e: 'Harry Potter serisi 500 milyon+ satışla en �ok satan roman serisidir.', d: 1 },

  // T�rkiye Eğlence
  { q: 'T�rk Hava Yolları ka� �lkeye u�uş yapar? (yaklaşık)', a: ['50','80','100','130+'], c: 3, e: 'THY 130+ �lkeye direkt u�uşla en fazla �lkeye u�an havayolu.', d: 1 },
  { q: '"Mavi boncuk" T�rkiye\'de ne i�in kullanılır?', a: ['S�s','Nazardan korunma','Şans getirme','Hepsi'], c: 3, e: 'Nazar boncuğu hem nazardan korunmak hem s�s hem şans i�in kullanılır.', d: 1 },
  { q: 'T�rk kahvesi UNESCO listesine hangi yılda girdi?', a: ['2010','2013','2015','2018'], c: 1, e: 'T�rk kahvesi k�lt�r� 2013\'te UNESCO somut olmayan k�lt�rel miras listesine alındı.', d: 1 },
  { q: 'T�rkiye kişi başına �ay t�ketiminde d�nyada ka�ıncı?', a: ['1.','3.','5.','10.'], c: 0, e: 'T�rkiye kişi başına �ay t�ketiminde d�nya birincisidir.', d: 1 },
  { q: 'Diriliş Ertuğrul ka� �lkede izlendi?', a: ['50','100','150+','200+'], c: 2, e: '"Diriliş Ertuğrul" 150+ �lkede izlenerek T�rk dizilerinin rekorunu kırdı.', d: 1 },

  // Spor Eğlence
  { q: 'Maraton neden tam 42,195 km\'dir?', a: ['Antik Yunan geleneği','İngiliz kraliyet ailesi i�in ayarlandı','Rastgele','Olimpiyat kuralı'], c: 1, e: '1908 Londra Olimpiyatları\'nda g�zergah kraliyet ailesi penceresinden bitecek şekilde ayarlandı.', d: 2 },
  { q: 'Futbol topunun siyah-beyaz deseni neden var?', a: ['Moda','TV\'de g�r�n�rl�k i�in','Gelenek','Kural'], c: 1, e: 'Siyah-beyaz desen siyah-beyaz TV yayınında topun daha iyi g�r�nmesi i�in tasarlandı.', d: 2 },
  { q: 'Golf topundaki �ukurcuklar ne işe yarar?', a: ['G�r�n�ş i�in','Az s�rt�nme','Daha uzak gitmek i�in','Tutunma i�in'], c: 2, e: '�ukurcuklar aerodinamiği artırarak topun %40 daha uzağa gitmesini sağlar.', d: 2 },
  { q: 'Hangi �lke en fazla olimpiyat madalyası kazandı (tarihsel)?', a: ['Rusya','�in','Almanya','ABD'], c: 3, e: 'ABD 1.000+ olimpiyat madalyasıyla tarihsel sıralamada a�ık ara birinci.', d: 2 },


  // ── Vay Be! Soruları ──
  { q: 'Kutup ayısı t�yleri aslında hangi renktedir?', a: ['Beyaz', 'Sarı', 'Şeffaf; deri ise siyah', 'Gri'], c: 2, d: 2, vb: true, e: 'Kutup ayısı t�yleri renksiz ve şeffaftır; ışığı yansıttığı i�in beyaz g�r�n�r. Derisi ise ısıyı absorbe etmek i�in tamamen siyahtır. "Beyaz ayı" dediğimiz hayvanın hi� beyaz t�y� yoktur!' },
  { q: 'Bir insan �mr�nde ortalama ka� yıl uyur?', a: ['10 yıl', '15 yıl', '25 yıl', '35 yıl'], c: 2, d: 1, vb: true, e: 'Ortalama 79 yıllık bir �m�rde yaklaşık 26 yıl uyuyarak ge�irilir. �stelik 7 yıl �eşitli ekranların başında zaman harcanır. Uyanık ve ekransız ge�irilen "aktif" s�re tahmin edilenden �ok daha kısadır.' },
  { q: 'Popeye\'nin ıspanak yemesi hangi etkiyi yarattı?', a: ['Hi�bir şey', 'ABD\'de ıspanak t�ketimi yaklaşık %33 arttı', '�ocuklar ıspanaktan nefret etti', 'Yalnızca İngiltere\'de'], c: 1, d: 2, vb: true, e: '1929-1930\'larda Popeye �izgi romanının yayımlanmasının ardından ABD\'de ıspanak t�ketiminin belirgin bi�imde arttığı tarihi kayıtlara ge�ti. Karakter bir hata sonucu ıspanağın demiri 10 kat abartılmış olarak sunuldu � ama halk inandı.' },
  { q: '"Kelebek etkisi" hangi bilim dalına ait bir kavramdır?', a: ['Biyoloji', 'Meteoroloji', 'Kaos teorisi / matematik', 'Fizik'], c: 2, d: 2, vb: true, e: '"Kelebek etkisi" matematiksel kaos teorisine aittir: k���k başlangı� koşullarının b�y�k farklı sonu�lara yol a�abileceğini ifade eder. Edward Lorenz 1963\'te bir kelebeğin kanat �ırpmasının Teksas\'ta kasırgaya yol a�abileceğini metafor olarak kullandı.' },
  { q: 'D�nyanın en fazla satılan ticari �r�n� hangisidir?', a: ['iPhone', 'Coca-Cola', 'LEGO tuğlası', 'Monopoly'], c: 2, d: 2, vb: true, e: 'LEGO, yılda �retilen par�a sayısı bazında d�nyanın en �ok "�retilen nesnesini" oluşturur: yaklaşık 36 milyar LEGO par�ası yılda �retilir. Bu, her yaşayan insana 5 par�a d�şt�ğ� anlamına gelir.' },
  { q: '"OK" kelimesi nasıl ortaya �ıktı?', a: ['Old Kindly\'ın kısaltması', 'Yunan "ola kala" (her şey yolunda) ifadesinden', '1839 Amerikan gazetesinde yazım şakasından: "Oll Korrect"', 'Osmanlıca k�ken'], c: 2, d: 3, vb: true, e: '"OK" 1839\'da Boston Morning Post gazetesinde "All Correct" ifadesinin kasıtlı yanlış yazımı "Oll Korrect"in baş harfleri olarak şaka ama�lı kullanıldı. Bug�n İngilizcenin en evrensel kısaltmasına d�n�şt�; neredeyse t�m d�nya dillerinde aynı şekilde kullanılıyor.' },
];

export default fun;
