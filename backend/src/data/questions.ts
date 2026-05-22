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
  { q: 'Kleopatra hangi medeniyete aitti?', a: ['Roma','Yunan','Mısır','Mezopotamya'], c: 2, e: 'Kleopatra son Mısır firavunuydu, aslında Yunan asıllıydı.' },
  { q: 'Çin Seddi ne kadar uzundur?', a: ['2.000 km','8.850 km','21.000 km','50.000 km'], c: 2, e: 'Çin Seddi tüm kollarıyla ~21.000 km uzunluğundadır.' },
  { q: 'Titanik hangi yılda battı?', a: ['1910','1912','1914','1916'], c: 1, e: 'RMS Titanik 15 Nisan 1912\'de battı. 1.517 kişi hayatını kaybetti.' },
  { q: 'İnsanlık tarihinin ilk yazılı kanunları kimdir?', a: ['Hammurabi','Solon','Justinianus','Musa'], c: 0, e: 'Hammurabi Kanunları MÖ 1754\'te yazılmış, tarihin en eski yazılı yasa kitabıdır.' },
  { q: 'Ay\'a ilk ayak basan insan kimdir?', a: ['Buzz Aldrin','Neil Armstrong','Yuri Gagarin','John Glenn'], c: 1, e: 'Neil Armstrong 21 Temmuz 1969\'da Ay\'a ilk adımı attı.' },
  { q: 'Osmanlı\'nın en uzun süre hüküm süren padişahı kimdir?', a: ['Fatih Sultan Mehmet','Kanuni Sultan Süleyman','II. Abdülhamit','Yavuz Sultan Selim'], c: 1, e: 'Kanuni Sultan Süleyman 46 yıl (1520-1566) hüküm sürdü.' },
  { q: 'Birinci Dünya Savaşı\'nı başlatan suikast nerede gerçekleşti?', a: ['Viyana','Berlin','Saraybosna','Paris'], c: 2, e: 'Arşidük Franz Ferdinand, 28 Haziran 1914\'te Saraybosna\'da öldürüldü.' },
  { q: 'Romalılar arenada savaşanlara ne diyordu?', a: ['Centurion','Gladyatör','Legioner','Praetor'], c: 1, e: 'Gladyatörler Roma arenalarında seyirciler için savaşırdı.' },
  { q: 'Sanayi Devrimi hangi ülkede başladı?', a: ['Fransa','Almanya','ABD','İngiltere'], c: 3, e: 'Sanayi Devrimi 18. yüzyılda İngiltere\'de başladı.' },
  { q: 'Dünya\'da ilk kullanılan kağıt para hangi ülkededir?', a: ['Hindistan','Japonya','Çin','Mısır'], c: 2, e: 'Kağıt para 7. yüzyılda Tang Hanedanı döneminde Çin\'de icat edildi.' },
  { q: 'Napolyon\'un son sürgün yeri neresidir?', a: ['Elba Adası','Korsika','St. Helena Adası','Malta'], c: 2, e: 'Napolyon 1815\'ten ölümüne dek (1821) St. Helena Adası\'nda yaşadı.' },
  { q: 'Hangi medeniyet ilk 0 rakamını kullandı?', a: ['Mısırlılar','Romalılar','Mayalar','Aztekler'], c: 2, e: 'Maya medeniyeti MÖ\'den itibaren 0 kavramını matematiklerinde kullandı.' },
  { q: 'Rönesans hangi şehirde başladı?', a: ['Roma','Venedik','Floransa','Milano'], c: 2, e: 'Rönesans 14. yüzyılda Floransa\'da başladı.' },
  { q: 'Türkiye\'de ilk demiryolu ne zaman açıldı?', a: ['1856','1862','1868','1875'], c: 0, e: 'İlk Türk demiryolu 1856\'da İzmir-Aydın hattıyla hizmete girdi.' },
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
  { q: 'Dünyanın en küçük ülkesi hangisidir?', a: ['Monako','San Marino','Vatikan','Liechtenstein'], c: 2, e: 'Vatikan 0,44 km² ile dünyanın en küçük ülkesidir.' },
  { q: 'Amazon nehri hangi okyanusu döker?', a: ['Hint Okyanusu','Arktik','Atlas Okyanusu','Pasifik'], c: 2, e: 'Amazon nehri Atlas Okyanusu\'na dökülür.' },
  { q: 'Hangi kıtada çöl yoktur?', a: ['Asya','Afrika','Avrupa','Avustralya'], c: 2, e: 'Avrupa\'nın iklimi çöl oluşumuna uygun değildir.' },
  { q: 'İzlanda\'nın başkenti neresidir?', a: ['Bergen','Oslo','Reykjavik','Göteborg'], c: 2, e: 'Reykjavik dünyanın en kuzey başkentlerinden biridir.' },
  { q: 'Nil nehri hangi ülkede başlar?', a: ['Mısır','Sudan','Uganda/Ruanda','Etiyopya'], c: 2, e: 'Nil\'in kaynağı Ruanda-Uganda\'daki Viktorya Gölü\'dür.' },
  { q: 'Dünya\'nın en büyük çölü hangisidir?', a: ['Sahara','Gobi','Arabistan','Antarktika'], c: 3, e: 'Antarktika 14,2 milyon km² ile dünyanın en büyük soğuk çölüdür!' },
  { q: 'Türkiye\'nin en yüksek dağı hangisidir?', a: ['Erciyes','Süphan','Ağrı Dağı','Bolkar'], c: 2, e: 'Ağrı Dağı 5.137 m ile Türkiye\'nin en yüksek noktasıdır.' },
  { q: 'Pasifik Okyanusu kaç ülkenin kıyısına değer?', a: ['20','35','50','70+'], c: 3, e: 'Pasifik 70\'ten fazla ülkenin kıyısına değen en büyük okyanustur.' },
  { q: 'Japonya kaç adadan oluşur?', a: ['4','100','6.800+','1.200'], c: 2, e: 'Japonya yaklaşık 6.852 adadan oluşur, ancak sadece 430\'u nüfusludur.' },
  { q: 'Dünyanın en uzun karayolu tüneli hangisidir?', a: ['Gotthard Tüneli','Channel Tüneli','Laerdal Tüneli','Rokko Tüneli'], c: 2, e: 'Norveç\'teki Laerdal Tüneli 24,5 km uzunluğuyla dünya rekoru.' },
  { q: 'Hangi ülke 4 farklı saat dilimine sahiptir?', a: ['Rusya','ABD','Kanada','Brezilya'], c: 0, e: 'Yanlış! Rusya 11, ABD 6, Kanada 6, Brezilya 4 saat dilimine sahip.' },
  { q: 'Amazon Ormanı Dünya\'nın toplam oksijeninin ne kadarını üretir?', a: ['%10','%20','%50','%80'], c: 1, e: 'Amazon Ormanı Dünya\'nın yaklaşık %20\'sini sağlar.' },
  { q: 'Türkiye\'nin en batı noktası neresidir?', a: ['Edirne','Çanakkale','Gökçeada','Keşan'], c: 2, e: 'Gökçeada (İmroz), Türkiye\'nin en batı noktasıdır.' },
  { q: 'Ekvator hangi Afrika ülkesinin başkentinden geçer?', a: ['Kenya','Gabon','Ekvador','Kongo'], c: 0, e: 'Ekvator tam olarak Nairobi\'nin (Kenya) yakınından geçer.' },
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
  { q: 'Bir insan beyninin kaç nöronu vardır?', a: ['1 milyar','86 milyar','500 milyar','1 trilyon'], c: 1, e: 'İnsan beyninde yaklaşık 86 milyar nöron vardır.' },
  { q: 'Işık yılı bir zaman birimi midir?', a: ['Evet','Hayır — mesafe birimidir','İkisi de değil','Bağlama göre değişir'], c: 1, e: 'Işık yılı, ışığın bir yılda aldığı mesafedir — zaman değil mesafe birimi!' },
  { q: 'Elmas hangi elementten oluşur?', a: ['Silikon','Karbon','Azot','Oksijen'], c: 1, e: 'Elmas saf karbondan oluşur — grafit de karbon! Fark sadece atom düzenidir.' },
  { q: 'İnsan vücudundaki en uzun kemik hangisidir?', a: ['Kaburga','Omurga','Femur (uyluk kemiği)','Tibia'], c: 2, e: 'Femur (uyluk kemiği) vücudun en uzun ve en güçlü kemiğidir.' },
  { q: 'Güneş ne tür bir yıldızdır?', a: ['Kırmızı dev','Beyaz cüce','Sarı cüce','Nötron yıldızı'], c: 2, e: 'Güneş orta büyüklükte bir sarı cüce yıldızdır.' },
  { q: 'Ses boşlukta yayılabilir mi?', a: ['Evet','Hayır','Sadece bazı durumlarda','Belirsiz'], c: 1, e: 'Ses mekanik bir dalgadır, madde olmadan yayılamaz. Uzayda ses yoktur!' },
  { q: 'Hangi organ vücutta en fazla enerji tüketir?', a: ['Kalp','Beyin','Karaciğer','Kaslar'], c: 1, e: 'Beyin vücut ağırlığının %2\'si olmasına rağmen toplam enerjinin %20\'sini tüketir.' },
  { q: 'Ahtapot kanı hangi renktedir?', a: ['Kırmızı','Yeşil','Mavi','Sarı'], c: 2, e: 'Ahtapot kanı hemosiyinin (bakır içerir) nedeniyle mavimsi renktedir.' },
  { q: 'Karbon monoksit neden tehlikelidir?', a: ['Zehirlidir','Renksiz ve kokusuz olup O₂\'yi engeller','Patlar','Radyoaktiftir'], c: 1, e: 'CO renksiz ve kokusuzdur; hemoglobine oksijenden 200 kat daha güçlü bağlanır.' },
  { q: 'Hangi element en hafif metaldir?', a: ['Helyum','Lityum','Berilyum','Sodyum'], c: 1, e: 'Lityum en hafif metaldir; suya atıldığında yüzer.' },
  { q: 'Dünya\'nın çekirdeği ağırlıklı hangi elementten oluşur?', a: ['Taş','Demir-Nikel','Silikon','Magnezyum'], c: 1, e: 'Dünya\'nın iç çekirdeği büyük ölçüde katı demir-nikel karışımından oluşur.' },
  { q: 'Bir insan ömründe ortalama kaç litre nefes alır?', a: ['1.000 litre','100.000 litre','100 milyon litre','700 milyon litre'], c: 3, e: 'Ortalama bir insan ömründe yaklaşık 700 milyon litre hava soluması yapar.' },
  { q: 'Süpernova nedir?', a: ['Yeni doğan yıldız','Kara delik','Patlayan yıldız','Gezegen'], c: 2, e: 'Süpernova, büyük bir yıldızın ömrünün sonunda geçirdiği dev patlama.' },
  { q: 'DNA\'nın çift sarmal yapısını kim keşfetti?', a: ['Einstein','Watson ve Crick','Darwin','Mendel'], c: 1, e: 'Watson ve Crick 1953\'te DNA\'nın çift sarmal yapısını açıkladı.' },
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
  { q: 'Google\'ın ilk adı neydi?', a: ['SearchNow','BackRub','WebSearch','PageRank'], c: 1, e: 'Larry Page ve Sergey Brin projeyi 1996\'da "BackRub" adıyla başlattı.' },
  { q: 'Dünya\'da en çok konuşulan dil hangisidir?', a: ['İngilizce','Mandarin Çincesi','İspanyolca','Arapça'], c: 1, e: 'Ana dil olarak Mandarin Çincesi 1 milyar+ konuşanla birinci.' },
  { q: 'Bir "googol" kaçtır?', a: ['1.000.000','1 milyon milyon','10 üzeri 100','Sonsuz'], c: 2, e: '1 googol = 10 üzeri 100. Google adını buradan aldı.' },
  { q: 'İnsanlar gülmeden önce mi yoksa konuşmayı öğrenmeden önce mi güler?', a: ['Önce gülümser','Önce konuşur','İkisi aynı anda','Önce ağlar'], c: 0, e: 'Bebekler doğumdan itibaren gülümser, konuşmayı çok sonra öğrenir.' },
  { q: 'Hangi şirket "Think Different" sloganını kullandı?', a: ['Microsoft','Samsung','Apple','Google'], c: 2, e: 'Apple\'ın ikonik "Think Different" kampanyası 1997-2002 yılları arasındaydı.' },
  { q: '"Selfie" Oxford sözlüğüne hangi yılda girdi?', a: ['2010','2011','2012','2013'], c: 3, e: '"Selfie" 2013\'te Oxford sözlüğüne "yılın kelimesi" olarak girdi.' },
  { q: 'En çok dili olan ülke hangisidir?', a: ['Hindistan','Çin','Papua Yeni Gine','Nijerya'], c: 2, e: 'Papua Yeni Gine\'de 800\'den fazla farklı dil konuşulur.' },
  { q: 'Dünyanın ilk reklamı nerede bulundu?', a: ['Roma\'da papirüs','Mısır\'da papirüs','Çin\'de tahta levha','Yunanistan\'da taş'], c: 1, e: 'Dünyanın bilinen ilk reklamı 3.000 yıllık Mısır papirüsünde kaçak köle aramasıdır.' },
  { q: 'Hangi ülkede sağ elle yemek yemek kabalık sayılır?', a: ['Japonya','Hindistan','Suudi Arabistan','Mısır'], c: 0, e: 'Japonya\'da yemekte sol el veya sağ el fark etmez ama yere eğilmek önemlidir. Aslında Hindistan\'da sağ el kullanımı terbiye!' },
  { q: 'Çikolata ilk olarak hangi biçimde tüketildi?', a: ['Katı tablet','Sıcak içecek','Dondurma','Kek'], c: 1, e: 'Aztekler çikolatayı "xocoatl" adıyla acı, baharatlı sıcak içecek olarak içerdi.' },
  { q: 'Hangi oyun 1989\'da Game Boy ile birlikte çıktı?', a: ['Super Mario','Zelda','Tetris','Donkey Kong'], c: 2, e: 'Tetris Nintendo Game Boy\'un çıkış oyunuydu ve milyonlarca satış yaptı.' },
  { q: 'Papaganlar gerçekten konuşur mu?', a: ['Evet, anlayarak','Hayır, taklit eder','Bazıları anlar','Bilinmiyor'], c: 1, e: 'Papağanlar sesleri taklit eder, anlamını kavramaz. Ancak bazı çalışmalar limited anlama işaret ediyor.' },
  { q: 'Hangi şehir en fazla Michelin yıldızlı restorana sahiptir?', a: ['Paris','Tokyo','New York','Londra'], c: 1, e: 'Tokyo 230+ Michelin yıldızlı restoranıyla dünyanın gastronomi başkentidir.' },
  { q: 'Dünya\'nın en çok üretilen içeceği nedir?', a: ['Kola','Çay','Su','Kahve'], c: 2, e: 'Su tartışmasız en çok üretilen ve tüketilen içecektir.' },
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
  { q: 'Türkiye\'de en çok hangi renk araba tercih edilir?', a: ['Siyah','Beyaz','Gri','Kırmızı'], c: 1, e: 'Türkiye\'de beyaz araç satışları yıllardır 1. sırada.' },
  { q: 'Türkçede "Sıklet" kelimesinin gerçek anlamı nedir?', a: ['Sıkıntı','Ağırlık','Yük','Stres'], c: 1, e: '"Sıklet" Türkçede ağırlık, külfet anlamına gelir.' },
  { q: 'Türkiye\'nin en uzun nehri hangisidir?', a: ['Fırat','Dicle','Kızılırmak','Sakarya'], c: 2, e: 'Kızılırmak ~1.355 km ile Türkiye\'nin en uzun nehridir.' },
  { q: 'Türk bayrağındaki ay ve yıldız hangi renge sahiptir?', a: ['Sarı','Gümüş','Beyaz','Altın'], c: 2, e: 'Türk bayrağında kırmızı zemin üzerine beyaz ay yıldız bulunur.' },
  { q: 'İzmir\'in eski adı nedir?', a: ['Efes','Smyrna','Pergamon','Sardis'], c: 1, e: 'İzmir\'in eski adı Smyrna\'dır. MÖ 3000\'li yıllara kadar uzanır.' },
  { q: 'Türkiye\'de en çok hangi meyve yetiştirilir?', a: ['Portakal','Elma','Üzüm','Fındık'], c: 2, e: 'Türkiye üzüm üretiminde dünya genelinde ilk sıralar arasındadır.' },
  { q: 'Türk kahvesi UNESCO listesine hangi yılda girdi?', a: ['2010','2013','2015','2017'], c: 1, e: 'Türk kahvesi kültürü 2013\'te UNESCO somut olmayan kültürel miras listesine girdi.' },
  { q: 'Türkiye\'nin en büyük alışveriş merkezi hangisidir?', a: ['CevahirAVM','Mall of Istanbul','Metropol AVM','Forum İstanbul'], c: 0, e: 'Cevahir AVM 420.000 m² ile Türkiye\'nin en büyük alışveriş merkezidir.' },
  { q: '"Mavi Boncuk" Türkiye\'de ne amaçla kullanılır?', a: ['Süs eşyası','Nazardan korunmak','Şans getirsin','Hepsi'], c: 3, e: 'Nazar boncuğu hem nazardan korunmak için hem süs hem şans için kullanılır.' },
  { q: 'Türkiye\'de kaç tane büyük şehir (büyükşehir) var?', a: ['16','22','30','81'], c: 2, e: 'Türkiye\'de 30 büyükşehir belediyesi bulunmaktadır.' },
  { q: 'Türkiye\'nin en uzun sahil şeridine sahip ili hangisidir?', a: ['Antalya','İzmir','Muğla','İçel/Mersin'], c: 2, e: 'Muğla en uzun kıyı şeridine sahip ildir — körfezleri dahil 1.167 km.' },
  { q: 'Türkiye hangi yıl NATO\'ya girdi?', a: ['1945','1949','1952','1960'], c: 2, e: 'Türkiye ve Yunanistan 1952\'de NATO\'ya katıldı.' },
  { q: 'Boğaz köprüsü inşaatı hangi yılda tamamlandı?', a: ['1969','1973','1978','1982'], c: 1, e: 'Boğaziçi Köprüsü 1973\'te açıldı, Cumhuriyet\'in 50. yılına armağan edildi.' },
  { q: 'Türkiye\'nin en yüksek rakımlı şehri hangisidir?', a: ['Erzurum','Kars','Van','Ağrı'], c: 0, e: 'Erzurum ~1.890 m rakımıyla Türkiye\'nin en yüksek şehirleri arasındadır.' },
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

