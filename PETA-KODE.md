# Gelud BakuHantam — peta proyek

Game sekarang dipisah menjadi halaman, style, bootstrap, dan beberapa berkas engine. Hasil build tetap situs statis; Vite hanya dipakai saat pengembangan atau proses build.

```text
index.html                         markup dan menu
style.css                          seluruh style game
src/bootstrap.js                   pilih WebGPU atau WebGL2, lalu mulai engine
public/engine/
  three-legacy.js                  Three.js r186 dan dukungan render lama
  render-pipeline.js               renderer, preset kualitas, efek post-process
  world.js                          arena, pencahayaan, objek dunia
  brawlers.js                       model dan konfigurasi brawler
  combat.js                         gerak tempur, proyektil, partikel
  effects.js                        efek visual, firefly, poison gas
  interfaces.js                     HUD, settings, input dan kontrol mobile
  main.js                           lifecycle match dan game loop
```

Berkas `public/engine/*.js` sengaja dimuat sebagai script klasik berurutan. Kode asli memakai satu namespace global dan banyak kelas Three.js yang saling bergantung; pemisahan per domain menjaga perilaku itu tetap kompatibel sambil membuat bagian game lebih mudah dicari dan dikembangkan. `three-legacy.js` adalah library renderer, bukan kode gameplay.

## Renderer

Bootstrap mencoba WebGPU jika browser menyediakan `navigator.gpu` dan inisialisasinya berhasil. Jika tidak, game memakai WebGL2. Tambahkan `?renderer=webgl` ke URL untuk memaksa jalur fallback saat debugging. WebGPU memuat modul renderer secara terpisah agar perangkat yang memakai WebGL2 tidak perlu mengunduhnya.

Jalur WebGPU memakai material standar dan render langsung. GTAO, bloom, shader khusus rumput/lampu, dan volume gas GLSL tidak dipakai di jalur ini; efek yang belum punya padanan kompatibel menggunakan bentuk lebih sederhana. WebGL2 mempertahankan post-processing dan shader lama. Preset kualitas mengatur beban render/shadow dan terpisah dari pilihan backend.

## Menjalankan dan deploy

```sh
npm install
npm run dev
npm run build
```

Build menghasilkan `dist/`. Upload isi folder itu ke `public_html` atau deploy `dist` ke Vercel sebagai situs statis. Server Node.js tidak berjalan saat game dimainkan; Node hanya dibutuhkan untuk build lokal/CI.

Menu awal menyediakan pilihan mode, arena, dan brawler. Mode `deathmatch` adalah Free-for-All dengan batas 50 kill atau 5 menit, respawn 3 detik, dan perlindungan 2 detik setelah respawn. Arena `open` memberi lebih banyak ruang terbuka; `stepped` memakai cover berlapis dan jalur yang lebih rapat di arena top-down.

Parameter debugging yang tersedia antara lain `?q=low|medium|high|ultra`, `?bots=auto|easy|normal|hard|brutal`, `?mode=classic|blitz|deathmatch`, `?map=open|stepped`, `?auto=dusty|ace|fuse|titan|volt`, `?seed=`, `?time=`, `?speed=`, dan `?zoom=`.
