# 🔧 PinjamKu — Sistem Peminjaman Alat Kerja (Progressive Web App)

PinjamKu adalah aplikasi modern berbasis Progressive Web App (PWA) untuk mengelola simpan-pinjam alat kerja / perkakas (seperti kunci inggris, kunci pas, kunci ring, kunci sok, dll.) di lingkungan workshop, bengkel, atau pabrik.

## 🌟 Fitur Utama
- 📷 **Scanner QR Code Nyata**: Scan barcode/QR pada fisik alat kerja untuk checkout instan.
- 👨‍💼 **Alur 2 Akun (Peminjam & Admin)**: Peminjam mengajukan pinjaman $\rightarrow$ Admin memverifikasi serah terima fisik.
- 📸 **Bukti Foto Serah Terima**: Admin memotret peminjam memegang alat saat pengambilan sebagai bukti fisik digital.
- ⚡ **Realtime Synchronization**: Status peminjaman ter-update secara instan di HP peminjam via Supabase Realtime WebSocket.
- 🛠️ **Manajemen Data Alat**: Mode Admin untuk menambah, mengedit, menghapus alat, dan mencetak stiker QR Code.
- 📱 **Progressive Web App (PWA)**: Dapat diinstall di home screen Android, iOS, dan Desktop tanpa melalui app store.
- ☁️ **Full Cloud 100% Free Tier**: Menggunakan Supabase (Database, Storage, Auth) dan Vercel.

---

## 🚀 Panduan Deploy ke Vercel (Auto-Deploy dari GitHub)

### 1. Push ke GitHub
```bash
git init
git add .
git commit -m "feat: PinjamKu PWA complete production version"
git branch -M main
git remote add origin https://github.com/USERNAME-ANDA/pinjamku-tool.git
git push -u origin main
```

### 2. Deploy di Vercel
1. Buka [Vercel Dashboard](https://vercel.com/) dan login dengan akun GitHub Anda.
2. Klik **"Add New..."** $\rightarrow$ **"Project"**.
3. Pilih repositori GitHub Anda (**pinjamku-tool**).
4. Di bagian **Environment Variables**, tambahkan:
   - `VITE_SUPABASE_URL` : `https://ooclgunuvtvckaxlugsg.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` : `sb_publishable_bP7oKDWlg30ysUX5LtIpWw_J7smqIPM`
5. Klik **Deploy**.
6. Aplikasi Anda akan langsung online dengan domain HTTPS (misal: `https://pinjamku-tool.vercel.app`)!

Setiap kali Anda melakukan `git push`, Vercel akan otomatis melakukan build dan update secara instan.
