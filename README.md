# Sim Atölyesi

Tarayıcıda oynanan sim sanatı prototipi.

**[Oyunu aç](https://furkiti.github.io/sim-atolyesi/)**

## Oynanış

1. İşaretli bölgeden tutup sürükleyerek kâğıdı soy.
2. Dök aracında basılı tutarak sim yığını oluştur.
3. Fırçala aracında önce yığından sim al, sonra açılan bölgeye yay.
4. Fazla simi silkele. Bölge tamamlanınca sonraki renge geç.
5. Altı rengin sonunda eseri PNG olarak kaydet.

Fare ve dokunmatik ekran desteklenir. Ses isteğe bağlıdır. Sayfa yenilendiğinde ilerleme sıfırlanır.

## Yerelde çalıştırma

```sh
python3 -m http.server 4173
```

Ardından http://localhost:4173 adresini aç.

## Yayın

GitHub Pages, `main` dalının kök dizininden yayınlar. Build veya sunucu gerekmez. Tüm oyun kaynakları ve maskeleri bu depodadır.

## Teknik

HTML, CSS, JavaScript ve Canvas 2D. Ayrı sim katmanları, alfa maskeleri, fırçanın sim rezervi ve alan tabanlı ilerleme hesabı kullanılır. Batman/Joker şablonu, prototip için sağlanan referans videodaki çizimden çıkarılmıştır. Bu bir hayran yapımı mekanik prototipidir.