const sports: ServerQuestion[] = [
  { q: 'Dünya Kupası\'nı en çok kazanan ülke hangisidir?', a: ['Almanya','Arjantin','Brezilya','İtalya'], c: 2, e: 'Brezilya 5 kez (1958,1962,1970,1994,2002) Dünya Kupası şampiyonu.' },
  { q: 'Olimpiyatlarda en fazla altın madalya kazanan sporcu kimdir?', a: ['Usain Bolt','Larisa Latynina','Michael Phelps','Mark Spitz'], c: 2, e: 'Michael Phelps 23 olimpik altın madalyayla rekor sahibi.' },
  { q: 'Tenis\'te "Grand Slam" kaç turnuvayı kapsar?', a: ['2','3','4','5'], c: 2, e: 'Wimbledon, US Open, Avustralya ve Fransa Açık — 4 turnuva.' },
  { q: 'Maraton koşusu kaç km\'dir?', a: ['40','41,2','42,195','43'], c: 2, e: 'Maraton tam olarak 42,195 km\'dir. 1908 Londra Olimpiyatları\'ndan bu yana standart.' },
  { q: 'NBA\'de en fazla şampiyonluk hangi takıma aittir?', a: ['Los Angeles Lakers','Chicago Bulls','Boston Celtics','Golden State Warriors'], c: 2, e: 'Boston Celtics 17 şampiyonlukla NBA rekoru.' },
  { q: 'Dünyanın en değerli futbol kulübü hangisidir?', a: ['Barcelona','Real Madrid','Manchester United','Manchester City'], c: 1, e: 'Real Madrid 6 milyar dolar+ değeriyle sürekli üst sıralarda.' },
  { q: 'Fenerbahçe kaç kez şampiyon olmuştur? (yaklaşık)', a: ['19','25','28','30'], c: 1, e: 'Fenerbahçe yaklaşık 19-20 Türkiye Ligi şampiyonluğuna sahip.' },
  { q: 'Galatasaray UEFA Kupası\'nı hangi yılda kazandı?', a: ['1998','1999','2000','2001'], c: 2, e: 'Galatasaray 2000\'de UEFA Kupası ve Süper Kupa\'yı kazandı.' },
  { q: 'Formula 1\'de en fazla şampiyonluk hangi pilota aittir?', a: ['Michael Schumacher','Ayrton Senna','Lewis Hamilton','Sebastian Vettel'], c: 2, e: 'Lewis Hamilton 7 şampiyonlukla Michael Schumacher ile rekoru paylaşıyor.' },
  { q: 'Hangi spor "güzel oyun" olarak anılır?', a: ['Tenis','Basketbol','Futbol','Kriket'], c: 2, e: 'Futbol "the beautiful game" — güzel oyun olarak anılır.' },
  { q: 'Dünya\'nın en büyük stadyumu hangisidir?', a: ['Wembley','Camp Nou','Rungrado Stadyumu','Melbourne Cricket Ground'], c: 2, e: 'Kuzey Kore\'deki Rungrado Stadyumu 114.000 kapasiteyle dünya birincisi.' },
  { q: 'Bir basketbol maçı kaç bölümden oluşur?', a: ['2 devre','3 periyot','4 çeyrek','5 set'], c: 2, e: 'NBA maçları 4 çeyrekten oluşur, her çeyrek 12 dakika.' },
  { q: 'Hangi Türk sporcu dünya boks şampiyonu olmuştur?', a: ['Sinan Şamil Sam','Süreyya Ayhan','Naim Süleymanoğlu','Hüseyin Özbilge'], c: 0, e: 'Sinan Şamil Sam WBA süper ağır siklet dünya şampiyonluğu kazandı.' },
  { q: 'Naim Süleymanoğlu kaç olimpiyat altın madalyası aldı?', a: ['1','2','3','4'], c: 2, e: 'Naim Süleymanoğlu 1988, 1992 ve 1996 olimpiyatlarında altın aldı.' },
  { q: 'Tenis\'te "ace" ne demektir?', a: ['Çift hata','Doğrudan kazanılan servis','Set kazanımı','Net engeli'], c: 1, e: '"Ace" karşı oyuncunun raket sürtmeden kazanılan servis.' },
];

