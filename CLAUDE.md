# Sim Atölyesi — Claude başlangıç notu

Bu repo mevcut, çalışan oyundur. Devam etmeden önce **[docs/CLAUDE_HANDOFF.md](docs/CLAUDE_HANDOFF.md)** dosyasını oku; güncel ürün davranışı, mimari, kararlar, testler ve yayın adımları orada.

## Mevcut checkpoint

- Canlı oyun: https://furkiti.github.io/sim-atolyesi/?v=23&mod=basili&giris=direct
- Repo: https://github.com/Furkiti/sim-atolyesi
- Güncel geliştirme: v23 — yerel döküşler ortak üst akışla birleştirilir; yalnız ulaşılmayan parçalara ek döküş yapılır. Ayrıntı: [docs/v23-shared-local-pours.md](docs/v23-shared-local-pours.md). v22 giriş/huni/ana mod davranışları korunur.
- Önceki sabit nokta: `v19-handoff` Git etiketi. Bu etiket tarihsel v19 sürümüdür.
- Kaynak proje bu klasördür; derlenmiş giriş `game.js`, asıl uygulama `src/main.js`.
- Son doğrulama: `npm run build` başarılı, 141 test başarılı; mobil bitiş, gerçek sergi sürükleme, 8× yoğunluk ve aynı belge içinde bölüm geçişi denendi.

## Çalıştırma

```sh
npm ci
npm run dev
```

http://localhost:4173 — ESM/Three.js/WebGL. Geliştirmede `game.js` paketlenmiş olarak kullanılır; kaynak değişince `npm run build` çalıştırıp sayfayı yenile.

```sh
npm run build
npm test
```

## Korunacak kararlar

- Kullanıcı Türkçe konuşuyor ve telefonu üzerinden, ChatGPT gerektirmeyen GitHub Pages bağlantısından deniyor. Rutin uygulama kararlarında sürekli teyit isteyerek işi bölme.
- Sim sonlu malzemedir. Fırça boş alana boya basmamalı; sim bırakınca çoğalmamalı.
- Basılı tut modu bilinçli olarak yönlendirilmiş bir akıştır; tam serbest fizik gibi yeniden yazılması istenmiş değil.
- Fırça/eğim son rötuş toleransı çok düşüktür. Kullanıcının v22 isteğiyle basılı tut modunda %90 üstünde kalan gerçek hedef paketleri .30 saniye içinde ilerleyip .18 saniyede yapışır; parmak bırakılmadan temizlik başlar.
- Katalogda altı bölüm var; oyuncu ilkinden sırayla açar. Kapatılan dört eski bölümü kendiliğinden açma.
- Çalışma kamerası sabittir; sergi, geri dönüş ve tablonun içine girerek bölüm geçişinde hareket eder. İlk parmak kontrol eder; ikinci parmak devralmaz.
- Oyun hızı 1x–4x’tir. Hızı çarptıktan sonra fiziği küçük adımlara böl; FPS ve fırça hareketlerini tekrar tekrar hızlandırma.
- Bitişte ortadaki posteri kapatan modal ekleme. Altı açık bölüm tek sergi sırasında bulunur. Bitmiş eserler gerçek kayıttan, bitmemiş/kilitliler bulanık önizlemeden gelir; ilk eserin soluna sahte çerçeve koyma. Yeni bölümü sayfa yükleyerek açma.
- Kaynak değiştiyse derlenmiş `game.js` ve üretilen dosyaları da commit et. Pages iş akışı sunucuda derleme yapmaz.
- `game.js`, `src/reference-levels.js`, `src/peel-pieces.js` üretilir; bunları ana düzenleme noktası yapma.
- `docs/v*.md` tarihsel notlardır. Güncel davranış için devir belgesi ve kod önceliklidir.

Görsel araştırma ve kararlar: [docs/v20-ui-references.md](docs/v20-ui-references.md). Üç özgün yön: [docs/v20-reference-board.html](docs/v20-reference-board.html). Mikro CPU ölçümü: `node scripts/benchmark-hold.mjs`.

- `extraFinish` son dokunuşu sonraki boşaltma için açıp kapatır. Mevcut gevşek paketler tutulup bırakılır; kaplama değişmez, yeni tane yaratılmaz.
- `holdPlacement`: `sheet` klasik, `width` hedef genişliğinde üst şerit, `local` ortak üst akışın ulaşamadığı parçalar için ek şeritlerdir; her parça ayrı kaynak gerektirmez.
- Normal döküş, kâğıttaki artık ve huni akışı seçilen boyutu izler. Yalnız isteğe bağlı son dokunuşa ayrılan en fazla 24 tane, ilk bükmeden sonra `finishDust` ile %38 boyuta iner. Son dokunuş varsayılan kapalıdır.
- Basılı tut ana varsayılan: hedef genişliği / yoğunluk %500 / boyut %170. `holdPresetVersion:22` bir kez yeni varsayılanları taşır; sonraki kullanıcı değişikliklerini korur. Basılı soyma hızlandırması kaldırıldı; genel oyun hızı çalışır.
