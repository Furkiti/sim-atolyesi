# Sim Atölyesi — Claude başlangıç notu

Bu repo mevcut, çalışan oyundur. Devam etmeden önce **[docs/CLAUDE_HANDOFF.md](docs/CLAUDE_HANDOFF.md)** dosyasını oku; güncel ürün davranışı, mimari, kararlar, testler ve yayın adımları orada.

## Mevcut checkpoint

- Canlı oyun: https://furkiti.github.io/sim-atolyesi/?v=19&mod=basili
- Repo: https://github.com/Furkiti/sim-atolyesi
- Oyun kodunun son commit’i: `bec29b5043b9d8807f9d1507df896126f66459a1`.
- Devir notlarıyla birlikte sabit nokta: `v19-handoff` Git etiketi.
- Kaynak proje bu klasördür; derlenmiş giriş `game.js`, asıl uygulama `src/main.js`.
- Son doğrulama: `npm run build` başarılı, 113 test başarılı; 4x bitiş ve ayar kalıcılığı tarayıcıdan denendi.

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
- Görünür eksikleri otomatik boyama. Son rötuş toleransı çok düşüktür.
- Altı bölüm açık; kapatılan dört eski bölümü kendiliğinden açma.
- Oyun kamerası sabittir; hareketli kamera yalnızca bitiş galerisinde kullanılır. İlk parmak kontrol eder; ikinci parmak devralmaz.
- Oyun hızı 1x–4x’tir. Hızı çarptıktan sonra fiziği küçük adımlara böl; FPS ve fırça hareketlerini tekrar tekrar hızlandırma.
- Bitişte ortadaki posteri kapatan modal ekleme. Çerçeveli galeri, gerçek önceki eser, bulanık sonraki eser ve kenardaki eylemler korunmalı.
- Kaynak değiştiyse derlenmiş `game.js` ve üretilen dosyaları da commit et. Pages iş akışı sunucuda derleme yapmaz.
- `game.js`, `src/reference-levels.js`, `src/peel-pieces.js` üretilir; bunları ana düzenleme noktası yapma.
- `docs/v*.md` tarihsel notlardır. Güncel davranış için devir belgesi ve kod önceliklidir.

Bu devir görevi kapsamında oynanış değişikliği yapılmadı. Yeni geliştirme için kullanıcının sonraki isteğini esas al.
