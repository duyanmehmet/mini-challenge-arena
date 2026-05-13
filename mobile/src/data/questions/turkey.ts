import type { QuizQuestion } from '../../types/quiz';

const questions: QuizQuestion[] = [
  // Türk mutfağı
  { q: 'Türkiye\'nin en çok tüketilen sebzesi hangisidir?', a: ['Patlıcan', 'Domates', 'Biber', 'Soğan'], c: 1 },
  { q: 'Adana kebabı hangi şehre aittir?', a: ['Gaziantep', 'Adana', 'Mersin', 'Hatay'], c: 1 },
  { q: 'İskender kebabı hangi şehre aittir?', a: ['İstanbul', 'Ankara', 'Bursa', 'İzmir'], c: 2 },
  { q: 'Türk kahvesinin köpüğü nasıl oluşur?', a: ['Süt eklenerek', 'Kaynatma sırasında karıştırılmadan', 'Şeker eklenerek', 'Özel makine ile'], c: 1 },
  { q: 'Türkiye\'de en çok hangi çay tüketilir?', a: ['Yeşil çay', 'Bitki çayı', 'Siyah çay', 'Beyaz çay'], c: 2 },
  { q: '"Mantı" hangi şehrin meşhur yemeğidir?', a: ['Konya', 'Kayseri', 'Sivas', 'Erzurum'], c: 1 },
  { q: 'Türkiye\'de ramazan ayında en çok tüketilen tatlı hangisidir?', a: ['Baklava', 'Kadayıf', 'Güllaç', 'Sütlaç'], c: 2 },
  { q: 'Türk kahvesini diğer kahvelerden ayıran en temel özellik nedir?', a: ['Soğuk servis edilir', 'Telvesiyle içilir', 'Sütsüz yapılır', 'Elektrikli makineyle yapılır'], c: 1 },
  { q: 'Gaziantep hangi yiyeceğiyle dünyaca ünlüdür?', a: ['Döner', 'Baklava', 'Lahmacun', 'Kebap'], c: 1 },
  { q: '"Çiğ köfte" günümüzde hangi malzeme olmadan yapılır?', a: ['Bulgur', 'Et', 'Soğan', 'Domates salçası'], c: 1 },
  { q: 'Türkiye\'de "lokanta" ne anlama gelir?', a: ['Pastane', 'Ucuz ev yemeği restoranı', 'Fast food zinciri', 'Kahvehane'], c: 1 },
  { q: 'Türk pidesi ile İtalyan pizzası arasındaki temel fark nedir?', a: ['Malzemeleri', 'Pidenin ortası açık, pizza kapalıdır', 'Pide yuvarlak değildir', 'Pizza mayasız yapılır'], c: 2 },

  // Türk sineması & TV
  { q: '"Recep İvedik" filmlerinin yönetmeni kimdir?', a: ['Cem Yılmaz', 'Şahan Gökbakar', 'Yılmaz Erdoğan', 'Tolga Çevik'], c: 1 },
  { q: 'Türkiye\'nin en uzun soluklu komedi dizisi hangisidir?', a: ['Çukur', 'Diriliş: Ertuğrul', 'Leyla ile Mecnun', 'Güldür Güldür Show'], c: 3 },
  { q: 'Türk sinemasının babası sayılan yönetmen kimdir?', a: ['Yılmaz Güney', 'Ömer Lütfi Akad', 'Memduh Ün', 'Lütfi Akad'], c: 1 },
  { q: '"Dizi" kelimesi Türkçe\'de ne anlama gelir?', a: ['Film', 'Televizyon', 'Seri (TV dizisi)', 'Belgesel'], c: 2 },
  { q: 'Yılmaz Güney\'in en ünlü filmi hangisidir?', a: ['Sürü', 'Umut', 'Yol', 'Endişe'], c: 2 },
  { q: '"Diriliş: Ertuğrul" dizisi hangi dönemi anlatır?', a: ['Osmanlı dönemi', 'Selçuklu dönemi', 'Cumhuriyet dönemi', 'Bizans dönemi'], c: 1 },
  { q: 'Türk dizilerinin en büyük ihracat pazarı 2020\'de hangi ülkeydi?', a: ['Almanya', 'Yunanistan', 'Arjantin', 'Suudi Arabistan'], c: 2 },
  { q: '"Ezel" dizisinde başrolu kim oynamıştır?', a: ['Kıvanç Tatlıtuğ', 'Çağatay Ulusoy', 'Can Yaman', 'Barış Arduç'], c: 0 },

  // Türk müziği & kültürü
  { q: 'Türk halk müziğinin vazgeçilmez çalgısı hangisidir?', a: ['Kemence', 'Bağlama (Saz)', 'Ud', 'Kanun'], c: 1 },
  { q: '"Arabesque" müzik türü Türkiye\'de hangi dönemde popüler oldu?', a: ['1950\'ler', '1960\'lar', '1970-80\'ler', '1990\'lar'], c: 2 },
  { q: 'İbrahim Tatlıses hangi şehirden?', a: ['Diyarbakır', 'Gaziantep', 'Adana', 'Şanlıurfa'], c: 3 },
  { q: 'Barış Manço hangi şehirde doğdu?', a: ['İstanbul', 'Bursa', 'Ankara', 'İzmir'], c: 1 },
  { q: 'Zeki Müren\'in lakabı nedir?', a: ['Sanat Güneşi', 'Ses Sultanı', 'Sahne Kralı', 'Türk Sinatras\'ı'], c: 0 },
  { q: '"Kafadan Kontak" televizyon programı hangi kanalda yayınlandı?', a: ['TRT1', 'Show TV', 'ATV', 'Star TV'], c: 0 },
  { q: 'Türkiye\'de "kahvehane kültürü" tarihsel olarak ne zaman başladı?', a: ['Osmanlı döneminde 16. yüzyılda', '17. yüzyılda', 'Cumhuriyet döneminde', 'Tanzimat döneminde'], c: 0 },

  // Türk sporu
  { q: 'Türkiye\'nin en başarılı olimpiyat branşı hangisidir?', a: ['Futbol', 'Güreş', 'Halter', 'Atletizm'], c: 1 },
  { q: 'Hakan Şükür kaç yıl Milli takımda forma giydi?', a: ['8', '12', '15', '10'], c: 1 },
  { q: 'Türkiye\'de "Kırkpınar" ne tür bir yarışmadır?', a: ['At yarışı', 'Yağlı güreş', 'Ok atma', 'Cirit'], c: 1 },
  { q: 'Galatasaray\'ın stadyumunun adı nedir?', a: ['Atatürk Olimpiyat Stadı', 'RAMS Park (Nef Stadyumu)', 'Vodafone Park', 'Türk Telekom Arena'], c: 1 },
  { q: 'Türkiye\'nin 2002 Dünya Kupası\'nda aldığı derece hangisidir?', a: ['İkinci', 'Üçüncü', 'Dördüncü', 'Çeyrek final'], c: 1 },
  { q: '"Naim Süleymanoğlu" hangi sporla uğraşmıştır?', a: ['Güreş', 'Boks', 'Halter', 'Judo'], c: 2 },
  { q: 'Türkiye\'de en çok taraftarı olan futbol kulübü hangisidir?', a: ['Beşiktaş', 'Galatasaray', 'Fenerbahçe', 'Trabzonspor'], c: 2 },
  { q: '"Fenerbahçe" adının anlamı nedir?', a: ['Sarı fener', 'Fener bahçesi', 'Deniz feneri', 'Balık avı yeri'], c: 1 },

  // Türk tarihi (yerel)
  { q: 'Atatürk hangi şehirde doğdu?', a: ['İstanbul', 'Ankara', 'Selanik (bugün Yunanistan\'da)', 'İzmir'], c: 2 },
  { q: 'Türkiye Cumhuriyeti\'nin ilk Başbakanı kimdir?', a: ['Atatürk', 'İsmet İnönü', 'Adnan Menderes', 'Celal Bayar'], c: 1 },
  { q: 'Osmanlı\'da "Harem" ne anlama gelir?', a: ['Padişahın çalışma odası', 'Yasak bölge — kadınların yaşadığı özel alan', 'Divan toplantı odası', 'Şehzadelerin eğitim yeri'], c: 1 },
  { q: '"Topkapı Sarayı" kaç yüzyıl Osmanlı\'ya hizmet etti?', a: ['2', '3', '4', '5'], c: 2 },
  { q: 'Türkiye\'de İlk nüfus sayımı hangi yılda yapıldı?', a: ['1923', '1927', '1935', '1940'], c: 1 },
  { q: 'Atatürk\'ün "Nutuk" adlı eseri neyi anlatır?', a: ['Osmanlı tarihini', 'Kurtuluş Savaşı ve Cumhuriyet\'in kuruluş sürecini', 'Türk kültürünü', 'Ekonomik reformları'], c: 1 },
  { q: 'İstanbul\'un fethinde Osmanlı\'nın kullandığı en önemli silah neydi?', a: ['Oklar', 'Dev toplar (Şahi topu)', 'Süvariler', 'Deniz kuvvetleri'], c: 1 },
  { q: 'Türkiye\'de laiklik ilkesi Anayasa\'ya hangi yılda girdi?', a: ['1923', '1928', '1937', '1945'], c: 2 },

  // Türk şehirleri & coğrafya
  { q: 'Türkiye\'nin en kalabalık ikinci şehri hangisidir?', a: ['İzmir', 'Ankara', 'Bursa', 'Gaziantep'], c: 1 },
  { q: 'Kapadokya hangi ilde yer alır?', a: ['Konya', 'Kayseri', 'Nevşehir', 'Aksaray'], c: 2 },
  { q: 'Türkiye\'nin en uzun kıyı şeridine sahip ili hangisidir?', a: ['İzmir', 'Muğla', 'Antalya', 'Mersin'], c: 3 },
  { q: 'Mardin hangi bölgede yer alır?', a: ['Ege', 'İç Anadolu', 'Karadeniz', 'Güneydoğu Anadolu'], c: 3 },
  { q: 'Türkiye\'nin en doğu sınır kapısı hangisidir?', a: ['Habur', 'Gürbulak', 'Dilucu', 'Esendere'], c: 2 },
  { q: 'Türkiye\'de "Nemrut Dağı" hangi ilde yer alır?', a: ['Van', 'Ağrı', 'Adıyaman', 'Batman'], c: 2 },
  { q: 'Türkiye\'nin en büyük Milli Parkı hangisidir?', a: ['Yozgat Camili', 'Kaçkar Dağları', 'Köprülü Kanyon', 'Tunceli Munzur'], c: 3 },

  // Gündelik Türk yaşamı
  { q: 'Türkiye\'de "pazar" hangi gün kurulur?', a: ['Her gün', 'Sadece Pazar günleri', 'Haftanın farklı günleri mahalle bazlı', 'Yalnızca hafta sonları'], c: 2 },
  { q: 'Türkiye\'de çay bardağının özel şekli nasıldır?', a: ['Yuvarlak', 'Kare', 'İnce belli (lale şeklinde)', 'Kulplu büyük'], c: 2 },
  { q: '"Geçmiş olsun" ne zaman söylenir?', a: ['Doğum günlerinde', 'Bayramlarda', 'Hastalık veya zor durumda', 'Vedalaşırken'], c: 2 },
  { q: 'Türkiye\'de "rakı" ne ile içilir?', a: ['Meyve suyu', 'Su (balık ve meze eşliğinde)', 'Buz ve şeker', 'Kola'], c: 1 },
  { q: '"Nazar boncuğu" neden takılır?', a: ['Süs amaçlı', 'Nazardan korumak için', 'Şans getirsin diye', 'Dini bir zorunluluk'], c: 1 },
  { q: 'Türkiye\'de "bayram harçlığı" ne zaman verilir?', a: ['Yılbaşında', 'Dini bayramlarda', 'Okul başlangıcında', 'Doğum günlerinde'], c: 1 },
  { q: 'Türkiye\'de "kapıcı" apartmanlarda ne iş yapar?', a: ['Sadece kapı açar', 'Bina bakımı, temizlik ve güvenlik', 'Posta dağıtır', 'Güvenlik görevlisi'], c: 1 },
  { q: '"Helva haşlanır" deyimi ne anlama gelir?', a: ['Gerçek anlamıyla helva yapılır', 'Ölüm ya da kayıp sonrası komşulara helva dağıtılır', 'Başarı kutlaması yapılır', 'Düğün geleneği'], c: 1 },

  // Türk ekonomisi & markalar
  { q: 'Türkiye\'nin en büyük ihracat kalemi hangisidir?', a: ['Tarım ürünleri', 'Otomotiv ve yan sanayi', 'Tekstil', 'Turizm'], c: 1 },
  { q: 'Türkiye\'nin en tanınmış uluslararası gıda markası hangisidir?', a: ['Ulker', 'Eti', 'Ülker\'in sahibi Yıldız Holding', 'Koç Holding'], c: 2 },
  { q: 'TOGG nedir?', a: ['Bir futbol kulübü', 'Türkiye\'nin yerli otomobili', 'Bir teknoloji şirketi', 'Bir devlet bankası'], c: 1 },
  { q: 'Türkiye\'nin en büyük ticaret partneri hangisidir?', a: ['ABD', 'Rusya', 'Almanya', 'Çin'], c: 2 },
  { q: 'İstanbul Havalimanı dünyanın kaçıncı büyük havalimanıdır?', a: ['3.', '5.', '8.', '10.'], c: 0 },

  // Türk toplumu
  { q: 'Türkiye\'de ortalama hane halkı büyüklüğü kaç kişidir? (yaklaşık)', a: ['2', '3', '3.5', '5'], c: 2 },
  { q: 'Türkiye\'nin en kalabalık yaş grubu hangisidir?', a: ['0-14 yaş', '15-34 yaş', '35-54 yaş', '55+ yaş'], c: 1 },
  { q: '"Askerlik" Türkiye\'de kimler için zorunludur?', a: ['Herkes', 'Yalnızca erkekler', 'Yalnızca gönüllüler', 'Devlet memurları'], c: 1 },
  { q: 'Türkiye\'de üniversite sınavının adı nedir?', a: ['LGS', 'YKS (YGS/LYS)', 'ÖSYS', 'ÜNİSAV'], c: 1 },
  { q: 'Türkiye\'de ilkokul kaç yıldır?', a: ['4', '5', '6', '8'], c: 0 },
  { q: 'Türk bayrağındaki ay ve yıldız simgeleri ne zaman standartlaştırıldı?', a: ['1844', '1923', '1936', '1952'], c: 0 },

  // Türkiye\'ye özgü ilginç bilgiler
  { q: 'Dünya\'da en fazla çay tüketen ülkeler arasında Türkiye kaçıncıdır?', a: ['5.', '3.', '2.', '1.'], c: 0 },
  { q: '"Türkiye" adının kökeni nedir?', a: ['Türk Yurdu', 'Türklerin ülkesi', 'Batı dillerinden gelen "Türk toprakları"', 'Osmanlıca kökenli'], c: 2 },
  { q: 'Türkiye\'nin UNESCO Dünya Mirası listesinde kaç alanı var? (yaklaşık)', a: ['6', '10', '19', '25'], c: 2 },
  { q: 'Türkiye hangi iki kıtada toprak sahibidir?', a: ['Asya-Afrika', 'Avrupa-Asya', 'Avrupa-Afrika', 'Asya-Amerika'], c: 1 },
  { q: 'İstanbul dünyanın tek şehri olarak hangi özelliğe sahiptir?', a: ['En kalabalık', 'İki kıtaya yayılmış', 'En eski', 'En büyük'], c: 1 },
  { q: 'Türkiye\'de saat dilimleri kaç tanedir?', a: ['1', '2', '3', '4'], c: 0 },
  { q: 'Türkiye hangi ülkeden sonra dünyanın 2. büyük fındık üreticisidir?', a: ['İtalya', 'Almanya', 'Türkiye 1. sırada', 'ABD'], c: 2 },
  { q: 'Türk hamam geleneği kaç yüzyıllık bir geçmişe sahiptir?', a: ['3', '5', '7', '10'], c: 2 },
  { q: 'Türkiye\'nin hangi şehri "Türkiye\'nin mutfağı" olarak bilinir?', a: ['İstanbul', 'Adana', 'Gaziantep', 'Konya'], c: 2 },
  { q: '"Gastronomi şehri" unvanını UNESCO\'dan alan ilk Türk şehri hangisidir?', a: ['İstanbul', 'Adana', 'Gaziantep', 'Hatay'], c: 2 },
];

export default questions;
