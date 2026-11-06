# Sim Atölyesi — Claude başlangıç notu

Bu repo mevcut, çalışan oyundur. Devam etmeden önce **[docs/CLAUDE_HANDOFF.md](docs/CLAUDE_HANDOFF.md)** dosyasını oku; güncel ürün davranışı, mimari, kararlar, testler ve yayın adımları orada.

## Mevcut checkpoint

- Canlı oyun: https://furkiti.github.io/sim-atolyesi/?v=30&mod=basili&giris=direct
- Repo: https://github.com/Furkiti/sim-atolyesi
- Güncel geliştirme: v30 — [%100 kilitlenmesi, yükleme ve son tabloya açılış](docs/v30-startup-and-finish.md). v29: [aktif renk kaplaması da sergide söner](docs/v29-active-coat-fade.md). v28: yumuşak sergi/devam geçişleri, sergi müziği, birleşik yerel döküş, ışıltılı tablo ve rastgele son dokunuş. [v28 notları](docs/v28-gallery-and-gestures.md). v27 %100 eşiği korunur. v25: gerçek yapışan ek tanelerle akış azalması, yeni masada bekleyip sönme modu ve daha hafif son bükme. Ayrıntı: [docs/v25-adhesion-and-desk.md](docs/v25-adhesion-and-desk.md). Önceki modlar korunur.
- Önceki sabit nokta: `v19-handoff` Git etiketi. Bu etiket tarihsel v19 sürümüdür.
- Kaynak proje bu klasördür; derlenmiş giriş `game.js`, asıl uygulama `src/main.js`.
- Son doğrulama: `npm run build` başarılı, 165 test başarılı; mobil bitiş, gerçek sergi sürükleme, 8× yoğunluk ve aynı belge içinde bölüm geçişi denendi.

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
- Fırça/eğim son rötuş toleransı çok düşüktür. Kullanıcının v27 isteğiyle basılı tut modunda alan doğal akışla %100 dolunca, bekleyen gerçek yapışma hareketleri de bitirilip parmak bırakılmadan temizlik başlar. Erken alan tamamlama yoktur.
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

- `recovery`: classic / trough / rills / bowl / table. Ortak toplama sonlu kütle hesabıdır; çizilen aktarım paketleri birkaç taneyi temsil edebilir. Her fizik adımında `updateSpill(dt,false)`, görüntü başına bir kez `syncSpills()` çalışır.

- Masa modu `table-spill.js` ile gerçek masa düzleminde durur. Sabit taneler bir kez GPU’ya yazılır, sönme shader saatinde yapılır. `bindLayer` gerçek serbest taneyi bağlar; kapsama ağırlığını yeniden artırmaz.

- `finishStyle:variety` yalnız `extraFinish` açıkken rastgele none/fold/tap/left/right/diagonal/lift/sweep seçer. Var olan sonlu toz paketleri taşınır. `posterShine:radiant` yalnız kaplama ve bitmiş komşu tablolarda ek ışık verir. `holdPlacement:joined` aynı yüksekliğe yakın yerel şeritleri birleştirir.
- Sergide fizik durur, sim yalnız shader saydamlığıyla sönüp geri gelir. Devam yolu `beginEntry(...,null,...)` ile mevcut oyunu korur; yeni bölüm hazırlığı kamera başlamadan yapılır.

- v29 `displayPaper` yalnız koruyucu/yapışkan + önceki tamamlanmış renkler + çizgidir; aktif renk shader ile çizilir. `paperCanvas` export/galeri kaydı için aktif kaplamayı da içerir. İkisini birleştirme: sergide görünür pembe/kırmızı iz geri gelir. `uActiveAlpha` bitmiş poster için 1, devam eden renk için `workAlpha` olur.

- v30 açılışı `data-loading`/inert ile örtülür; maskeler, galeri ve shader hazırlığı sonrası sergiye açılır. `AtelierSession` son odağı ve tamamlanan renk sınırlarını saklar. Yarım rengin parçacıkları diskten dönmez. `devam` QA kısayolu geçerlidir, ama o da sergiden başlar. `pendingLayerCount` yalnız gerçek açık rezervasyonları sayar; bir temas her iptal/bağlanmada bir kez bırakılır.
