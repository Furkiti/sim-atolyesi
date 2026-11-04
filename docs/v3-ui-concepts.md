# Üç oyun düzeni ve v3 değişiklikleri

## Akış

Tam ekran kâğıt, küçük aşama göstergesi, tek satırlık yönerge, ek sim ve silkeleme kısayolları. İlk dokunuş rulolu soyma başlatır. Soyma → kaptan dökme → fırça otomatik ilerler. Alan hazır olduğunda aktif parmağın bırakılması beklenir; tek silkeleme → sonraki renk → soyma döngüsü devam eder.

## Kenar

Aynı büyüklükteki kâğıda dokunmadan araçlar sağ kenara alınır. Renk geçişi varsayılan olarak oyuncudadır. Ayarlardan otomatik geçiş açılabilir. Daha fazla doğrudan kontrol ile araçların resme yakın olmasının etkisi karşılaştırılabilir.

## Şerit

Aynı kadraj korunur; araçlar altta kısa bir çubuktadır. Yönerge tek satıra iner. Renk geçişi varsayılan olarak oyuncudadır. Diğer düzenlere göre düğmelerin daha kolay bulunmasıyla arayüz alanı arasındaki tercih denenebilir.

## Ortak davranışlar

Düzen ve kalite değiştirmek simi veya ilerlemeyi sıfırlamaz. Merkez üstündeki dökme noktası sabittir. Doz artırılmıştır ve ayarlanabilir. Kadraj cihazın yönü/enine göre oluşturulur; mobil adres çubuğu veya form odağı yüzünden rastgele değişmez. Ayar kontrolleri iOS form odak zoomunu önlemek için en az 16 px yazı kullanır.

Pointer sahipliği yalnızca ilk aktif birincil parmağa verilir. İkincil pointer hareketi, bitişi veya düğme tıklaması çizgiyi devralamaz. Klavye ve erişilebilir düğme aktivasyonu korunur.

Rulo, maskenin kendi UV dokusunu silindire sarar. Silkeleme genliğine bağlı yükselme bütün kâğıt köşelerinin masa üstünde kalmasını sağlar. Her renk geçişi, tekrarlanan dokunuşları kuyruğa almadan tam bir silkeleme aşamasından geçer.

Görüntü profilleri gerçek render tamponunu, gölge haritasını ve efektleri değiştirir. Performans bilgileri gerçek çizim ve simülasyon ölçümlerinden gelir. 45 FPS zamanlayıcısı 60 Hz ekranda 30 FPS'e yanlış yuvarlanmaz.
