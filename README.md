# Sim Atölyesi — 3B sürüm

**[Oyunu aç](https://furkiti.github.io/sim-atolyesi/)**

Videodaki sim sanatı hareketlerini hedefleyen, tarayıcıda çalışan bir 3B oyun prototipi. GitHub Pages üzerinde giriş gerektirmeden oynanır.

## Oynanış

1. Halkalı yerden tutup sürükleyerek koruyucu kâğıdı soy.
2. Cam kaptan bir doz sim kendiliğinden dökülür; tanelerin yığın oluşturmasını bekle.
3. Fırçaya yığının içinden başla. Mevcut taneleri iterek açılan yapışkan bölgelere dağıt.
4. Gerekirse **Yığın dök** aracını seçip kâğıtta bir noktaya dokun; o noktaya yeni bir doz dökülür.
5. **Silkele** ile fazlalıkları dök. Yapışan taneler kalır.
6. Bölgenin yeterince büyük kısmı kaplanınca sonraki renge geç. Altı rengin sonunda sahneyi PNG olarak kaydet.

Boş bölgedeki fırça izi renk üretmez. Renk, yalnızca gerçekten oraya taşınmış sim tanelerinden oluşur. Fare ve dokunmatik ekran desteklenir. Ses isteğe bağlıdır; sayfa yenilenince ilerleme sıfırlanır.

## İlk sürümden farkı

İlk Canvas prototipi fırçanın rezervi varken daire şeklinde bir boyama maskesi açıyordu. Bu sürüm o sistemi kaldırır. Her tanenin konumu, yüksekliği, hızı ve serbest/yapışmış durumu vardır. Fırça simi silip başka yerde yeniden çizmez; tanenin kendi konumunu değiştirir. İnce tabaka yapışkana tutunurken fazla malzeme fırçanın önünde birikir.

Three.js/WebGL sahnesi; hacimli sim yığınları, metalik ve farklı yönlere bakan sim yüzeyleri, hareketli ışık, gölgeler, kâğıt kalınlığı, kıvrılan koruyucu parça, cam kaplar ve modellenmiş fırça içerir. Tane modeli yerçekimi, sürtünme ve sekiz yönlü yığın eğimiyle çalışır. Tam bir katı cisim/DEM simülatörü değildir.

Batman/Joker şablonu, prototip için sağlanan referans videodaki çizimden çıkarılmıştır.

## Geliştirme

```sh
npm ci
npm test
npm run build
npm run dev
```

Yerel adres: http://localhost:4173

- `src/sand.js`: DOM'dan bağımsız sonlu malzeme ve fırça modeli.
- `src/scene.js`: 3B sahne, parçacık çizimi, ışık ve araçlar.
- `src/main.js`: kâğıt soyma, otomatik dökme, girdi ve renk akışı.
- `test/sand.test.js`: boş fırça, uzak yığın, üç boyutlu tepe, fiziksel taşıma, yapışma, silkeleme ve malzeme korunumu kontrolleri.
- `game.js`: derlenmiş, tüm çalışma zamanı bağımlılıklarını içeren dosya. GitHub Pages bu dosyayı kullanır; Three.js için bir CDN bağlantısı gerekmez.

GitHub Pages `main` dalının kök dizininden yayınlar. Kaynak değişikliğinden sonra `npm run build` çalıştırıp derlenmiş dosyayı kaynaklarla birlikte commit/push etmek gerekir.