const cinema: ServerQuestion[] = [
  { q: 'Titanic filminde "Jack" karakterini kim oynuyor?', a: ['Brad Pitt','Johnny Depp','Leonardo DiCaprio','Tom Hanks'], c: 2, e: 'Leonardo DiCaprio Jack Dawson rolünü 1997\'de oynadı.' },
  { q: '"The Dark Knight"te Joker\'i kim oynuyor?', a: ['Joaquin Phoenix','Jared Leto','Heath Ledger','Jack Nicholson'], c: 2, e: 'Heath Ledger bu roldeki performansıyla ölümünden sonra Oscar aldı.' },
  { q: 'Türkiye\'nin Oscar\'a aday olan ilk filmi hangisidir?', a: ['Yol','Kuyucaklı Yusuf','Geceleri Beklerim','Duvar'], c: 0, e: '"Yol" (Yılmaz Güney, 1982) Türkiye\'nin Oscar\'a aday olan ilk filmi.' },
  { q: 'Avatar filmi kaç Oscar kazandı?', a: ['0','3','6','9'], c: 1, e: 'Avatar (2009) görsel efektler, sinematografi ve sanat yönetimi için 3 Oscar aldı.' },
  { q: 'En uzun soluklu James Bond aktörü kimdir?', a: ['Sean Connery','Roger Moore','Pierce Brosnan','Daniel Craig'], c: 1, e: 'Roger Moore 7 filmle en fazla Bond rolünü üstlenen aktör.' },
  { q: '"Schindler\'s List" filminin yönetmeni kimdir?', a: ['Martin Scorsese','Stanley Kubrick','Steven Spielberg','Francis Ford Coppola'], c: 2, e: 'Steven Spielberg bu filmle 1994\'te En İyi Yönetmen Oscar\'ı aldı.' },
  { q: 'Disney\'in en çok hasılat yapan animasyonu hangisidir?', a: ['Aslan Kral','Dondurulmuş','Coco','Moana'], c: 1, e: 'Dondurulmuş (Frozen) 2013\'te yaklaşık 1,3 milyar dolar hasılat yaptı.' },
  { q: 'Sinema tarihinin en pahalı filmi hangisidir?', a: ['Avengers','Avatar','Pirates of Caribbean 3','Star Wars'], c: 0, e: 'Avengers: Age of Ultron ve Pirates 3 bu yarışta öne çıkıyor, bazı tahminlere göre Avatar 2.' },
  { q: 'Türkiye\'de yılda kaç film çekilir? (yaklaşık)', a: ['50','100','200+','500+'], c: 2, e: 'Türkiye yılda 200\'den fazla film üreterek dünyada üst sıralarda.' },
  { q: '"Kaybedenler Kulübü" filminin başrolünde kim oynuyor?', a: ['Şahan Gökbakar','Cem Yılmaz','Murat Boz','Kıvanç Tatlıtuğ'], c: 1, e: 'Cem Yılmaz bu filmde başrolü üstlendi.' },
  { q: 'En fazla Oscar kazanan film hangisidir?', a: ['Titanic','Ben-Hur','Lord of the Rings: ROTK','Schindler\'s List'], c: 2, e: '"Return of the King", Titanic ve Ben-Hur ile birlikte 11 Oscar\'la rekor paylaşıyor.' },
  { q: 'Netflix\'in ilk orijinal dizisi hangisidir?', a: ['Orange is the New Black','House of Cards','Stranger Things','Narcos'], c: 1, e: '"House of Cards" 2013\'te Netflix\'in ilk orijinal yapımı oldu.' },
  { q: '"Inception" filminin yönetmeni kimdir?', a: ['Ridley Scott','James Cameron','Christopher Nolan','Denis Villeneuve'], c: 2, e: 'Christopher Nolan 2010 yapımı Inception\'ı yönetti.' },
  { q: 'Hangi Türk dizi dünya genelinde en fazla izlendi?', a: ['Kuzey Yıldızı','Diriliş Ertuğrul','Magnificent Century','Çukur'], c: 1, e: 'Diriliş Ertuğrul 150+ ülkede izlenerek Türk dizilerinin rekorunu kırdı.' },
  { q: 'Oscar töreninin resmi adı nedir?', a: ['Golden Globe','Academy Awards','BAFTA','Cannes'], c: 1, e: 'Oscar\'ın resmi adı "Academy Awards" — Akademi Ödülleri.' },
];

