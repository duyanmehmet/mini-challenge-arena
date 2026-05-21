/**
 * Sunucu tarafı soru havuzu — canlı yarışma ve düello için
 * Kategori başına minimal ama sağlam sorular
 */
export interface ServerQuestion {
  q: string;
  a: string[];
  c: number;
  e?: string;
}

const history: ServerQuestion[] = [
  { q: 'Türkiye Cumhuriyeti hangi yılda ilan edildi?', a: ['1919','1920','1923','1938'], c: 2, e: 'Mustafa Kemal Atatürk, 29 Ekim 1923\'te Cumhuriyeti ilan etti.' },
  { q: 'İstanbul hangi yılda fethedildi?', a: ['1453','1071','1299','1517'], c: 0, e: 'Fatih Sultan Mehmet, 29 Mayıs 1453\'te İstanbul\'u fethetti.' },
  { q: 'Fransız İhtilali hangi yılda gerçekleşti?', a: ['1776','1789','1799','1815'], c: 1, e: '1789 Fransız İhtilali "Özgürlük, Eşitlik, Kardeşlik" şiarıyla başladı.' },
  { q: 'Malazgirt Savaşı hangi yılda gerçekleşti?', a: ['1071','1176','1243','1402'], c: 0, e: '1071\'de Selçuklular Bizans\'ı yenerek Anadolu\'nun kapısını açtı.' },
  { q: 'Atatürk hangi yılda vefat etti?', a: ['1935','1938','1940','1942'], c: 1, e: 'Atatürk 10 Kasım 1938\'de hayatını kaybetti.' },
  { q: 'Lozan Antlaşması hangi yılda imzalandı?', a: ['1920','1921','1923','1925'], c: 2, e: 'Lozan 24 Temmuz 1923\'te imzalandı.' },
  { q: 'Osmanlı İmparatorluğu hangi yılda kuruldu?', a: ['1299','1453','1071','1326'], c: 0, e: 'Osman Bey\'in 1299\'da bağımsızlığını ilanıyla Osmanlı kuruldu.' },
  { q: 'Türkiye\'de harf devrimi hangi yılda gerçekleşti?', a: ['1925','1928','1932','1934'], c: 1, e: 'Latin alfabesine 1 Kasım 1928\'de geçildi.' },
  { q: 'Berlin Duvarı hangi yılda yıkıldı?', a: ['1987','1988','1989','1990'], c: 2, e: 'Berlin Duvarı 9 Kasım 1989\'da yıkıldı.' },
  { q: 'İkinci Dünya Savaşı hangi yılda sona erdi?', a: ['1943','1944','1945','1946'], c: 2, e: 'Japonya\'nın teslim olmasıyla Eylül 1945\'te sona erdi.' },
];

const geography: ServerQuestion[] = [
  { q: 'Türkiye\'nin başkenti neresidir?', a: ['İstanbul','Ankara','İzmir','Bursa'], c: 1, e: 'Ankara 1923\'ten beri başkenttir.' },
  { q: 'Dünyanın en yüksek dağı hangisidir?', a: ['K2','Kangchenjunga','Everest','Lhotse'], c: 2, e: 'Everest 8848 m ile en yüksek dağdır.' },
  { q: 'Dünyanın en uzun nehri hangisidir?', a: ['Amazon','Nil','Mississippi','Yangtze'], c: 1, e: 'Nil yaklaşık 6650 km uzunluğuyla en uzun nehirdir.' },
  { q: 'Avustralya\'nın başkenti neresidir?', a: ['Sidney','Melbourne','Canberra','Brisbane'], c: 2, e: 'Canberra 1913\'te planlı olarak kurulan başkenttir.' },
  { q: 'Dünyanın en büyük ülkesi hangisidir?', a: ['Kanada','ABD','Çin','Rusya'], c: 3, e: 'Rusya 17,1 milyon km² ile en büyük ülkedir.' },
  { q: 'Türkiye\'nin en büyük gölü hangisidir?', a: ['Beyşehir','Eğirdir','Tuz Gölü','Van Gölü'], c: 3, e: 'Van Gölü 3755 km² ile en büyük göldür.' },
  { q: 'Süveyş Kanalı hangi yılda açıldı?', a: ['1854','1869','1881','1905'], c: 1, e: 'Süveyş Kanalı 1869\'da açıldı.' },
  { q: 'Kapadokya hangi ilde bulunur?', a: ['Konya','Ankara','Nevşehir','Kayseri'], c: 2, e: 'Kapadokya Nevşehir merkezlidir.' },
  { q: 'Dünyanın en derin gölü hangisidir?', a: ['Titicaca','Superior','Baykal','Hazar'], c: 2, e: 'Baykal Gölü 1642 m derinliğiyle en derinidir.' },
  { q: 'Türkiye kaç komşu ülkeyle sınır paylaşır?', a: ['6','7','8','9'], c: 2, e: 'Türkiye 8 ülkeyle sınır paylaşır.' },
];

