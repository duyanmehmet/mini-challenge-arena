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

export const QUESTION_POOLS: Record<string, ServerQuestion[]> = {
  history,
  geography,
  science,
  general,
  turkey,
  art:       general,  // fallback
  cinema:    general,
  sports:    general,
  kids:      general,
  license:   general,
  medical:   science,
  economy:   general,
};

/** Seed'e göre deterministik soru seçimi — aynı seed = aynı sorular */
export function getSeedQuestions(category: string, seed: number, count = 10): ServerQuestion[] {
  const pool = QUESTION_POOLS[category] ?? general;
  const shuffled = [...pool].sort((a, b) => {
    const ha = hashCode(`${seed}-${a.q}`);
    const hb = hashCode(`${seed}-${b.q}`);
    return ha - hb;
  });
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