const economy: ServerQuestion[] = [
  { q: 'Dünyanın en büyük ekonomisi hangisidir?', a: ['Çin','Japonya','ABD','Almanya'], c: 2, e: 'ABD nominal GSYİH\'de 25+ trilyon dolarla dünya birincisi.' },
  { q: 'Bitcoin\'i kim yarattı?', a: ['Elon Musk','Mark Zuckerberg','Satoshi Nakamoto','Vitalik Buterin'], c: 2, e: 'Bitcoin\'in mimarı "Satoshi Nakamoto" takma adlı bilinmeyen kişi/gruptur.' },
  { q: 'Türkiye\'nin GSYİH büyüklüğü sıralaması yaklaşık kaçıncıdır?', a: ['10','15','17','25'], c: 2, e: 'Türkiye yaklaşık 900 milyar dolar GSYİH ile dünya 17. ekonomisi.' },
  { q: 'Enflasyon ne anlama gelir?', a: ['Para değer kazanır','Fiyatlar genel olarak artar','İşsizlik artar','Faiz düşer'], c: 1, e: 'Enflasyon fiyatlar genel seviyesinin artmasıdır.' },
  { q: '"Wall Street" hangi şehirdedir?', a: ['Chicago','Los Angeles','Boston','New York'], c: 3, e: 'Wall Street New York\'taki Manhattan\'da bulunur — finans dünyasının merkezi.' },
  { q: 'Türk Lirası sembolü nedir?', a: ['₺','₼','₸','₽'], c: 0, e: 'Türk Lirası\'nın sembolü ₺\'dir. 2012\'de resmi olarak belirlendi.' },
  { q: 'Dünyanın en pahalı şehirlerinden biri olan Singapur hangi kıtadadır?', a: ['Asya','Okyanusya','Afrika','Güney Amerika'], c: 0, e: 'Singapur Güneydoğu Asya\'da ada ülkesi ve finansal merkezdir.' },
  { q: 'Amazon şirketi yıllık ne kadar ciro yapar? (yaklaşık)', a: ['100 milyar $','300 milyar $','500+ milyar $','1 trilyon $'], c: 2, e: 'Amazon 2022\'de 514 milyar dolar gelir elde etti.' },
  { q: 'Türkiye\'de merkez bankasının adı nedir?', a: ['BDDK','SPK','TCMB','Ziraat Bankası'], c: 2, e: 'Türkiye Cumhuriyet Merkez Bankası (TCMB) para politikasını yürütür.' },
  { q: 'Dünyanın en zengin insanı (tarihsel) kimdir?', a: ['Elon Musk','Jeff Bezos','Rockefeller','Mansa Musa'], c: 3, e: 'Mali İmparatoru Mansa Musa (1280-1337) enflasyona göre tarihin en zengin insanı.' },
  { q: 'Kripto para birimleri nasıl üretilir?', a: ['Devlet basar','Madencilik (mining)','Bankalar üretir','Satın alma'], c: 1, e: 'Bitcoin gibi kripto paralar "mining" denilen hesaplama yoluyla üretilir.' },
  { q: 'Türkiye\'nin en büyük ihracat kalemi nedir?', a: ['Tekstil','Otomotiv','Tarım ürünleri','Demir-çelik'], c: 1, e: 'Otomotiv sektörü yıllardır Türkiye\'nin en büyük ihracat kalemi.' },
  { q: 'Dünya Bankası hangi şehirde merkezlidir?', a: ['New York','Brüksel','Washington D.C.','Cenevre'], c: 2, e: 'Dünya Bankası\'nın genel merkezi Washington D.C.\'dedir.' },
  { q: 'Faiz oranı yükselince ne olur?', a: ['Kredi ucuzlar','Borçlanma azalır','Enflasyon artar','Para değer kaybeder'], c: 1, e: 'Yüksek faiz borçlanmayı pahalılaştırır, tüketim ve yatırım azalır.' },
  { q: 'Hangi ülke dünyada en fazla altın rezervine sahiptir?', a: ['Çin','Rusya','Almanya','ABD'], c: 3, e: 'ABD 8.133 ton altınla dünya altın rezervi sıralamasında birinci.' },
];

export const QUESTION_POOLS: Record<string, ServerQuestion[]> = {
  history,
  geography,
  science,
  general,
  turkey,
  fun,
  sports,
  cinema,
  economy,
  art:     general,
  kids:    general,
  license: general,
  medical: science,
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
