# v8 · Telefonu eğerek oyna

İstenen deney: kullanıcı sim döktükten sonra telefonu eğerek serbest malzemeyi taşır; gerçek yapışkan temasında fırça gerekmeksizin tutunur. Fırça modu ayrı kalır.

## Girdi

`src/tilt.js` bağıl DeviceOrientation beta/gamma verisini kullanır. İlk geçerli örnek, telefonu rahat tuttuğun duruşta sıfır kabul edilir; Düz say düğmesi tekrar kalibre eder. Bir derecelik ölü bölge, zamana bağlı filtre, sınırlı hassasiyet ve ekran yönüne göre eksen dönüşümü bulunur. Ekran yönü değiştiğinde sıfır yeniden alınır. Sekmeye dönüşte de yeni bir referans alınır.

Hareketi aç düğmesi, requestPermission varsa aynı kullanıcı hareketi içinde ve await öncesinde çağırır. İzin verilmeden alıcı bağlanmaz. Reddedilen izin, desteklenmeyen cihaz, güvenli olmayan bağlantı, veri gelmemesi ve eski veri ayrı durumlar olarak gösterilir. Mod değişirken bekleyen bir izin sonucu sonradan alıcı açamaz. Sensör verisi kaydedilmez veya sunucuya yollanmaz.

Uygulama [MDN izin API’si](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent/requestPermission_static) ve [W3C yön/hareket koordinat sistemi](https://www.w3.org/TR/orientation-event/) temel alınarak yapıldı. GitHub Pages HTTPS sunar. Gerçek fiziksel iPhone sensörüne bu çalışma ortamından erişilemedi.

## Fizik

Yalnızca etkin eğim kontrolünde, sim döküşü bittikten sonra temasla yapışma açıktır. Ayarlar açıkken, veri yokken, soyma/döküş/boşaltma sırasında sensör yapıştırmaz. Eğim, serbest malzemeye yerçekimi kuvveti uygular; sürtünme kayarak yayılmaya göre ayarlanır. Görsel kâğıt aynı yönde sınırlı eğilir, kamera mesafesi değişmez.

Bir paket ancak FREE durumunda, kâğıt yüzeyine yakın ve gerçekten maskenin içinde ise tutunur. Komşu yapışkana çekme yapılmaz. Hızlı hareketlerde yüzey yolu bir piksel aralıklarla kontrol edilerek ince çizgilerin içinden atlama engellenir. Havada veya yığının yüksek yüzeyinde duran paket boya oluşturamaz. Bağlanan paketler mevcut yoğun sim katmanına eklenir; yeni madde oluşturulmaz.

Kâğıt eğimini merkezden döndürmek alt kenarı masaya sokuyordu. Dönüş açısına bağlı yükseltme payı bunu önler; dört köşe için test edilir. Bu düzeltme el ile eğme sırasında da geçerlidir.

## Arayüz

Hissiyat → Nasıl oynayalım? → Telefonu eğerek oyna. Hareketi aç, Düz say ve hassasiyet ayarı bulunur. Fırça bu modda gizlenir ve dokunma sürüklemesi fırça izi üretmez. Ana ekrandaki küçük kontrol satırı izin ve kalibrasyona erişim sağlar. `?v=8&mod=egim` bağlantısı bu modu seçer; sensör izni otomatik istenmez.

Sensörü olmayan bilgisayarlarda, açıkça Ekran eğimi olarak etiketlenen iki eksenli alternatif vardır. Bu, aynı filtre ve fizik yolunu kullanır; gerçek sensör ölçümü gibi sunulmaz.

## Doğrulama

76 test geçti. Yeni testler kalibrasyon, ekran dönüşümü, gürültü, açı sarımı, izin verme/reddetme/hata, geç izin sonucu, veri yokluğu ve bayat veri, sensörsüz alternatif, fırçasız gerçek temas, fırça modunun korunması, havada/komşuda yapışmama, bir piksellik çizgiden atlamama ve kâğıdın masayla kesişmemesini kapsar.

Tarayıcıdaki gerçek arayüzde ekran eğimi seçilerek dudak aşaması tek bir fırça sürüklemesi olmadan tamamlandı: %100 kaplama, 38 bağlı paket, sıfır fırçalanmış paket. Bu, gerçek telefon sensörüyle değil açıkça etiketlenen ekran eğimiyle yapılan bütünleşik testtir. Kalibrasyon, ayar menüsünde duraklama ve mod değiştirme de kontrol edilir. Gerçek telefonun sensör hissiyatı için kullanıcının cihazında deneme gerekir.
