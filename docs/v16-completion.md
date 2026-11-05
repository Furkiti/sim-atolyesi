# v16 · Poster kutlaması

Bölümün son temizliği bittiğinde engelleyici bitiş penceresi yerine doğrudan 3B poster gösterilir. Kamera 1,65 saniyede önden bir kadraja geçer, kâğıt masadan yükselir, kavanozlar çekilir. Otuz altı küçük yıldız eserin dış kenarlarında parlar; sim kaplamasının üzerinde dar ve hafif bir ışık geçişi bulunur.

Başlık ve eylemler için üst ve alt kenarda ayrı alan ayrılır. `completionLayout` telefon, yatay telefon ve masaüstünde bütün posteri bu alanların arasına sığdırır; kesilme ve düğmelerin eserin üstüne gelmesi önlenir. Güvenli ekran kenarları hesaba katılır. Önceki rasgele oyun zoomları geri açılmaz; kamera hareketi yalnızca tamamlanma durumunda uygulanır.

Paylaş düğmesi, destekleniyorsa PNG dosyasıyla Web Share API kullanır. Dosya bölüm tamamlanınca önceden hazırlanır. Kaydet ve paylaşım desteklenmiyorsa indirme, aynı 1200×1600 portre PNG’sini verir. Kaynak doğrudan boyalı kâğıt katmanıdır; düğmeler, masa ve VFX dosyada bulunmaz. Paylaşımı iptal etmek hata sayılmaz. Gerçek paylaşım alıcısı otomatik seçilmez.

Arayüzde düğme basma esnemesi, hover tepkisi, ayar paneli giriş animasyonu ve seçim geçişleri eklendi. Bireysel CSS scale kullanımı ortalanmış araçların mevcut konum dönüşümlerini bozmaz. Hareket azaltma tercihi kamera geçişini anlık yapar ve dekoratif hareketleri kapatır; parıltı ayarı da kutlama yıldızları ve ışık süpürmesini kontrol eder.

Tamamlanmada malzeme fiziği ve hareketli sim matris güncellemeleri durur. Yalnızca hafif sahne/VFX çizimi devam eder. Tekrar eylemi kamera, araçlar ve kutlama durumunu sıfırlar. Yeni bölüm yalnızca dört açık bölüm arasında ilerler.

## Kontroller

- `npm run build` ve `npm test` (105 test).
- Yeni geometrik testler, altı farklı ekran/güvenli kenar birleşiminde posterin dört köşesini gerçek perspektif kamera ile projekte eder; başlık ve eylem alanlarıyla çakışmadığını doğrular.
- Yaklaşma eğrisinin taşmadığı ve hareket azaltma tercihinde beklemeden son kadraja geçtiği doğrulanır.
- Tarayıcıda son renk oynanarak kutlama açılır; kaydetme, tekrar ve sonraki bölüm eylemleri ayrıca kontrol edilir. Fiziksel telefonun sistem paylaşım ekranı bu ortamda doğrulanmadı.
