import type { QuizQuestion } from '../../types/quiz';

const questions: QuizQuestion[] = [
  { q: 'Türkiye\'nin başkenti neresidir?', a: ['İstanbul', 'Ankara', 'İzmir', 'Bursa'], c: 1, e: 'Ankara, 1923\'te Atatürk tarafından başkent seçildi. Anadolu\'nun merkezindeki konumu ve stratejik önemi belirleyici oldu.' },
  { q: 'Türkiye\'nin en uzun nehri hangisidir?', a: ['Fırat', 'Dicle', 'Kızılırmak', 'Sakarya'], c: 2, e: 'Kızılırmak, 1355 km uzunluğuyla Türkiye\'nin en uzun nehridir. Orta Anadolu\'dan Karadeniz\'e dökülür.' },
  { q: 'Türkiye\'nin en yüksek dağı hangisidir?', a: ['Erciyes', 'Uludağ', 'Ağrı Dağı', 'Süphan'], c: 2, e: 'Ağrı Dağı, 5137 m yüksekliğiyle Türkiye\'nin en yüksek noktasıdır. Nuh\'un Gemisi\'nin buraya oturduğu efsanevi olarak anlatılır.' },
  { q: 'Dünya\'nın en büyük okyanusu hangisidir?', a: ['Atlantik', 'Hint', 'Arktik', 'Pasifik'], c: 3, e: 'Pasifik Okyanusu, tüm kara kütlesinden daha büyüktür. Yüzölçümü yaklaşık 165 milyon km²\'dir.' },
  { q: 'Dünya\'nın en uzun nehri hangisidir?', a: ['Amazon', 'Nil', 'Mississippi', 'Yangtze'], c: 1, e: 'Nil Nehri, yaklaşık 6650 km uzunluğuyla dünyanın en uzun nehridir. Ancak Amazon en fazla suyu taşıyan nehirdir.' },
  { q: 'Dünya\'nın en yüksek dağı hangisidir?', a: ['K2', 'Kangchenjunga', 'Everest', 'Lhotse'], c: 2, e: 'Everest, 8848 m yüksekliğiyle dünyanın en yüksek dağıdır. Nepal-Tibet sınırında bulunur. K2 ise en tehlikeli dağ olarak bilinir.' },
  { q: 'Dünyanın en büyük çölü hangisidir?', a: ['Kalahari', 'Gobi', 'Arabistan', 'Sahra'], c: 3, e: 'Sahra Çölü, yaklaşık 9 milyon km²\'lik alanıyla dünyanın en büyük sıcak çölüdür. Ancak en büyük çöl Antarktika\'dır (soğuk çöl).' },
  { q: 'Avustralya\'nın başkenti neresidir?', a: ['Sidney', 'Melbourne', 'Canberra', 'Brisbane'], c: 2, e: 'Canberra, Sidney ve Melbourne arasındaki rekabeti çözmek için 1913\'te planlı olarak kurulan başkenttir.' },
  { q: 'Brezilya\'nın başkenti neresidir?', a: ['Rio de Janeiro', 'São Paulo', 'Brasilia', 'Salvador'], c: 2, e: 'Brasilia, 1960\'ta Rio de Janeiro\'nun aşırı kalabalıklaşması üzerine sıfırdan inşa edilen başkenttir.' },
  { q: 'Dünyanın en kalabalık ülkesi hangisidir?', a: ['Hindistan', 'Çin', 'ABD', 'Endonezya'], c: 0, e: 'Hindistan, 2023 itibarıyla Çin\'i geçerek yaklaşık 1,4 milyar nüfusuyla dünyanın en kalabalık ülkesi oldu.' },
  { q: 'Dünyanın en büyük ülkesi (yüzölçümü) hangisidir?', a: ['Kanada', 'ABD', 'Çin', 'Rusya'], c: 3, e: 'Rusya, 17,1 milyon km²\'lik alanıyla dünyanın en büyük ülkesidir. 11 farklı saat dilimini kapsar.' },
  { q: 'Avrupa\'nın en uzun nehri hangisidir?', a: ['Tuna', 'Ren', 'Volga', 'Thames'], c: 2, e: 'Volga Nehri, 3530 km uzunluğuyla Avrupa\'nın en uzun nehridir ve Hazar Denizi\'ne dökülür.' },
  { q: 'Türkiye\'nin en büyük gölü hangisidir?', a: ['Beyşehir', 'Eğirdir', 'Tuz Gölü', 'Van Gölü'], c: 3, e: 'Van Gölü, 3755 km²\'lik alanıyla Türkiye\'nin en büyük gölüdür. Sodalı suyu nedeniyle çok az tür yaşayabilir.' },
  { q: 'Akdeniz\'in en büyük adası hangisidir?', a: ['Kıbrıs', 'Girit', 'Sisam', 'Sicilya'], c: 3, e: 'Sicilya, 25.711 km²\'lik alanıyla Akdeniz\'in en büyük adasıdır. İtalya\'ya bağlı olup tarihsel önemi büyüktür.' },
  { q: 'Süveyş Kanalı hangi yılda açıldı?', a: ['1854', '1869', '1881', '1905'], c: 1, e: 'Süveyş Kanalı 1869\'da açıldı. Avrupa ile Asya arasındaki deniz yolunu 7.000 km kısalttı.' },
  { q: 'Dünyanın en büyük adası hangisidir?', a: ['Madagaskar', 'Borneo', 'Grönland', 'Yeni Gine'], c: 2, e: 'Grönland, 2,16 milyon km²\'lik alanıyla dünyanın en büyük adasıdır. Yüzeyinin %80\'i buzla kaplıdır.' },
  { q: 'Panama Kanalı hangi iki okyanusu birbirine bağlar?', a: ['Atlantik-Hint', 'Pasifik-Hint', 'Atlantik-Pasifik', 'Arktik-Pasifik'], c: 2, e: 'Panama Kanalı 1914\'te açıldı. Gemilerin Güney Amerika\'yı dolaşmadan geçişini sağlar; 8000 km\'lik yolu kısaltır.' },
  { q: 'Kapadokya hangi ilde bulunur?', a: ['Konya', 'Ankara', 'Nevşehir', 'Kayseri'], c: 2, e: 'Kapadokya, Nevşehir merkezli bir bölgedir. Volkanik kayaların erozyona uğramasıyla oluşan peri bacaları ile ünlüdür.' },
  { q: 'Dünyanın en derin gölü hangisidir?', a: ['Titicaca', 'Superior', 'Baykal', 'Hazar'], c: 2, e: 'Baykal Gölü, 1642 m derinliğiyle dünyanın en derin gölüdür. Dünyanın tatlı su rezervinin yaklaşık %20\'sini barındırır.' },
  { q: 'Türkiye hangi yarımadada yer alır?', a: ['Arabistan', 'Balkan', 'Anadolu (Küçük Asya)', 'İberya'], c: 2, e: 'Türkiye\'nin Asya\'daki büyük bölümü Anadolu (Küçük Asya) yarımadasındadır. Avrupa\'daki küçük bölümü ise Trakya\'dır.' },
  { q: 'Nil nehri hangi denize dökülür?', a: ['Kızıldeniz', 'Akdeniz', 'Hint Okyanusu', 'Atlantik'], c: 1, e: 'Nil, Mısır topraklarından geçerek Akdeniz\'e dökülür. Mısır uygarlığının doğduğu nehirdir.' },
  { q: 'İstanbul\'daki boğazların adı nedir?', a: ['Süveyş-Hürmüz', 'İstanbul-Çanakkale', 'Messina-Gibraltar', 'Kerç-Bering'], c: 1, e: 'İstanbul Boğazı (Bosphorus) ve Çanakkale Boğazı (Dardanel) Karadeniz ile Ege\'yi birbirine bağlar.' },
  { q: 'Amazon nehri hangi kıtada akar?', a: ['Asya', 'Kuzey Amerika', 'Güney Amerika', 'Afrika'], c: 2, e: 'Amazon Nehri, Brezilya\'dan geçerek Atlantik Okyanusu\'na dökülür. Dünyanın en fazla su taşıyan nehridir.' },
  { q: 'Güney Amerika\'nın en uzun dağ sırası hangisidir?', a: ['Kayalık Dağlar', 'And Dağları', 'Sierra Nevada', 'Appalachian'], c: 1, e: 'And Dağları, 7500 km uzunluğuyla dünyanın en uzun kara dağ silsilesidir. Güney Amerika\'nın batı kıyısı boyunca uzanır.' },
  { q: 'Türkiye\'de kaç il bulunur?', a: ['73', '79', '81', '83'], c: 2, e: 'Türkiye\'de 81 il bulunmaktadır. En son eklenen il 1989\'da Osmaniye oldu. Bazı nüfus baskısı altındaki iller de bölünme gündemi taşımaktadır.' },
  { q: 'Türkiye\'nin başkenti Ankara hangi bölgede yer alır?', a: ['Ege', 'İç Anadolu', 'Karadeniz', 'Marmara'], c: 1, e: 'Ankara, İç Anadolu Bölgesi\'nde yer alır. Kara iklimine sahip olup Türkiye\'nin ikinci büyük şehridir.' },
];

export default questions;