const science: ServerQuestion[] = [
  { q: 'Işığın havadaki hızı yaklaşık kaçtır?', a: ['300.000 km/s','150.000 km/s','30.000 km/s','3.000 km/s'], c: 0, e: 'Işık vakumda ~300.000 km/s hızla ilerler.' },
  { q: 'Suyun kimyasal formülü nedir?', a: ['CO₂','H₂O₂','H₂O','NaCl'], c: 2, e: 'Su iki hidrojen, bir oksijenden oluşur.' },
  { q: 'Güneş sisteminin en büyük gezegeni hangisidir?', a: ['Satürn','Neptün','Jüpiter','Uranüs'], c: 2, e: 'Jüpiter Dünya\'nın 1300 katı hacmindedir.' },
  { q: 'DNA\'nın açılımı nedir?', a: ['Deoksiribo Nükleik Asit','Dinükleotit Asit','Dipeptit Asit','Dioksi Asit'], c: 0, e: 'DNA genetik bilgiyi taşır.' },
  { q: 'Atmosferin en çok hangi gazı içerir?', a: ['Oksijen','Karbondioksit','Azot','Argon'], c: 2, e: 'Atmosferin %78\'i azottur.' },
  { q: 'Penisilin\'i kim keşfetti?', a: ['Marie Curie','Louis Pasteur','Alexander Fleming','Robert Koch'], c: 2, e: 'Fleming 1928\'de keşfetti.' },
  { q: 'Altının kimyasal sembolü nedir?', a: ['Al','Ag','Au','At'], c: 2, e: 'Au Latince "aurum"dan gelir.' },
  { q: 'Hangi gezegen Kızıl Gezegen olarak bilinir?', a: ['Venüs','Jüpiter','Satürn','Mars'], c: 3, e: 'Mars yüzeyindeki demir oksit nedeniyle kırmızıdır.' },
  { q: 'Normal vücut sıcaklığı kaç derecedir?', a: ['35°C','36-37°C','38°C','39°C'], c: 1, e: 'Normal vücut ısısı 36-37°C arasındadır.' },
  { q: 'Yerçekimi ivmesi yaklaşık kaçtır?', a: ['8,5 m/s²','9,8 m/s²','10,5 m/s²','11,2 m/s²'], c: 1, e: 'Dünya yüzeyinde g ≈ 9,8 m/s²\'dir.' },
];

const general: ServerQuestion[] = [
  { q: 'İstanbul\'un eski adı nedir?', a: ['Byzantium/Konstantinopolis','Nicaea','Pergamon','Ephesus'], c: 0, e: 'Önce Byzantium, sonra Konstantinopolis adını taşıdı.' },
  { q: 'Olimpiyatlar kaç yılda bir yapılır?', a: ['2','4','3','5'], c: 1, e: 'Olimpiyatlar 4 yılda bir düzenlenir.' },
  { q: 'Uzaya ilk çıkan insan kimdir?', a: ['Neil Armstrong','Buzz Aldrin','Yuri Gagarin','Alan Shepard'], c: 2, e: 'Yuri Gagarin 12 Nisan 1961\'de uzaya çıktı.' },
  { q: 'Dünyanın en kalabalık ülkesi hangisidir?', a: ['Hindistan','Çin','ABD','Endonezya'], c: 0, e: 'Hindistan 2023\'te Çin\'i geçerek 1. oldu.' },
  { q: 'World Wide Web\'i kim icat etti?', a: ['Bill Gates','Steve Jobs','Tim Berners-Lee','Mark Zuckerberg'], c: 2, e: 'Tim Berners-Lee 1989\'da CERN\'de WWW\'yi tasarladı.' },
  { q: 'Nobel ödülü ilk kez hangi yılda verildi?', a: ['1895','1901','1905','1910'], c: 1, e: 'Nobel ödülleri 1901\'den beri verilmektedir.' },
  { q: 'Wright kardeşler motorlu uçağı hangi yılda uçurdu?', a: ['1893','1903','1913','1923'], c: 1, e: '17 Aralık 1903\'te ilk uçuş gerçekleşti.' },
  { q: 'Türkiye\'nin ulusal çiçeği hangisidir?', a: ['Gül','Lale','Papatya','Sümbül'], c: 1, e: 'Lale Türkiye\'nin ulusal çiçeğidir.' },
  { q: 'Dünyadaki en yüksek bina hangisidir?', a: ['Empire State','Burj Khalifa','Shanghai Tower','Makkah Tower'], c: 1, e: 'Burj Khalifa 828 m ile en yüksek yapıdır.' },
  { q: 'Amazon\'u kim kurdu?', a: ['Bill Gates','Elon Musk','Jeff Bezos','Larry Page'], c: 2, e: 'Jeff Bezos 1994\'te Amazon\'u kurdu.' },
];

