
import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-app-guide',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" (click)="close.emit()">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col" (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="bg-rapor-green p-6 flex justify-between items-center sticky top-0 z-10 shadow-md">
          <div>
            <h2 class="text-2xl font-bold text-white flex items-center gap-2">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Panduan Sistem E-Rapor V2.2
            </h2>
            <p class="text-green-100 text-sm mt-1">Alur sistem aplikasi E-rapor: Mode Akses, Input Data, hingga Cetak.</p>
          </div>
          <button (click)="close.emit()" class="text-white hover:text-green-200 bg-white/10 hover:bg-white/20 p-2 rounded-full transition">
             <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 md:p-8 space-y-8 bg-gray-50">

          <!-- Step 1: Mode Akses -->
          <div class="flex gap-4 md:gap-6">
            <div class="flex-shrink-0 flex flex-col items-center">
               <div class="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">1</div>
               <div class="h-full w-1 bg-green-200 mt-2 rounded"></div>
            </div>
            <div class="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex-1">
               <h3 class="font-bold text-lg text-gray-800 mb-2">Pilih Mode Akses & Login</h3>
               <p class="text-sm text-gray-600 mb-3">
                 Sebelum login, Anda <strong>wajib</strong> memilih salah satu mode di panel sebelah kiri:
               </p>
               <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="bg-blue-50 border border-blue-200 p-3 rounded">
                    <strong class="text-blue-800 block mb-1">A. Buka File Lama</strong>
                    <p class="text-xs text-blue-700">Pilih ini jika Anda ingin melanjutkan pengisian rapor yang sudah pernah dibuat sebelumnya.</p>
                  </div>
                  <div class="bg-yellow-50 border border-yellow-200 p-3 rounded">
                    <strong class="text-yellow-800 block mb-1">B. Buat File Baru</strong>
                    <p class="text-xs text-yellow-700">Pilih ini untuk semester/kelas baru. Anda wajib memilih Kelas, Jurusan, dan Tahun Ajaran.</p>
                  </div>
               </div>
            </div>
          </div>

          <!-- Step 2: Database / History -->
          <div class="flex gap-4 md:gap-6">
            <div class="flex-shrink-0 flex flex-col items-center">
               <div class="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">2</div>
               <div class="h-full w-1 bg-green-200 mt-2 rounded"></div>
            </div>
            <div class="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex-1">
               <h3 class="font-bold text-lg text-gray-800 mb-2">Manajemen File Database</h3>
               <ul class="list-disc list-inside text-sm text-gray-600 space-y-2">
                 <li>
                   <strong>Jika mode "Buka File Lama":</strong> Setelah login berhasil, sistem akan otomatis menampilkan daftar <strong>Riwayat File</strong>. Klik tombol "Buka File" pada data yang ingin diedit.
                 </li>
                 <li>
                   <strong>Jika mode "Buat File Baru":</strong> Sistem akan otomatis membuat file Spreadsheet baru di Google Drive dan langsung membukanya di aplikasi.
                 </li>
               </ul>
            </div>
          </div>

          <!-- Step 3: Data Sekolah -->
          <div class="flex gap-4 md:gap-6">
            <div class="flex-shrink-0 flex flex-col items-center">
               <div class="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">3</div>
               <div class="h-full w-1 bg-green-200 mt-2 rounded"></div>
            </div>
            <div class="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex-1">
               <h3 class="font-bold text-lg text-gray-800 mb-2">Input Data Sekolah</h3>
               <p class="text-sm text-gray-600 mb-2">
                 Masuk ke menu <strong>Data Sekolah</strong>.
               </p>
               <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                 <li>Pastikan data <strong>Kepala Sekolah</strong> dan <strong>Wali Kelas</strong> sudah benar (NIP & Nama).</li>
                 <li>Isi <strong>Tanggal Rapor</strong>. Data ini akan muncul di bagian tanda tangan cetakan rapor.</li>
               </ul>
            </div>
          </div>

          <!-- Step 4: Data Siswa -->
          <div class="flex gap-4 md:gap-6">
            <div class="flex-shrink-0 flex flex-col items-center">
               <div class="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">4</div>
               <div class="h-full w-1 bg-green-200 mt-2 rounded"></div>
            </div>
            <div class="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex-1">
               <h3 class="font-bold text-lg text-gray-800 mb-2">Input Data Siswa</h3>
               <p class="text-sm text-gray-600 mb-3">
                 Masuk ke menu <strong>Data Siswa</strong>.
               </p>
               <div class="bg-gray-50 border p-3 rounded text-sm text-gray-700">
                  <span class="font-bold text-green-700 block mb-1">Rekomendasi: Import Excel</span>
                  <ol class="list-decimal list-inside ml-2">
                    <li>Klik "Import Excel".</li>
                    <li>Download Template yang disediakan.</li>
                    <li>Copy-paste data siswa dari Dapodik/Excel lain ke Template tersebut.</li>
                    <li>Upload kembali file Template ke aplikasi.</li>
                    <li>Klik <strong>SIMPAN</strong>.</li>
                  </ol>
               </div>
            </div>
          </div>

          <!-- Step 5: Input Nilai -->
          <div class="flex gap-4 md:gap-6">
            <div class="flex-shrink-0 flex flex-col items-center">
               <div class="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">5</div>
               <div class="h-full w-1 bg-green-200 mt-2 rounded"></div>
            </div>
            <div class="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex-1">
               <h3 class="font-bold text-lg text-gray-800 mb-2">Input Leger Nilai</h3>
               <p class="text-sm text-gray-600 mb-2">
                 Masuk ke menu <strong>Leger Nilai</strong>.
               </p>
               <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                 <li>Pilih Nama Siswa di pojok kanan atas.</li>
                 <li>Isi Nilai Mapel Umum (A) dan Kejuruan (B).</li>
                 <li><strong>Wajib:</strong> Isi deskripsi "Capaian Kompetensi" agar rapor tidak kosong.</li>
                 <li>Isi kehadiran, PKL, dan Ekskul.</li>
                 <li>Klik tombol <strong>SIMPAN DATA</strong> (Warna Hijau) setiap selesai mengedit satu siswa atau sekelompok siswa untuk menyimpan ke server.</li>
               </ul>
            </div>
          </div>

          <!-- Step 6: Cetak -->
          <div class="flex gap-4 md:gap-6">
            <div class="flex-shrink-0 flex flex-col items-center">
               <div class="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">6</div>
            </div>
            <div class="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex-1">
               <h3 class="font-bold text-lg text-gray-800 mb-2">Cetak & Unduh Rapor</h3>
               <p class="text-sm text-gray-600 mb-2">
                 Gunakan menu <strong>Cetak & Unduh</strong> di Dashboard.
               </p>
               <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                 <li>Pilih elemen rapor (Cover, Identitas, atau Nilai Akademik).</li>
                 <li>Pilih siswa yang akan dicetak pada tampilan pratinjau.</li>
                 <li>Klik tombol <strong>Cetak / PDF</strong>.</li>
                 <li>Pilih Destination: <strong>Save as PDF</strong> di browser untuk menyimpan file PDF.</li>
               </ul>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="p-4 border-t bg-white flex justify-end">
           <button (click)="close.emit()" class="bg-rapor-green hover:bg-rapor-dark text-white px-6 py-2 rounded-lg font-bold shadow transition">
             Saya Mengerti
           </button>
        </div>

      </div>
    </div>
  `
})
export class AppGuideComponent {
  close = output<void>();
}
