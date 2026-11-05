# v7 · Bol sim, taşıyan fırça ve tatlı bölümler

## Referans incelemesi

Kullanıcının iki kaynak videosu 0,5 saniye aralıklarla yeniden incelendi (7,91 ve 10,16 saniyelik kesitler; 35 kare). Siyah/mavi işleminde önce üstte yoğun bir bant oluşuyor, ardından geniş geçişler aşağı taşıyor. Küçük bordo ayrıntıda dahi bol malzeme kullanılıyor; fazlası kâğıt bükülünce dar bir akışa dönüşüyor. Bu örnek, hedefin az üstüne dökme ve kırmızı finalde daha cömert üst döküş isteğiyle birlikte kullanıldı.

## Malzeme ve hareket

- Üç elle seçilebilir arz düzeni: Bol yığın, Adacıklar, Üstten şelale. Varsayılan Referans akış, büyük arka planda şelale; birden fazla büyük parçada adacık; küçük ayrıntıda tek yığın seçer.
- İlk büyük dozlar artık yaklaşık 32.625–40.600 paket. Küçük ayrıntı daha az alır fakat 360 yerine en az 1.463 paketlik belirgin bir yığın oluşur. Sabit anda kapasite 48.000; otomatik ek madde üretilmez.
- Gerçek şişe ağzı yol boyunca hareket eder; adacıklar arasında akış kesilir. Açılma/kapanma, doldurma ve ses döküş süresiyle eşleşir. Ek döküş, en büyük boş grubun üstüne yönelir; ilk üst banda saplanıp kalmaz.
- Uzun sürüklemelerde merkezdeki taneler fırçadan kopup geride kalıyordu. Merkez tutuşu güçlendirildi; kenar saçılması ve farklı atalet korundu. Boş fırça kaplama oluşturmaz, dökmek tek başına yapıştırmaz.
- Fiziksel yükseklik 52 birimde sınırlı, yumuşatılmış yoğunluktan hesaplanır. Fırçalanmış fakat hâlâ yüksek duran malzemenin sırtı, gerçek tane yüksekliğinin altında çizilir. Bırakınca taneler kendi kendine şişmez. Mikro yüzey dokusu ve hafif temas gölgesi hacmi görünür kılar.
- Tane geometrisi beş yerine üç küçük yüzle çizilir; düz kâğıtta her tane için geçici nokta nesnesi oluşturulmaz. Yeni hacim için 48.000 paket kullanılırken üçgen sayısı sınırlanır.
- Fırçayla küçük, sönümlü kâğıt esnemesi; isteğe bağlı yan kenarı tutup elle eğme. Aynı açı yerçekimi kuvvetine gider, dolayısıyla taneler gerçek eğime akar. Kamera mesafesi hareket etmez. Girdiler dönüşmüş kâğıdın yerel uzayına ışınla eşlenir.
- Kapasite doluyken + Sim, fazlayı kutuya boşaltıp yeniden döker. Mevcut bağlı renk korunur.

## Üç yeni özgün çizim

`build-sweet-levels.py` ile üretilen Çilekli Kedi, Boba Molası ve Kurbağa Pastanesi; her biri 8 renk, 600×800 tam maske bölüşümü, kendi çizgi baskısı ve sırayla soyulan parçalar. Beş bölüm ayarlardaki Bölümler sekmesinden seçilebilir. Hissiyat ve Görüntü & FPS ayrı sekmelerdir; oyunun ana alanına ek panel konmaz.

## Oynama karşılaştırması

Tarayıcıda aynı kırmızı final üzerinde 32 aynı sürükleme; bağımsız yeni dozla her kombinasyon yeniden başlatıldı. Bu tablo nesnel beğeni ölçümü değildir: kaplama, kullanılan temas genişliğinden de etkilenir.

| Fırça | Bol yığın | Adacıklar | Üstten şelale |
|---|---:|---:|---:|
| Kadife | %21,2 | %30,5 | %28,0 |
| Doğal | %44,6 | %52,9 | %62,1 |
| Akışkan | %50,0 | %65,0 | %70,6 |

İlk Doğal/şelale sürümünde aynı 32 geçiş %35,1 veriyordu; tutuş düzeltmesi bunu %62,1’e çıkardı. Büyük döküşte 36.931 serbest paket kutuya toplandı; başka bir kapasite testinde 39.834 paket boşaltılıp bağlı alan değişmeden otomatik yeniden döküldü. Üç yeni bölümde de gerçek arayüz/pointer girdileriyle boyama denendi. Toplam 425 tarayıcı sürüklemesi, ilk karşılaştırmalar ve bir kenardan tutma hareketi dahil. Farklı kalite/gölge seçeneklerinde WebGL konsol hatası görülmedi. 390×844 masaüstü tarayıcı görünümü fiziksel iPhone performans ölçümü değildir.

`node scripts/soak.mjs`: üç hissiyat × üç arz düzeni, her biri 90 saniye; toplam 810 saniye (13,5 dakika) ve 5.985 simüle fırça hareketi. Her durumda paket sayısı korundu; sonlu koordinatlar, yükseklik sınırı, artan kaplama ve boşaltma döngüsü doğrulandı. Son fizik ayarıyla 66,73 saniye CPU duvar süresinde tamamlandı. Bu test tarayıcı sürüklemelerinden ayrıdır.

62 otomatik test: beş tam çizimin maskeleri/soyulmaları, doz planları, akış kotası, eksik alana ek döküş, yayma/atalet, küçük tolerans, gerçek kutu ve kâğıt yayları. WebGL/Three.js üzerinde tamamlandı; Godot karşılaştırma uygulaması yapılmadı. Mekanik ayrıntıları değiştirmek mevcut darboğazı doğrudan çözdüğü için bu sürümde motor geçişi seçilmedi.