const turkey: ServerQuestion[] = [
  { q: 'Gaziantep hangi yiyeceğiyle dünyaca ünlüdür?', a: ['Döner','Baklava','Lahmacun','Kebap'], c: 1, e: 'Antep baklavası 2015\'te UNESCO Gastronomi Şehri unvanı kazandırdı.' },
  { q: 'Türkiye\'de "Kırkpınar" ne tür bir yarışmadır?', a: ['At yarışı','Yağlı güreş','Ok atma','Cirit'], c: 1, e: '660+ yıllık geçmişiyle dünyanın en eski spor etkinliğidir.' },
  { q: 'Türkiye\'de en çok hangi çay tüketilir?', a: ['Yeşil çay','Bitki çayı','Siyah çay','Beyaz çay'], c: 2, e: 'Türkiye kişi başına en fazla çay tüketen ülkedir.' },
  { q: 'Atatürk hangi şehirde doğdu?', a: ['İstanbul','Ankara','Selanik','İzmir'], c: 2, e: 'Atatürk bugün Yunanistan\'da bulunan Selanik\'te doğdu.' },
  { q: 'İstanbul Havalimanı dünyanın kaçıncı büyük havalimanıdır?', a: ['3.','5.','8.','10.'], c: 0, e: 'İstanbul Havalimanı yolcu kapasitesiyle dünyanın 3. büyüğüdür.' },
  { q: 'TOGG nedir?', a: ['Futbol kulübü','Yerli otomobil','Teknoloji şirketi','Devlet bankası'], c: 1, e: 'TOGG Türkiye\'nin ilk yerli elektrikli otomobilidir.' },
  { q: 'Türk kahvesinin köpüğü nasıl oluşur?', a: ['Süt eklenerek','Karıştırılmadan kaynatılarak','Şeker eklenerek','Makineyle'], c: 1, e: 'Cezve\'de karıştırılmadan ısıtılan kahve doğal köpük oluşturur.' },
  { q: '"İskender kebabı" hangi şehre aittir?', a: ['İstanbul','Ankara','Bursa','İzmir'], c: 2, e: '1867\'de Bursa\'da İskender Efendi tarafından icat edildi.' },
  { q: 'Türkiye hangi iki kıtada toprak sahibidir?', a: ['Asya-Afrika','Avrupa-Asya','Avrupa-Afrika','Asya-Amerika'], c: 1, e: 'Türkiye hem Avrupa\'da (Trakya) hem Asya\'da (Anadolu) toprak sahibidir.' },
  { q: 'Türkiye UNESCO Dünya Mirası listesinde kaç alan sahiptir? (yaklaşık)', a: ['6','10','19','25'], c: 2, e: 'Türkiye\'nin 19 UNESCO Dünya Mirası alanı vardır.' },
];

