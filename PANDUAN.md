# A31 Board — Panduan Setup & Deploy (PWA + Firebase)

Aplikasi ini adalah **PWA** (Progressive Web App): sekali di-deploy ke Firebase Hosting, ia bisa
di-*install* ke home screen Android/iOS dan jadi aplikasi Chrome standalone di desktop, jalan
offline, dan **sinkron antar perangkat** lewat Google Login + Firebase Realtime Database.

Total waktu setup: ~10–15 menit. Semuanya **gratis** (Firebase Spark plan).

---

## Bagian 1 — Buat Project Firebase (sekali saja)

1. Buka **https://console.firebase.google.com** → login akun Google → **Add project**.
2. Nama project: `a31-board` (bebas) → Continue. Google Analytics boleh dimatikan → **Create project**.

### 1a. Aktifkan Google Login
3. Menu kiri **Build → Authentication → Get started**.
4. Tab **Sign-in method → Add new provider → Google → Enable →** pilih email support → **Save**.

### 1b. Aktifkan Realtime Database
5. Menu kiri **Build → Realtime Database → Create Database**.
6. Pilih lokasi (mis. *Singapore*) → mulai dalam **Locked mode** (aman; rules kita atur nanti) → Enable.

### 1c. Ambil konfigurasi web (Firebase config)
7. Klik ikon **⚙️ (Project settings)** di kiri atas.
8. Scroll ke **Your apps** → klik ikon **`</>` (Web)**.
9. App nickname: `a31-board` → **Register app** (tidak perlu centang Hosting di sini).
10. Firebase menampilkan blok `const firebaseConfig = { ... }`. **Copy seluruh objek itu.**

### 1d. Tempel config ke aplikasi
11. Buka file **`index.html`**, cari baris berkomentar:
    ```
    >>> TEMPEL FIREBASE CONFIG ANDA DI SINI <<<
    ```
12. **Ganti** seluruh objek `firebaseConfig = { ... }` dengan yang tadi Anda copy. Pastikan ada
    `databaseURL` (kalau tak ada di copy-an, ambil dari halaman Realtime Database, bentuknya
    `https://xxxx-default-rtdb.firebaseio.com`).
13. Simpan file.

> Catatan keamanan: `apiKey` Firebase **memang publik** dan aman ditaruh di kode klien —
> keamanan data dijaga oleh **rules** (Bagian 3), bukan oleh menyembunyikan apiKey.

---

## Bagian 2 — Deploy ke Firebase Hosting

Butuh **Node.js** terpasang di komputer. Lalu di terminal, dari dalam folder ini:

```bash
# 1) Install Firebase CLI (sekali saja)
npm install -g firebase-tools

# 2) Login (buka browser)
firebase login

# 3) Hubungkan folder ini ke project Anda
firebase use --add          # pilih project a31-board, beri alias: default

# 4) Deploy hosting + database rules
firebase deploy
```

Selesai. CLI menampilkan URL, mis. **https://a31-board.web.app** — itulah aplikasi Anda (HTTPS otomatis).

> Kalau `firebase use --add` minta file `.firebaserc`, cukup ketik ID project Anda saat diminta.
> Kalau hanya mau deploy hosting: `firebase deploy --only hosting`. Rules DB saja: `firebase deploy --only database`.

---

## Bagian 3 — Rules keamanan (sudah otomatis ter-deploy)

File `database.rules.json` sudah mengatur: **setiap user hanya bisa membaca/menulis datanya sendiri**
(`users/{uid}`). Ini ikut ter-deploy pada `firebase deploy`. Tidak perlu diubah.

---

## Bagian 4 — Install sebagai Aplikasi

### Desktop (Chrome / Edge)
- Buka URL `.web.app` Anda → di ujung kanan address bar muncul ikon **install (⊕ / monitor)** →
  klik **Install**. Atau menu ⋮ → **Install A31 Board…**. Ada juga tombol **⬇ Install App** di app.
- Aplikasi terbuka di jendela sendiri (tanpa tab), muncul di Start Menu / Launchpad seperti app biasa.

### Android (Chrome)
- Buka URL → muncul banner **"Tambahkan ke layar utama"**, atau menu ⋮ → **Install app / Add to Home screen**.
- Ikon A31 Board muncul di home screen; dibuka fullscreen tanpa address bar.

### iPhone / iPad (Safari)
- Buka URL di **Safari** → tombol **Share (kotak panah)** → **Add to Home Screen** → Add.
  (iOS hanya mendukung install PWA lewat Safari.)

---

## Cara pakai singkat
- **Login Google** di layar pembuka → tugas langsung tersinkron di semua perangkat yang login akun sama.
- **+ Add Task** atau kolom "＋ Add task": ketik bahasa alami — `Bayar sewa !high besok #keuangan jam 09:00`
  otomatis jadi prioritas/tanggal/jam/tag.
- Klik **avatar** (pojok kiri atas) untuk **logout**.
- Tanpa jaringan pun app tetap jalan (offline-first); perubahan tersinkron begitu online.

## Kelola Folder (2 tingkat)
Struktur: **Folder induk → subfolder**. Tugas selalu berada di dalam **subfolder**.
- **Tambah folder induk**: tombol **＋** di kanan judul "LISTS", atau tombol **"＋ Folder induk baru"** di bawah daftar.
  Anda bisa punya banyak induk (mis. *New Life 3.0*, *Kerja KPC*, dst).
- **Tambah subfolder**: arahkan ke baris folder induk → klik **＋** yang muncul.
- **Edit** (ganti nama, pilih ikon, pilih warna, atau pindahkan subfolder ke induk lain):
  klik **⋯** pada baris folder/subfolder. Semua perubahan tersimpan otomatis.
- **Hapus**: buka editor (⋯) → **Hapus**. Menghapus induk ikut menghapus subfolder & tugas di dalamnya
  (ada konfirmasi dulu).
- **Lipat/buka** folder induk dengan panah **▾** di kirinya.
- Ganti mode papan ke **Folder** (segmented control atas) untuk melihat tiap subfolder sebagai kolom Kanban.

> Aplikasi selalu menjaga minimal 1 folder induk + 1 subfolder agar tugas punya tempat. Data lama
> (jika ada) otomatis dimigrasikan ke struktur baru saat pertama dibuka.


---

## Hosting alternatif (opsional)
Firebase Hosting adalah yang paling ringkas karena satu ekosistem dengan Auth+DB. Tapi file ini
statis, jadi bisa juga ditaruh di **GitHub Pages / Cloudflare Pages / Vercel** — cukup upload semua
file, pastikan HTTPS, dan tambahkan domain hosting itu ke **Authentication → Settings → Authorized
domains** di Firebase Console agar Google Login diizinkan.
