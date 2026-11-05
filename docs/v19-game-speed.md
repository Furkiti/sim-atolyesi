# v19 · Oyun hızı

Hissiyat sekmesine yedi görünür seçenek eklendi: 1x, 1.25x, 1.5x, 1.75x, 2x, 3x ve 4x. Varsayılan 1x. Seçim oyun sıfırlanmadan uygulanır; mevcut settings anahtarında saklanır. Görüntü profili, hissiyat, bölüm veya oyun modu seçimi hızı sıfırlamaz. Eski kayıtlarda hız yoksa 1x kullanılır. Liste dışındaki değerler kabul edilmez.

## Zaman ve fizik

Gerçek kare süresi önce hızla çarpılır, sonra en fazla 40 ms’lik fizik adımlarına bölünür. Sonradan delta kırpılıp hızın etkisinin kaybolması veya büyük adımla yapışkan alanların atlanması önlenir. Soyma/döküş/temizleme sayaçları, basılı akış, serbest simler, kâğıt hareketi ve kutuya düşen parçalar aynı oyun saatini kullanır. Düşen parçaların fiziği artık render başına tekrar ilerletilmez. Görünürlük son aşamaya göre zaman ilerletilmeden eşitlenir.

Fırça hareketleri kare başına bir kez, parmağın gerçek hareket süresiyle işlenir; hız arttığı için aynı fırça izi tekrar uygulanmaz. Sensör örnekleri, arayüz animasyonları, performans/FPS ölçümleri ve çizim sınırı gerçek zamandadır. Render bir kez yapılır. Soyma yüzeyinin yeniden çizimi de fizik alt adımı başına değil, kare başına bir kez yapılır. Galeri yaklaşması ve sahne efektleri oyun saatine uyar. Ses perdesi değişmez; döküş sesi ilgili faz bittiğinde durur.

Basılı tutarak soyma hızlandırması seçilen hızın üstüne uygulanır. Büyük arka plan sekmesi aralıkları için mevcut 60 ms kare süresi koruması devam eder; tarayıcı geri geldiğinde birden birçok bölüm atlanmaz.

## Doğrulama

- `npm run build` ve `npm test`: 113 test başarılı.
- Yedi hızın depolama/geri yüklemesi ve görüntü profilinden bağımsız kalması doğrulanır.
- 30 ve 60 FPS’te bir saniyelik gerçek zamanın seçilen oyun süresine eşit olduğu, hiçbir fizik adımının 40 ms’yi aşmadığı kontrol edilir.
- Soyma, döküş ve temizleme olaylarının sırası ve hızla orantılı süreleri tüm seçeneklerde sınanır.
- 30 FPS’te 4x dâhil bütün hızlarla ayrı yapışkan adalar %100 kaplanır; sim sayısı artmaz, konumlar sonlu kalır.
- Mobil tarayıcı görünümünde yedi seçenek tıklanır, 4x yenilemede korunur ve son renk arayüzden tamamlanarak galeriye geçilir. Fiziksel telefon testi değildir.
