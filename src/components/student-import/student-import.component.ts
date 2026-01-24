
import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Student } from '../../types';

declare var XLSX: any;

@Component({
  selector: 'app-student-import',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg" (click)="$event.stopPropagation()">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Import Data Siswa (.xlsx)</h2>

        <div class="space-y-4 text-sm text-gray-700">
            <div class="bg-green-50 border border-green-200 p-4 rounded-lg">
                <p class="font-bold text-green-800 mb-2">Langkah 1: Unduh Template</p>
                <p class="mb-3">Gunakan template ini untuk mempercepat input data siswa.</p>
                <button (click)="downloadTemplate()" class="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition">
                    Unduh Template Data Siswa.xlsx
                </button>
            </div>
            
            <div class="bg-green-50 border border-green-200 p-4 rounded-lg">
                <p class="font-bold text-green-800 mb-2">Langkah 2: Unggah File</p>
                <p class="mb-3">Pastikan format sesuai template hasil unduhan.</p>
                <button (click)="triggerFileInput()" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition flex items-center justify-center gap-2" [disabled]="isLoading()">
                  @if(isLoading()) {
                    <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                    <span>Memproses...</span>
                  } @else {
                    <span>Pilih File & Import</span>
                  }
                </button>
                <input type="file" #fileInput class="hidden" (change)="onFileSelected($event)" accept=".xlsx, .xls">
            </div>
        </div>

        @if(errorMessage()) {
            <p class="text-xs text-red-600 bg-red-50 p-3 rounded mt-4">{{ errorMessage() }}</p>
        }
        @if(successMessage()) {
            <p class="text-xs text-green-600 bg-green-50 p-3 rounded mt-4 border border-green-200">
               <strong>Berhasil!</strong> {{ successMessage() }}
               <br>Silakan klik tombol <strong>SIMPAN</strong> di bawah untuk menyimpan permanen ke server.
            </p>
        }

        <div class="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
            @if (!hasImported()) {
               <!-- Tombol Tutup Biasa (Sebelum Import) -->
               <button (click)="close.emit()" class="text-gray-600 hover:text-gray-800 hover:bg-gray-100 font-medium px-4 py-2 rounded transition">
                  Batal / Tutup
               </button>
            } @else {
               <!-- Tombol Simpan & Tutup (Setelah Import Berhasil) -->
               <button (click)="saveAndClose()" class="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded shadow-lg transition flex items-center gap-2 animate-pulse">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                  SIMPAN
               </button>
            }
        </div>
      </div>
    </div>
  `,
})
export class StudentImportComponent {
  studentsImported = output<Partial<Student>[]>();
  requestSave = output<void>(); // Event baru untuk minta save ke dashboard
  close = output<void>();

  isLoading = signal(false);
  hasImported = signal(false); // Track status import
  errorMessage = signal('');
  successMessage = signal('');

  triggerFileInput() {
    (document.querySelector('input[type=file]') as HTMLInputElement)?.click();
  }
  
  saveAndClose() {
    this.requestSave.emit();
    // Kita biarkan dashboard yang menutup modal setelah proses save dimulai/selesai
    // tapi untuk UI responsif, kita bisa emit close juga jika save bersifat async fire-and-forget di parent
    this.close.emit(); 
  }

  downloadTemplate() {
    // UPDATED: Urutan kolom disamakan dengan Data_Siswa di Google Sheet (GAS)
    const headers = [
      'NISN', 
      'Nama_Lengkap', 
      'Jenis_Kelamin', 
      'Tempat_Lahir', 
      'Tanggal_Lahir', 
      'Agama', 
      'Status_Keluarga', 
      'Anak_Ke', 
      'Alamat_Siswa', 
      'No_Telp',
      'Sekolah_Asal', 
      'Diterima_Kelas', 
      'Diterima_Tanggal',
      'Nama_Ayah', 
      'Nama_Ibu', 
      'Pekerjaan_Ayah', 
      'Pekerjaan_Ibu', 
      'Alamat_Ortu', 
      'Telp_Ortu',
      'Nama_Wali', 
      'Pekerjaan_Wali', 
      'Alamat_Wali', 
      'Telp_Wali',
      'Kelas', 
      'Fase', 
      'Jurusan'
    ];
    
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DataSiswa');
    XLSX.writeFile(wb, 'Template_eRapor_Data_Siswa.xlsx');
  }

  onFileSelected(event: Event) {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.hasImported.set(false);

    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) {
      this.isLoading.set(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet);

        const mappedStudents: Partial<Student>[] = json.map(row => ({
          nisn: String(row['NISN'] || ''),
          name: String(row['Nama_Lengkap'] || ''),
          
          jenisKelamin: (String(row['Jenis_Kelamin'] || '')).toUpperCase().startsWith('L') ? 'Laki-laki' : 'Perempuan',
          tempatLahir: String(row['Tempat_Lahir'] || ''),
          tanggalLahir: String(row['Tanggal_Lahir'] || ''),
          agama: String(row['Agama'] || ''),
          statusKeluarga: String(row['Status_Keluarga'] || ''),
          anakKe: String(row['Anak_Ke'] || ''),
          alamat: String(row['Alamat_Siswa'] || ''),
          telp: String(row['No_Telp'] || ''),
          sekolahAsal: String(row['Sekolah_Asal'] || ''),
          diterimaKelas: String(row['Diterima_Kelas'] || ''),
          diterimaTanggal: String(row['Diterima_Tanggal'] || ''),
          namaAyah: String(row['Nama_Ayah'] || ''),
          namaIbu: String(row['Nama_Ibu'] || ''),
          pekerjaanAyah: String(row['Pekerjaan_Ayah'] || ''),
          pekerjaanIbu: String(row['Pekerjaan_Ibu'] || ''),
          alamatOrangTua: String(row['Alamat_Ortu'] || ''),
          telpOrangTua: String(row['Telp_Ortu'] || ''),
          namaWali: String(row['Nama_Wali'] || ''),
          pekerjaanWali: String(row['Pekerjaan_Wali'] || ''),
          alamatWali: String(row['Alamat_Wali'] || ''),
          telpWali: String(row['Telp_Wali'] || ''),
          kelas: String(row['Kelas'] || ''),
          fase: String(row['Fase'] || ''),
          jurusan: String(row['Jurusan'] || ''),
        }));
        
        this.studentsImported.emit(mappedStudents);
        this.hasImported.set(true); // Aktifkan tombol Simpan
        this.successMessage.set(`${mappedStudents.length} siswa berhasil dibaca.`);
      } catch (err) {
        this.errorMessage.set('Gagal membaca file. Pastikan format file dan header kolom sudah benar sesuai template.');
        console.error(err);
      } finally {
        this.isLoading.set(false);
        target.value = ''; 
      }
    };
    reader.readAsArrayBuffer(file);
  }
}
