
import { Component, input, output, signal, effect, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Student } from '../../types';

@Component({
  selector: 'app-student-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white p-6 sm:p-8 rounded-lg shadow-md border-t-4 border-rapor-green text-gray-800">
      @if (editableStudent(); as student) {
        
        <div class="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
           <div class="flex items-center gap-2 text-gray-500">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              <span class="text-sm font-semibold">Editing: <span class="text-black uppercase">{{ student.name }}</span></span>
           </div>
           <button (click)="onDelete()" class="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded text-xs font-bold transition flex items-center gap-2 border border-red-200">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              Hapus Siswa
           </button>
        </div>

        <form class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          
          <!-- Kolom Kiri: Data Siswa & Sekolah Asal -->
          <div class="space-y-6">
            <fieldset class="space-y-4 p-4 border rounded">
              <legend class="px-2 font-bold text-gray-700 text-sm">A. Keterangan Pribadi Siswa</legend>
              <div>
                <label class="label">Nama Lengkap Siswa</label>
                <input type="text" class="form-input uppercase" [(ngModel)]="student.name" name="name" (ngModelChange)="onFormChange()">
              </div>
              <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="label">NISN</label>
                    <input type="text" class="form-input" [(ngModel)]="student.nisn" name="nisn" (ngModelChange)="onFormChange()">
                  </div>
                  <div>
                    <label class="label">Jenis Kelamin</label>
                    <select class="form-input" [(ngModel)]="student.jenisKelamin" name="jenisKelamin" (ngModelChange)="onFormChange()">
                        <option>Laki-laki</option>
                        <option>Perempuan</option>
                    </select>
                  </div>
              </div>

              <!-- NEW FIELDS -->
              <div class="bg-green-50 p-3 rounded border border-green-100">
                 <div class="grid grid-cols-3 gap-3">
                    <div class="col-span-1">
                        <label class="label text-green-800">Kelas</label>
                        <input type="text" class="form-input" placeholder="X TJKT 1" [(ngModel)]="student.kelas" name="kelas" (ngModelChange)="onFormChange()">
                    </div>
                    <div class="col-span-1">
                        <label class="label text-green-800">Fase</label>
                        <select class="form-input" [(ngModel)]="student.fase" name="fase" (ngModelChange)="onFormChange()">
                            <option value="E">E</option>
                            <option value="F">F</option>
                        </select>
                    </div>
                    <div class="col-span-1">
                        <label class="label text-green-800">Jurusan</label>
                        <input type="text" class="form-input" placeholder="TJKT" [(ngModel)]="student.jurusan" name="jurusan" (ngModelChange)="onFormChange()">
                    </div>
                 </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="label">Tempat Lahir</label>
                  <input type="text" class="form-input" [(ngModel)]="student.tempatLahir" name="tempatLahir" (ngModelChange)="onFormChange()">
                </div>
                <div>
                  <label class="label">Tanggal Lahir</label>
                  <input type="text" class="form-input" placeholder="Contoh: 10 Januari 2008" [(ngModel)]="student.tanggalLahir" name="tanggalLahir" (ngModelChange)="onFormChange()">
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="label">Agama</label>
                  <input type="text" class="form-input" [(ngModel)]="student.agama" name="agama" (ngModelChange)="onFormChange()">
                </div>
                <div>
                  <label class="label">Anak Ke-</label>
                  <input type="text" class="form-input" [(ngModel)]="student.anakKe" name="anakKe" (ngModelChange)="onFormChange()">
                </div>
              </div>

              <div>
                <label class="label">Alamat Siswa</label>
                <textarea class="form-input" [(ngModel)]="student.alamat" name="alamat" (ngModelChange)="onFormChange()"></textarea>
              </div>
              <div>
                  <label class="label">No Telp Siswa</label>
                  <input type="text" class="form-input" [(ngModel)]="student.telp" name="telp" (ngModelChange)="onFormChange()">
              </div>
            </fieldset>

            <fieldset class="space-y-4 p-4 border rounded">
              <legend class="px-2 font-bold text-gray-700 text-sm">B. Keterangan Sekolah Asal</legend>
              <div>
                <label class="label">Sekolah Asal</label>
                <input type="text" class="form-input" [(ngModel)]="student.sekolahAsal" name="sekolahAsal" (ngModelChange)="onFormChange()">
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="label">Diterima di Kelas</label>
                  <input type="text" class="form-input" [(ngModel)]="student.diterimaKelas" name="diterimaKelas" (ngModelChange)="onFormChange()">
                </div>
                <div>
                  <label class="label">Pada Tanggal</label>
                  <input type="text" class="form-input" placeholder="Contoh: 10 Juli 2024" [(ngModel)]="student.diterimaTanggal" name="diterimaTanggal" (ngModelChange)="onFormChange()">
                </div>
              </div>
            </fieldset>
          </div>

          <!-- Kolom Kanan: Data Ortu & Wali -->
          <div class="space-y-6">
            <fieldset class="space-y-4 p-4 border rounded">
              <legend class="px-2 font-bold text-gray-700 text-sm">C. Keterangan Orang Tua</legend>
              <div class="grid grid-cols-2 gap-4">
                 <div>
                    <label class="label">Nama Ayah</label>
                    <input type="text" class="form-input" [(ngModel)]="student.namaAyah" name="namaAyah" (ngModelChange)="onFormChange()">
                 </div>
                 <div>
                    <label class="label">Nama Ibu</label>
                    <input type="text" class="form-input" [(ngModel)]="student.namaIbu" name="namaIbu" (ngModelChange)="onFormChange()">
                 </div>
              </div>
               <div class="grid grid-cols-2 gap-4">
                 <div>
                    <label class="label">Pekerjaan Ayah</label>
                    <input type="text" class="form-input" [(ngModel)]="student.pekerjaanAyah" name="pekerjaanAyah" (ngModelChange)="onFormChange()">
                 </div>
                 <div>
                    <label class="label">Pekerjaan Ibu</label>
                    <input type="text" class="form-input" [(ngModel)]="student.pekerjaanIbu" name="pekerjaanIbu" (ngModelChange)="onFormChange()">
                 </div>
              </div>
              <div>
                <label class="label">Alamat Orang Tua</label>
                <textarea class="form-input" [(ngModel)]="student.alamatOrangTua" name="alamatOrangTua" (ngModelChange)="onFormChange()"></textarea>
              </div>
              <div>
                  <label class="label">No Telp Ortu</label>
                  <input type="text" class="form-input" [(ngModel)]="student.telpOrangTua" name="telpOrangTua" (ngModelChange)="onFormChange()">
              </div>
              
              <!-- TANDA TANGAN SECTION (Fixes the dots issue) -->
              <div class="col-span-2 pt-4 border-t border-gray-200 mt-2 bg-yellow-50 p-3 rounded">
                  <div class="flex justify-between items-end mb-1">
                      <label class="label text-yellow-800">Nama Orang Tua (Tanda Tangan Rapor)</label>
                      <button (click)="copyFatherName()" type="button" class="text-[10px] text-blue-600 hover:underline font-bold flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>
                        Salin dari Nama Ayah
                      </button>
                  </div>
                  <input type="text" class="form-input font-bold border-yellow-300 focus:border-yellow-500 focus:ring-yellow-200" 
                         [(ngModel)]="student.parentName" 
                         name="parentName" 
                         (ngModelChange)="onFormChange()"
                         placeholder="Wajib diisi agar tidak muncul titik-titik di rapor">
              </div>

            </fieldset>
            
            <fieldset class="space-y-4 p-4 border rounded">
              <legend class="px-2 font-bold text-gray-700 text-sm">D. Keterangan Wali (opsional)</legend>
              <div>
                <label class="label">Nama Wali</label>
                <input type="text" class="form-input" [(ngModel)]="student.namaWali" name="namaWali" (ngModelChange)="onFormChange()">
              </div>
              <div>
                <label class="label">Pekerjaan Wali</label>
                <input type="text" class="form-input" [(ngModel)]="student.pekerjaanWali" name="pekerjaanWali" (ngModelChange)="onFormChange()">
              </div>
              <div>
                <label class="label">Alamat Wali</label>
                <textarea class="form-input" [(ngModel)]="student.alamatWali" name="alamatWali" (ngModelChange)="onFormChange()"></textarea>
              </div>
              <div>
                  <label class="label">No Telp Wali</label>
                  <input type="text" class="form-input" [(ngModel)]="student.telpWali" name="telpWali" (ngModelChange)="onFormChange()">
              </div>
            </fieldset>

          </div>
        </form>
      } @else {
        <p class="text-center text-gray-500">Memuat data siswa...</p>
      }
    </div>
  `,
  styles: [`
    .form-input, textarea {
      width: 100%;
      background-color: white;
      color: black;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      transition: all 0.2s ease-in-out;
    }
    .form-input:focus, textarea:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(74, 124, 54, 0.4);
      border-color: #4a7c36;
    }
    .label {
      display: block;
      text-transform: uppercase;
      font-size: 10px;
      font-weight: 600;
      color: #4b5563;
      margin-bottom: 4px;
    }
  `]
})
export class StudentEditorComponent {
  student = input.required<Student>();
  studentChange = output<Student>();
  delete = output<number>();
  
  editableStudent: WritableSignal<Student | null> = signal(null);

  constructor() {
    effect(() => {
      this.editableStudent.set(structuredClone(this.student()));
    });
  }

  onFormChange() {
    const currentData = this.editableStudent();
    if (currentData) {
      this.studentChange.emit(currentData);
    }
  }

  // New Helper Function to fix the dots issue quickly
  copyFatherName() {
    const s = this.editableStudent();
    if (s) {
       s.parentName = s.namaAyah;
       this.onFormChange();
    }
  }

  onDelete() {
    const s = this.editableStudent();
    if (s && confirm(`Apakah Anda yakin ingin menghapus data siswa: ${s.name}? Data yang dihapus belum permanen sebelum Anda menekan tombol SIMPAN DATA.`)) {
      this.delete.emit(s.id);
    }
  }
}