const fun: ServerQuestion[] = [
  // İlginç Gerçekler
  { q: 'Bir ahtapotun kaç kalbi vardır?', a: ['1','2','3','4'], c: 2, e: 'Ahtapotun 3 kalbi var: 2 tanesi solungaçlara, 1 tanesi vücuda kan pompalar.' },
  { q: 'Hangi hayvan hiç uyumaz?', a: ['Yunus','Karınca','At','Balık'], c: 1, e: 'Karıncalar uyumaz! Kısa kısa dinlenme molaları verirler ama derin uyku bilmezler.' },
  { q: 'Bir insanın kaç kemik var bebek olarak doğduğunda?', a: ['206','270','300','350'], c: 1, e: 'Bebekler 270 kemikle doğar, büyüyünce kemikler birleşerek 206\'ya düşer.' },
  { q: '"Selfie" kelimesi ilk hangi yılda kullanıldı?', a: ['2002','2004','2013','2010'], c: 0, e: '"Selfie" kelimesi 2002\'de Avustralyalı bir kullanıcı tarafından ilk kez kullanıldı.' },
  { q: 'Hangi meyve botanik olarak meyve değil sebzedir?', a: ['Domates','Elma','Armut','Muz'], c: 0, e: 'Botanik açıdan domates bir meyve! Ama mutfakta sebze olarak kullanılır.' },
  { q: 'Dünyanın en yüksek binalı şehri hangisidir?', a: ['Dubai','New York','Hong Kong','Şangay'], c: 2, e: 'Hong Kong\'da 100m üstü 550+ bina var — en yüksek binalı şehir.' },
  { q: 'Hangi renk arıları daha az saldırgan yapar?', a: ['Beyaz','Sarı','Kırmızı','Mavi'], c: 0, e: 'Beyaz renk arıları sakinleştirir — arıcılar beyaz giyinir.' },
  { q: 'Bir bulutun ağırlığı ortalama kaçtır?', a: ['1 ton','100 ton','500 ton','500.000 ton'], c: 3, e: 'Ortalama bir bulut yaklaşık 500.000 ton ağırlığındadır!' },
  { q: 'Hangi ülkede "Evet" anlamında baş sallamak "Hayır" anlamına gelir?', a: ['Japonya','Hindistan','Bulgaristan','Yunanistan'], c: 2, e: 'Bulgaristan\'da baş yukarı-aşağı sallamak HAYIR, sağa-sola "Evet" anlamına gelir!' },
  { q: 'İnsan gözü kaç rengi ayırt edebilir?', a: ['1.000','100.000','1.000.000','10.000.000'], c: 3, e: 'İnsan gözü yaklaşık 10 milyon farklı rengi ayırt edebilir.' },
  { q: 'Hangi ülke yatay değil dikey bayrağa sahip?', a: ['Türkiye','Almanya','Hollanda','İsviçre'], c: 3, e: 'İsviçre\'nin bayrağı kare şeklinde, dikey değil — benzersiz!' },
  { q: 'Dünyanın en çok satılan kitabı (din kitapları hariç) hangisidir?', a: ['Harry Potter','Don Kişot','Sherlock Holmes','Küçük Prens'], c: 0, e: 'Harry Potter serisi 500 milyon+ satışla 1. sırada.' },
  { q: 'Bir gün Mars\'ta kaç saat sürer?', a: ['20 saat','22 saat','24 saat 37 dakika','26 saat'], c: 2, e: 'Mars\'ta bir gün (sol) Dünya\'daki günden sadece 37 dakika uzun.' },
  { q: 'Hangi hayvan dünyada en çok yaşayandır?', a: ['Kaplumbağa','Fil','Köpekbalığı','İstiridye'], c: 3, e: 'Deniz istiridyesi 500+ yıl yaşayabilir. Ming isimli biri 507 yaşında öldü!' },
  { q: 'Türkiye\'nin en çok satan yerli oyunu hangisidir?', a: ['Brawl Stars','League of Legends','Zula','PUBG Mobile'], c: 2, e: 'Zula, Türk yapımı en başarılı FPS oyunu.' },

  // Pop Kültür
  { q: '"Squid Game"de katılımcı sayısı kaçtır?', a: ['100','456','365','999'], c: 1, e: 'Squid Game\'de 456 katılımcı var. Dizi 2021\'de tüm dünyayı sarstı.' },
  { q: '"Game of Thrones"un Türkçe adı nedir?', a: ['Taht Oyunları','Ejderhalar Oyunu','Güç Savaşı','Demir Taht'], c: 0, e: 'GOT Türkiye\'de "Taht Oyunları" adıyla yayınlandı.' },
  { q: 'Instagram\'ı kim kurdu?', a: ['Jack Dorsey','Kevin Systrom','Mark Zuckerberg','Evan Spiegel'], c: 1, e: 'Kevin Systrom ve Mike Krieger Instagram\'ı 2010\'da kurdu.' },
  { q: 'Minecraft\'ta üs malzeme nedir?', a: ['Taş','Kum','Ahşap','Demir'], c: 2, e: 'Minecraft\'ta her şey ahşap ile başlar — temel kaynak.' },
  { q: 'TikTok hangi ülkeden çıktı?', a: ['Japonya','Güney Kore','Çin','ABD'], c: 2, e: 'TikTok (Douyin) 2016\'da Çin\'de ByteDance şirketi tarafından kuruldu.' },
  { q: 'Dünya kupasında en çok gol atan ülke hangisidir?', a: ['Almanya','Arjantin','Brezilya','Fransa'], c: 2, e: 'Brezilya Dünya Kupası\'nda en fazla gol atan ülkedir.' },
  { q: '"Emoji" kelimesi hangi dildene gelir?', a: ['Çince','Japonca','Korece','İngilizce'], c: 1, e: 'Emoji Japoncada "resim" (e) + "karakter" (moji) kelimelerinden gelir.' },
  { q: 'WhatsApp\'ın kurucuları kimlerdir?', a: ['Zuckerberg ve Dorsey','Jan Koum ve Brian Acton','Gates ve Jobs','Musk ve Bezos'], c: 1, e: 'Jan Koum ve Brian Acton 2009\'da WhatsApp\'ı kurdu. 2014\'te Facebook 19 milyar $\'a satın aldı.' },
  { q: 'Dünyanın en çok izlenen YouTube videosu hangisidir?', a: ['Gangnam Style','Despacito','Baby Shark','Shape of You'], c: 2, e: 'Baby Shark 13 milyar+ izlemeyle en çok izlenen video.' },
  { q: 'Netflix hangi yılda kuruldu?', a: ['1995','1997','2000','2003'], c: 1, e: 'Netflix 1997\'de DVD kiralama servisi olarak kuruldu. Streaming\'e 2007\'de geçti.' },

  // Komik Bilgi
  { q: 'Hangi hayvanın parmak izi insanınkiyle neredeyse aynıdır?', a: ['Köpek','Şempanze','Koala','Orangutan'], c: 2, e: 'Koalaların parmak izi insan parmak iziyle neredeyse ayırt edilemez!' },
  { q: 'Bir muz aslında botanik olarak nedir?', a: ['Meyve','Sebze','Çilek','Baklagil'], c: 2, e: 'Muz botanik olarak bir çilektir! Çilek ise teknik olarak meyve sayılmaz.' },
  { q: 'Hangi hayvan 360 derece dönebilen tek hayvandır?', a: ['Kameleon','Baykuş','Timsah','Yılan'], c: 1, e: 'Baykuş başını 270 dereceye kadar çevirebilir, ama 360 değil — şehir efsanesi!' },
  { q: 'Coca-Cola\'nın orijinal rengi neydi?', a: ['Kırmızı','Yeşil','Sarı','Siyah'], c: 1, e: 'İlk üretildiğinde Coca-Cola yeşil renkti! Karamel boyası sonradan eklendi.' },
  { q: '"Avatar" filminin arka planı Türkiye\'nin neresinden esinlenildi?', a: ['Kapadokya','Pamukale','Trabzon','Mardin'], c: 0, e: 'Avatar\'daki uçan dağlar için Kapadokya peri bacaları ilham kaynağı oldu.' },
  { q: 'Hangi ülke uzaya en fazla ülke bayrağı gönderdi?', a: ['Rusya','Çin','ABD','Japonya'], c: 2, e: 'ABD Ay\'a 6 bayrak dikti. Ancak NASA\'ya göre hepsi artık ağarmış durumda.' },
  { q: 'Dünyanın en pahalı sporu hangisidir?', a: ['Formula 1','Golf','Polo','Yelkenli yarışları'], c: 3, e: 'America\'s Cup yelken yarışı, Formula 1\'i bile geride bırakıyor.' },
  { q: 'Hangisi gerçek bir meslek adıdır?', a: ['Profesyonel yatma uzmanı','Bulut mimarı','Emoji tasarımcısı','Hepsi'], c: 3, e: 'Hepsi gerçek meslekler! "Bulut mimarı" cloud computing uzmanı, diğerleri de var.' },

  // Türkiye Pop Kültür
  { q: 'Türkiye\'nin en çok izlenen dizi türü hangisidir?', a: ['Polisiye','Komedi','Romantik dram','Fantastik'], c: 2, e: 'Türk romantik dizileri dünyada 150+ ülkede izleniyor.' },
  { q: '"Naber" kelimesi hangi iki kelimeden oluşur?', a: ['Ne + Haber','Na + Ber','Ne + Var','Ne + Bar'], c: 0, e: '"Naber" = "Ne haber?" kelimesinin kısalmasıdır.' },
  { q: 'Türkiye\'nin en çok tüketilen fast foodu hangisidir?', a: ['Pizza','Hamburger','Döner','Dürüm'], c: 2, e: 'Türkiye\'de günde 3 milyon+ döner tüketilir.' },
  { q: 'Türk dizisi "Diriliş: Ertuğrul" dünyada kaç ülkede izlendi?', a: ['20','50','100','150'], c: 3, e: '"Diriliş: Ertuğrul" 150+ ülkede izlenerek rekor kırdı.' },
  { q: 'Türkiye\'de en çok hangi sporu izleyen insan sayısı vardır?', a: ['Basketbol','Futbol','Voleybol','Güreş'], c: 1, e: 'Futbol tartışmasız Türkiye\'nin 1 numaralı sporudur.' },

  // Hayvan Dünyası
  { q: 'Hangi hayvan hiç su içmez?', a: ['Deve','Kanguru sıçanı','Koala','Kertenkele'], c: 1, e: 'Kanguru sıçanı ihtiyacı olan suyu yediği tohumlardan üretir, hiç su içmez!' },
  { q: 'Deniz atlarında yavrularla kim ilgilenir?', a: ['Dişi','Erkek','İkisi birlikte','Hiçbiri'], c: 1, e: 'Deniz atlarında erkek hamile kalır ve yavrular doğurur!' },
  { q: 'Hangi hayvanın dili vücudundan uzundur?', a: ['Zürafa','Bukalemun','Kurbağa','Karıncayiyen'], c: 1, e: 'Bukalemunun dili vücut uzunluğunun 1,5 katı kadar uzundur.' },
  { q: 'Fil dişleri aslında nedir?', a: ['Diş','Kemik','Uzamış üst kesici diş','Boynuz'], c: 2, e: 'Fil dişleri aşırı büyümüş üst kesici dişlerdir.' },
  { q: 'Hangi kuş geriye doğru uçabilir?', a: ['Guguk','Sinek kuşu','Kartal','Papağan'], c: 1, e: 'Sinek kuşu geriye, yana ve hatta baş aşağı uçabilir.' },
  { q: 'Ahtapot sıkışınca ne yapar?', a: ['Saklanır','Kolunu koparır','Renk değiştirir','Mürekkep sıkar'], c: 1, e: 'Ahtapot kolunu düşmanın ağzında bırakıp kaçar — kol yeniden çıkar!' },
  { q: 'Hangi hayvanın parmak izi yoktur?', a: ['Köpek','Kedi','İnsan','Papağan'], c: 3, e: 'Papağanların parmak izi yoktur. Köpek ve kedilerin de yok aslında.' },
  { q: 'Bir zürafanın dili hangi renktedir?', a: ['Pembe','Kırmızı','Siyah-mor','Mavi'], c: 2, e: 'Zürafanın dili koyu mavi-mor renktedir. Güneşten korunmak için.' },
  { q: 'Hangi böcek binlerce yıl boyunca uçamayan tek böcektir?', a: ['Karınca','Arı','Pire','Hamamböceği'], c: 0, e: 'Karıncaların büyük çoğunluğu kanatsızdır ve uçamaz.' },

  // Yiyecek & İçecek
  { q: 'Dünya\'nın en pahalı baharatı hangisidir?', a: ['Vanilya','Safran','Karabiber','Tarçın'], c: 1, e: 'Safran 1 kg\'ı 10.000$\'a kadar çıkabilen en pahalı baharattır.' },
  { q: 'Çikolata ilk olarak hangi biçimde tüketildi?', a: ['Katı tablet','Sıcak içecek','Dondurma','Pasta'], c: 1, e: 'Aztekler çikolatayı sıcak acılı içecek olarak içerdi. Tablet çikolata çok sonra geldi.' },
  { q: 'Hangi meyvenin içinde en fazla vitamin C vardır?', a: ['Limon','Portakal','Kivi','Çilek'], c: 2, e: 'Kivi, portakaldan 2 kat fazla C vitamini içerir!' },
  { q: 'Pizza hangi ülkede icat edildi?', a: ['ABD','Fransa','İtalya','Yunanistan'], c: 2, e: 'Pizza İtalya\'nın Napoli şehrinde 18. yüzyılda icat edildi.' },
  { q: '"Umami" hangi ülkenin bulduğu tat kavramıdır?', a: ['Çin','Güney Kore','Japonya','Vietnam'], c: 2, e: 'Umami (lezzetli/derin tat) Japonya\'da 1908\'de Ikeda Kikunae tarafından tanımlandı.' },
  { q: 'Bal kaç yıl bozulmadan kalabilir?', a: ['5 yıl','50 yıl','100 yıl','Sonsuza kadar'], c: 3, e: 'Mısır piramitlerinde 3000 yıllık bal bulundu ve hala yenilebilir durumdaydı!' },
  { q: 'Hangi sebze %90\'dan fazla su içerir?', a: ['Patates','Havuç','Salatalık','Domates'], c: 2, e: 'Salatalık %96 su içeriğiyle en "sulu" sebzelerden biridir.' },
  { q: 'Türk kahvesi ne kadar kaynatılır?', a: ['Bir kez','İki kez','Üç kez','Dört kez'], c: 1, e: 'Türk kahvesi iki kez kaynatılır — bu köpüğü ve tadı oluşturur.' },
  { q: 'Dünyanın en çok tüketilen içeceği su\'dan sonra hangisidir?', a: ['Kola','Süt','Çay','Kahve'], c: 2, e: 'Çay dünyada sudan sonra en fazla içilen içecektir.' },

  // Teknoloji & İnternet
  { q: 'Google\'ın adı nasıl ortaya çıktı?', a: ['Kurucusunun adı','Googol kelimesinin yanlış yazımı','Rastgele seçildi','İngilizce "arama" demek'], c: 1, e: '"Googol" 10\'un 100. kuvveti demek. Etki alanı kaydederken yanlış yazıldı: Google!' },
  { q: 'İlk gönderilen e-posta ne zaman gönderildi?', a: ['1969','1971','1975','1980'], c: 1, e: 'İlk e-posta 1971\'de Ray Tomlinson tarafından kendisine gönderildi.' },
  { q: 'Twitter\'ın 280 karakter sınırının önceki limiti kaçtı?', a: ['100','120','140','160'], c: 2, e: 'Twitter 2006-2017 yılları arasında 140 karakter sınırı uyguladı.' },
  { q: 'İlk iPhone ne zaman tanıtıldı?', a: ['2005','2006','2007','2008'], c: 2, e: 'Steve Jobs ilk iPhone\'u 9 Ocak 2007\'de sahneye çıkardı.' },
  { q: 'YouTube hangi yılda Google tarafından satın alındı?', a: ['2005','2006','2007','2008'], c: 1, e: 'Google YouTube\'u Ekim 2006\'da 1,65 milyar dolara satın aldı.' },
  { q: 'Dünyada en çok kullanılan şifre hangisidir?', a: ['123456','password','qwerty','abc123'], c: 0, e: '"123456" her yıl dünyanın en kötü ve en yaygın şifresi seçiliyor.' },
  { q: 'Wifi kelimesi neyin kısaltmasıdır?', a: ['Wireless Fidelity','Wide Field Internet','Wireless First','Hiçbirinin kısaltması değil'], c: 3, e: 'Wi-Fi hiçbir şeyin kısaltması değil — pazarlama amaçlı uydurulmuş bir isim!' },
  { q: 'Dünyanın ilk web sitesi hâlâ ayakta mı?', a: ['Evet','Hayır','Bilinmiyor','Arşivde var'], c: 0, e: 'Evet! info.cern.ch hâlâ erişilebilir. Tim Berners-Lee 1991\'de yayınladı.' },

  // Spor Eğlence
  { q: 'Futbol topunun siyah-beyaz deseni neden var?', a: ['Moda','TV\'de görünürlük için','Geleneksel','Kurala göre'], c: 1, e: 'Siyah-beyaz desen siyah-beyaz TV yayınında topun daha iyi görünmesi için tasarlandı.' },
  { q: 'Maraton neden 42,195 km\'dir?', a: ['Olimpiyat kuralı','İngiliz kraliyet ailesi için','Rastgele belirlendi','Antik Yunan geleneği'], c: 1, e: '1908 Londra Olimpiyatları\'nda güzergah kraliyet ailesi penceresinden bitecek şekilde ayarlandı.' },
  { q: 'Dünyanın en kısa maç hangi sporda oynandı?', a: ['Boks','Tenis','Sumo güreşi','Beyzbol'], c: 2, e: 'Sumo güreşinde bir maç 1 saniyenin altında bitebilir!' },
  { q: 'Golf topundaki çukurcuklar ne işe yarar?', a: ['Görünüşü için','Daha az sürtünme','Daha uzak gitmesini sağlar','Tutunma için'], c: 2, e: 'Çukurcuklar aerodinamiği artırarak topun %40 daha uzağa gitmesini sağlar.' },
  { q: 'Hangi spor ilk olimpiyatlarda yoktu?', a: ['Koşu','Yüzme','Güreş','Disk atma'], c: 1, e: 'Yüzme modern olimpiyatlarda 1896\'da yer almadı, 1900\'de eklendi.' },

  // Dünya Rekortmenleri
  { q: 'Dünyanın en küçük ülkesi hangisidir?', a: ['Monako','San Marino','Vatikan','Liechtenstein'], c: 2, e: 'Vatikan 0,44 km² ile dünyanın en küçük ülkesidir.' },
  { q: 'Dünyanın en çok dil konuşan ülkesi hangisidir?', a: ['Hindistan','Çin','Nijerya','Papua Yeni Gine'], c: 3, e: 'Papua Yeni Gine\'de 800\'den fazla farklı dil konuşulmaktadır.' },
  { q: 'İnsan tarihinde en uzun süre görev yapan devlet başkanı kimdir?', a: ['Fidel Castro','Mao Zedong','Kim İl-sung','Muammer Kaddafi'], c: 2, e: 'Kuzey Kore\'nin kurucusu Kim İl-sung 46 yıl görev yaptı.' },
  { q: 'Dünyanın en kalabalık şehri hangisidir?', a: ['Mumbai','Tokyo','Shanghai','Pekin'], c: 1, e: 'Tokyo 38 milyondan fazla nüfusuyla dünyanın en kalabalık şehridir.' },
  { q: 'Dünyada en fazla heykel hangi ülkededir?', a: ['İtalya','Fransa','Japonya','Çin'], c: 3, e: 'Çin\'de milyarlarca heykel, büst ve anıt bulunmaktadır.' },

  // Komik Gerçekler
  { q: 'Bir muz yedikten sonra hangi ruh hali değişikliği olur?', a: ['Üzülme','Mutluluk artar','Uyku gelir','Odaklanma azalır'], c: 1, e: 'Muz serotonin ve dopamin üretimini artırır — mutluluk hormonu!' },
  { q: 'Bir insan ömrü boyunca ortalama kaç kez güler?', a: ['50.000','200.000','500.000','1.000.000'], c: 1, e: 'Bir insan ömrü boyunca ortalama 290.000 kez güler.' },
  { q: '"Akıllı telefon bağımlılığı" için bilimsel terim nedir?', a: ['Nomophobia','Phonophobia','Textmania','Appaholic'], c: 0, e: '"Nomophobia" = No Mobile Phobia. Telefonsuz kalma korkusu.' },
  { q: 'İnsan beyni ne zaman en aktiftir?', a: ['Sabah','Öğleden sonra','Gece','Uyurken'], c: 3, e: 'Beyin uyku sırasında gün içindeki deneyimleri işler — en yoğun aktivite uykuda!' },
  { q: 'Hangi aktivite beyne en fazla kan pompalanmasını sağlar?', a: ['Koşu','Satranç','Müzik çalma','Dans'], c: 2, e: 'Müzik aleti çalmak beyinin en fazla bölgesini aynı anda aktif eden faaliyettir.' },
  { q: 'Bir insan hayatı boyunca ortalama kaç km yürür?', a: ['10.000 km','50.000 km','100.000 km','200.000 km'], c: 2, e: 'Ortalama bir insan hayatı boyunca yaklaşık 100.000 km yürür — Dünya\'yı 2,5 kez dolaşır!' },
  { q: 'Kahkaha atmak kaç kası çalıştırır?', a: ['5','15','43','100'], c: 1, e: 'Gülmek yaklaşık 15 farklı kas gruplarını çalıştırır.' },
  { q: 'Bir insan gözü kaç megapiksel gücünde?', a: ['8 MP','20 MP','100 MP','576 MP'], c: 3, e: 'İnsan gözü yaklaşık 576 megapiksel çözünürlüğe sahip — en iyi kameraları geride bırakıyor.' },

  // Türkiye Eğlence
  { q: 'İstanbul\'da kaç köprü Boğaz\'ı geçer?', a: ['1','2','3','4'], c: 2, e: 'Boğaziçi, FSM ve Yavuz Sultan Selim köprüsü olmak üzere 3 köprü var.' },
  { q: 'Türkiye\'de kaç ilçe vardır? (yaklaşık)', a: ['500','700','900','1000'], c: 2, e: 'Türkiye\'de 81 il ve yaklaşık 922 ilçe bulunmaktadır.' },
  { q: 'Türk Hava Yolları kaç ülkeye uçuş yapar? (yaklaşık)', a: ['50','80','120','130'], c: 3, e: 'THY 130+ ülkeye uçuşla en fazla ülkeye direkt uçuş yapan havayolu.' },
  { q: 'Türkiye\'de hangi şehir en fazla deprem riski taşır?', a: ['İstanbul','İzmir','Ankara','Bursa'], c: 0, e: 'İstanbul Kuzey Anadolu Fayı üzerinde konumlanıyor — yüksek deprem riski.' },
  { q: 'Türkiye her yıl kaç turist ağırlar? (yaklaşık)', a: ['10 milyon','20 milyon','40 milyon','60 milyon'], c: 3, e: 'Türkiye yılda yaklaşık 55-60 milyon turistle dünyanın en çok ziyaret edilen ülkeleri arasında.' },
  { q: 'Türk çayı dünyada hangi sırada en fazla tüketilir?', a: ['1.','2.','3.','5.'], c: 0, e: 'Türkiye kişi başına çay tüketiminde dünya 1. si!' },
];

export const QUESTION_POOLS: Record<string, ServerQuestion[]> = {
  history,
  geography,
  science,
  general,
  turkey,
  fun,
  art:       general,
  cinema:    general,
  sports:    general,
  kids:      general,
  license:   general,
  medical:   science,
  economy:   general,
};

/** Her çağrıda farklı sorular — Fisher-Yates karıştırma */
export function getSeedQuestions(category: string, _seed: number, count = 10): ServerQuestion[] {
  const pool = QUESTION_POOLS[category] ?? general;
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, Math.min(count, arr.length));
}
