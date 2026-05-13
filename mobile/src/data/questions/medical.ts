import type { QuizQuestion } from '../../types/quiz';

const questions: QuizQuestion[] = [
  { q: 'Kardiyoloji hangi organla ilgilenir?', a: ['Böbrek', 'Kalp', 'Akciğer', 'Beyin'], c: 1, e: 'Kardiyoloji, kalp ve damar sistemi hastalıklarını inceler. "Kardio" Yunanca kalp anlamına gelir.' },
  { q: 'Nöroloji hangi sistemle ilgilenir?', a: ['Sindirim', 'Dolaşım', 'Sinir', 'Endokrin'], c: 2, e: 'Nöroloji, beyin, omurilik ve sinirlerden oluşan sinir sistemini inceler. Alzheimer, epilepsi ve inme nöroloji alanındadır.' },
  { q: 'Onkoloji neyin bilimidir?', a: ['Kemik hastalıkları', 'Kanser hastalıkları', 'Deri hastalıkları', 'Göz hastalıkları'], c: 1, e: 'Onkoloji, kanserin tanı ve tedavisini inceler. "Onkos" Yunanca tümör demektir. Kanser dünyada en yaygın ölüm nedenlerinden biridir.' },
  { q: 'Oftalmoloji hangi organı inceler?', a: ['Kulak', 'Dil', 'Göz', 'Burun'], c: 2, e: 'Oftalmoloji göz hastalıklarıyla ilgilenir. "Ophthalmos" Yunanca göz demektir. Göz doktoru muayene, gözlük reçetesi ve ameliyat yapar.' },
  { q: 'Ortopedi neyle ilgilenir?', a: ['Kas-iskelet sistemi', 'Sinir sistemi', 'Dolaşım sistemi', 'Bağışıklık sistemi'], c: 0, e: 'Ortopedi, kemik, eklem, kas ve bağları kapsar. Kırıklar, omurga sorunları ve diz problemleri ortopedi alanındadır.' },
  { q: 'Kan basıncının normal değeri kaçtır?', a: ['80/60 mmHg', '100/70 mmHg', '120/80 mmHg', '140/90 mmHg'], c: 2, e: '120/80 mmHg normal tansiyondur. 140/90 ve üzeri hipertansiyon (yüksek tansiyon) olarak kabul edilir.' },
  { q: 'Normal vücut ısısı kaç derecedir?', a: ['35°C', '36–37°C', '38°C', '39°C'], c: 1, e: 'Normal vücut sıcaklığı 36-37°C arasındadır. 37.5°C üzeri ateş sayılır; 38°C\'nin üzeri yüksek ateştir.' },
  { q: 'Diyabet hangi hormonun eksikliğiyle ilgilidir?', a: ['Adrenalin', 'İnsülin', 'Kortizol', 'Tiroksin'], c: 1, e: 'Tip 1 diyabette pankreas yeterli insülin üretemez; Tip 2\'de ise vücut insüline dirençlidir. İnsülin kan şekerini düzenler.' },
  { q: 'İnsülin hangi organ tarafından üretilir?', a: ['Karaciğer', 'Böbrek', 'Pankreas', 'Dalak'], c: 2, e: 'İnsülin, pankreasın Langerhans adacıklarındaki beta hücreleri tarafından üretilir. Kan şekerini düşürme işlevi görür.' },
  { q: 'Hemoglobin ne işe yarar?', a: ['Sindirimi kolaylaştırır', 'Kanda oksijen taşır', 'Yağ depolar', 'Enfeksiyonla savaşır'], c: 1, e: 'Hemoglobin, kırmızı kan hücrelerindeki demir içeren bir proteindir. Akciğerden aldığı oksijeni dokulara taşır.' },
  { q: '"Hipertansiyon" ne demektir?', a: ['Düşük tansiyon', 'Yüksek tansiyon', 'Düzensiz tansiyon', 'Normal tansiyon'], c: 1, e: 'Hipertansiyon yüksek kan basıncı demektir. "Sessiz katil" olarak da bilinir çünkü uzun süre belirti vermeyebilir.' },
  { q: '"Hipoglisemi" ne demektir?', a: ['Yüksek kan şekeri', 'Düşük kan şekeri', 'Yüksek kolesterol', 'Düşük kan basıncı'], c: 1, e: '"Hipo" = düşük, "glisemi" = kan şekeri. Hipoglisemi kan şekerinin 70 mg/dL\'nin altına düşmesi durumudur; baş dönmesi ve titreme yapabilir.' },
  { q: 'EKG (Elektrokardiyogram) neyi ölçer?', a: ['Beyin aktivitesini', 'Kalp aktivitesini', 'Kasların gücünü', 'Kan şekerini'], c: 1, e: 'EKG, kalbin elektriksel aktivitesini kaydeden bir testtir. Kalp ritim bozuklukları, kalp krizi ve diğer kalp sorunlarını gösterir.' },
  { q: '"Apandisit" hangi organın iltihabıdır?', a: ['Mide', 'Pankreas', 'Apandiks', 'Ince bağırsak'], c: 2, e: 'Apandiks, kalın bağırsağın başına tutunmuş küçük bir uzantıdır. İltihaplanırsa apandisit oluşur ve acil ameliyat gerektirir.' },
  { q: '"Pnömoni" hangi organın enfeksiyonudur?', a: ['Böbrek', 'Karaciğer', 'Akciğer', 'Mide'], c: 2, e: 'Pnömoni, akciğerlerin bakteri, virüs veya mantar enfeksiyonudur. Özellikle yaşlılar ve bağışıklığı zayıflar için tehlikelidir.' },
  { q: 'Antibiyotikler hangi tür enfeksiyonlara karşı etkilidir?', a: ['Viral', 'Bakteriyel', 'Fungal', 'Parazitik'], c: 1, e: 'Antibiyotikler yalnızca bakteriyel enfeksiyonlara karşı etkilidir. Grip ve soğuk algınlığı viral olduğu için antibiyotik işe yaramaz.' },
  { q: 'Karaciğerin temel işlevi nedir?', a: ['Sinir iletimi', 'Kan üretimi', 'Toksinleri süzmek ve detoks', 'Oksijen taşımak'], c: 2, e: 'Karaciğer 500\'den fazla işlevi olan dev bir fabrikadır. Toksinleri süzer, safra üretir, glikozu depolar ve proteinleri sentezler.' },
  { q: '"Sinüzit" neyin iltihabıdır?', a: ['Gırtlak', 'Burun sinüsleri', 'Kulak zarı', 'Dil'], c: 1, e: 'Sinüzit, alın, yanak ve burun çevresindeki hava boşluklarının (sinüslerin) iltihabıdır. Baş ağrısı ve tıkanıklık belirtileri gösterir.' },
  { q: '"Osteoporoz" nedir?', a: ['Kemik yoğunluğunun azalması', 'Kas erimesi', 'Eklem iltihabı', 'Sinir hasarı'], c: 0, e: 'Osteoporoz kemik yoğunluğunun azalmasıyla kemiklerin kırılgan hale gelmesidir. Menopoz sonrası kadınlarda daha sık görülür.' },
  { q: '"Alzheimer" hangi organı etkiler?', a: ['Kalp', 'Böbrek', 'Beyin', 'Karaciğer'], c: 2, e: 'Alzheimer, beynin yavaş yavaş tahrip olduğu bir demans türüdür. Bellek kaybı ve bilişsel gerilemeyle kendini gösterir.' },
  { q: 'Evrensel kan donörünün grubu hangisidir?', a: ['A Rh+', 'B Rh-', 'O Rh-', 'AB Rh+'], c: 2, e: 'O Rh- kan grubu herkese verilebilir çünkü yüzeyinde A, B veya Rh antijenlerini taşımaz. Acil kanamalarda hayat kurtarır.' },
  { q: 'Evrensel alıcının kan grubu hangisidir?', a: ['O Rh-', 'A Rh+', 'B Rh-', 'AB Rh+'], c: 3, e: 'AB Rh+ kan grubu sahipleri herkesten kan alabilir çünkü vücutları tüm antijenleri tanır ve reddetmez.' },
  { q: '"Kemoterapisi" ne için uygulanır?', a: ['Diyabet tedavisi', 'Kanser tedavisi', 'Kemik kırıklarında', 'Alerji tedavisi'], c: 1, e: 'Kemoterapi, hızlı bölünen kanser hücrelerini yok etmek için kullanılan ilaç tedavisidir. Maalesef sağlıklı hücreleri de etkileyebilir.' },
  { q: '"Diyaliz" hangi organın görevini üstlenir?', a: ['Karaciğer', 'Kalp', 'Böbrek', 'Akciğer'], c: 2, e: 'Diyaliz, böbrekler yeterince çalışamadığında kanı yapay olarak filtreleyen bir tedavi yöntemidir.' },
];

export default questions;
