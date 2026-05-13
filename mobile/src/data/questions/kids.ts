import type { QuizQuestion } from '../../types/quiz';

const questions: QuizQuestion[] = [
  { q: 'Kaç parmağımız var? (iki el)', a: ['8', '9', '10', '12'], c: 2, e: 'İki elimizde toplam 10 parmak bulunur. Her elde 4 parmak ve 1 baş parmak vardır.' },
  { q: 'Gökyüzü ne renktir?', a: ['Yeşil', 'Kırmızı', 'Mavi', 'Sarı'], c: 2, e: 'Güneş ışığı atmosferde dağıldığında mavi renk daha çok saçılır; bu yüzden gökyüzü bize mavi görünür.' },
  { q: 'Güneş sabah hangi yönden doğar?', a: ['Batı', 'Kuzey', 'Güney', 'Doğu'], c: 3, e: 'Dünya batıdan doğuya döndüğü için güneş her sabah doğu yönünden doğar, batı yönünde batar.' },
  { q: 'Hangi hayvan "miyav" der?', a: ['Köpek', 'İnek', 'Kedi', 'At'], c: 2, e: 'Kediler "miyav" der! Aslında kediler bu sesi çoğunlukla insanlarla iletişim kurmak için çıkarır; diğer kedilerle nadiren kullanır.' },
  { q: 'Balıklar nerede yaşar?', a: ['Ağaçta', 'Suda', 'Toprağın altında', 'Havada'], c: 1, e: 'Balıklar suda yaşar ve solungaçlarıyla nefes alır. Tatlı sularda ve tuzlu denizlerde farklı balık türleri bulunur.' },
  { q: 'Arılar ne üretir?', a: ['Süt', 'Yumurta', 'Bal', 'İpek'], c: 2, e: 'İşçi arılar çiçeklerden nektar toplar ve kovanlarında bala dönüştürür. 1 kg bal için yaklaşık 4 milyon çiçek ziyareti gerekir.' },
  { q: 'Haftada kaç gün vardır?', a: ['5', '6', '7', '8'], c: 2, e: 'Haftada 7 gün vardır. Bu sistem, antik Babil ve Yahudi takvimlerinden gelir; Güneş, Ay ve 5 gezegene atfedilen günlerden oluşur.' },
  { q: 'Yılda kaç ay vardır?', a: ['10', '11', '12', '13'], c: 2, e: 'Miladi takvimde 12 ay vardır. Bu sistem eski Roma takvimine dayanır; önce 10 aylıktı, sonradan Ocak ve Şubat eklendi.' },
  { q: 'Günde kaç saat vardır?', a: ['12', '20', '24', '30'], c: 2, e: 'Bir günde 24 saat, bir saatte 60 dakika, bir dakikada 60 saniye vardır.' },
  { q: 'Hangisi bir meyvedir?', a: ['Havuç', 'Patates', 'Soğan', 'Elma'], c: 3, e: 'Elma bir meyvedir çünkü çekirdeği vardır. Botanik olarak domates de bir meyvedir ama mutfakta sebze gibi kullanılır.' },
  { q: 'Gökkuşağında kaç renk vardır?', a: ['5', '6', '7', '8'], c: 2, e: 'Gökkuşağı 7 renktir: kırmızı, turuncu, sarı, yeşil, mavi, lacivert, mor. Yağmur damlacıkları güneş ışığını bu renklere ayırır.' },
  { q: 'Hangi gezegen en büyüktür?', a: ['Satürn', 'Mars', 'Jüpiter', 'Neptün'], c: 2, e: 'Jüpiter güneş sistemimizin en büyük gezegenidir. Dünya\'nın 1300 katı büyüklüğündedir ve kendisi de küçük bir güneş gibi çalışır.' },
  { q: 'Hangi hayvanın boyu en uzundur?', a: ['Fil', 'Zürafa', 'Deve', 'At'], c: 1, e: 'Zürafa, 5-6 metre boyuyla dünyanın en uzun kara hayvanıdır. Uzun boynu sayesinde ağaçların yüksek dallarındaki yaprakları yer.' },
  { q: 'Hangi hayvan en ağırdır?', a: ['Fil', 'Zürafa', 'Gergedan', 'Su aygırı'], c: 0, e: 'Afrika fili, 6-7 ton ağırlığıyla dünyanın en ağır kara hayvanıdır. Dünyanın en ağır canlısı ise mavi balinadır (150+ ton).' },
  { q: 'Karın rengi nedir?', a: ['Sarı', 'Beyaz', 'Mavi', 'Mor'], c: 1, e: 'Kar beyazdır çünkü kar tanecikleri tüm renkleri yansıtır ve hiçbirini absorbe etmez. Boş alanda ya da bulutlu havada mavi görünebilir.' },
  { q: 'Deniz suyu tatlı mı yoksa tuzlu mudur?', a: ['Tatlı', 'Tuzlu', 'Ekşi', 'Acı'], c: 1, e: 'Deniz suyu tuzludur. Milyarlarca yıl boyunca nehirler karaların tuzunu denizlere taşımış; su buharlaşırken tuz geride kalmıştır.' },
  { q: 'Hangi mevsimde karlar yağar?', a: ['İlkbahar', 'Yaz', 'Sonbahar', 'Kış'], c: 3, e: 'Kar kış mevsiminde yağar. Kış Aralık-Şubat arası kuzey yarımkürede, Haziran-Ağustos arası güney yarımkürede yaşanır.' },
  { q: 'Bir üçgenin kaç kenarı vardır?', a: ['2', '3', '4', '5'], c: 1, e: 'Üçgenin 3 kenarı ve 3 açısı vardır. Bir üçgenin iç açıları toplamı her zaman 180 derecedir.' },
  { q: '5 + 3 kaç eder?', a: ['6', '7', '8', '9'], c: 2, e: '5 + 3 = 8. Parmaklarını kullanarak sayabilirsin: 5 parmak kaldır, 3 tane daha ekle, toplam 8 olur.' },
  { q: '3 × 4 kaç eder?', a: ['10', '11', '12', '13'], c: 2, e: '3 × 4 = 12. Bu, 3\'ü 4 kez toplamak demektir: 3+3+3+3 = 12.' },
  { q: 'Türkiye\'nin başkenti neresidir?', a: ['İstanbul', 'İzmir', 'Ankara', 'Bursa'], c: 2, e: 'Ankara Türkiye\'nin başkentidir. İstanbul daha büyük bir şehir olsa da 1923\'ten beri başkent Ankara\'dır.' },
  { q: 'Türk bayrağında hangi şekiller vardır?', a: ['Güneş ve yıldız', 'Ay ve güneş', 'Ay yıldızı ve yıldız', 'Hilal (ay) ve yıldız'], c: 3, e: 'Türk bayrağında kırmızı zemin üzerinde beyaz ay yıldızı (hilal) ve yıldız vardır. Bu semboller Osmanlı döneminden gelmektedir.' },
  { q: 'Tavuklar ne verir?', a: ['Süt', 'Yumurta', 'Bal', 'Yün'], c: 1, e: 'Tavuklar yumurta verir. Bir tavuk yılda yaklaşık 250-300 yumurta yumurtlayabilir.' },
  { q: 'İnekler ne verir?', a: ['Yumurta', 'Bal', 'Süt', 'Yün'], c: 2, e: 'İnekler süt verir. Bu sütten peynir, yoğurt ve tereyağı yapılır. Ortalama bir inek günde 25-30 litre süt verir.' },
  { q: 'Balıklar ne ile nefes alır?', a: ['Ciğerleri', 'Derisi', 'Solungaçları', 'Ağzı'], c: 2, e: 'Balıklar solungaçlarıyla nefes alır. Solungaçlar sudaki oksijeni kana geçirir; akciğer yerine aynı işlevi görür.' },
  { q: 'Kaç rengi karıştırarak turuncu elde edilir?', a: ['Mavi + Sarı', 'Kırmızı + Sarı', 'Mavi + Kırmızı', 'Sarı + Beyaz'], c: 1, e: 'Kırmızı + Sarı = Turuncu. Mavi + Sarı = Yeşil, Mavi + Kırmızı = Mor olur.' },
];

export default questions;
