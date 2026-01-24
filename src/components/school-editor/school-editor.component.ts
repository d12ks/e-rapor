
import { Component, input, output, signal, effect, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchoolData } from '../../types';

@Component({
  selector: 'app-school-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white p-6 sm:p-8 rounded-lg shadow-md border-t-4 border-rapor-green text-gray-800">
      @if (editableSchool(); as schoolData) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          
          <!-- Kolom Kiri -->
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Nama Sekolah</label>
              <input type="text" class="form-input" [(ngModel)]="schoolData.namaSekolah" (ngModelChange)="onFormChange()">
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">NPSN</label>
              <input type="text" class="form-input" [(ngModel)]="schoolData.npsn" (ngModelChange)="onFormChange()">
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Alamat Sekolah</label>
              <textarea class="form-input min-h-[80px]" [(ngModel)]="schoolData.alamat" (ngModelChange)="onFormChange()"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Kelurahan</label>
                <input type="text" class="form-input" [(ngModel)]="schoolData.kelurahan" (ngModelChange)="onFormChange()">
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Kecamatan</label>
                <input type="text" class="form-input" [(ngModel)]="schoolData.kecamatan" (ngModelChange)="onFormChange()">
              </div>
            </div>
             <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Kabupaten/Kota</label>
                <input type="text" class="form-input" [(ngModel)]="schoolData.kabupaten" (ngModelChange)="onFormChange()">
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Provinsi</label>
                <input type="text" class="form-input" [(ngModel)]="schoolData.provinsi" (ngModelChange)="onFormChange()">
              </div>
            </div>
          </div>

          <!-- Kolom Kanan -->
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Website</label>
              <input type="text" class="form-input" [(ngModel)]="schoolData.website" (ngModelChange)="onFormChange()">
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Email</label>
              <input type="email" class="form-input" [(ngModel)]="schoolData.email" (ngModelChange)="onFormChange()">
            </div>
            
            <div class="pt-4 mt-4 border-t space-y-3">
              <h4 class="font-bold text-sm text-gray-700">Kepala Sekolah</h4>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-gray-600 mb-1">Nama</label>
                  <input type="text" class="form-input" [(ngModel)]="schoolData.kepalaSekolah" (ngModelChange)="onFormChange()">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-600 mb-1">NIP</label>
                  <input type="text" class="form-input" [(ngModel)]="schoolData.nipKepalaSekolah" (ngModelChange)="onFormChange()">
                </div>
              </div>
            </div>

            <div class="pt-4 mt-4 border-t space-y-3 bg-green-50 p-3 rounded">
              <h4 class="font-bold text-sm text-green-800">Wali Kelas (Tanda Tangan Rapor)</h4>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-green-700 mb-1">Nama</label>
                  <input type="text" class="form-input" [(ngModel)]="schoolData.waliKelas" (ngModelChange)="onFormChange()">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-green-700 mb-1">NIP</label>
                  <input type="text" class="form-input" [(ngModel)]="schoolData.nipWaliKelas" (ngModelChange)="onFormChange()">
                </div>
              </div>
            </div>

             <div class="pt-4 mt-4 border-t">
               <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Tanggal Rapor</label>
                <!-- Binding ke onDateChange untuk otomatisasi tanda petik -->
                <input type="text" class="form-input" [ngModel]="schoolData.tglRapor" (ngModelChange)="onDateChange($event)" placeholder="Contoh: 20 Desember 2025">
                <p class="text-[10px] text-gray-400 mt-1">*Sistem otomatis menambahkan tanda petik (') agar format tidak berubah di Excel.</p>
              </div>
             </div>
          </div>
        </div>
      } @else {
        <p class="text-center text-gray-500">Memuat data sekolah...</p>
      }
    </div>
  `,
  styles: [`
    .form-input {
      width: 100%;
      background-color: white;
      color: black;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      transition: all 0.2s ease-in-out;
    }
    .form-input:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(74, 124, 54, 0.4);
      border-color: #4a7c36;
    }
  `]
})
export class SchoolEditorComponent {
  school = input.required<SchoolData>();
  schoolChange = output<SchoolData>();
  
  editableSchool: WritableSignal<SchoolData | null> = signal(null);

  constructor() {
    effect(() => {
      this.editableSchool.set(structuredClone(this.school()));
    });
  }

  onFormChange() {
    const currentData = this.editableSchool();
    if (currentData) {
      this.schoolChange.emit(currentData);
    }
  }

  onDateChange(value: string) {
    const currentData = this.editableSchool();
    if (currentData) {
       // Logika otomatis tambah petik satu jika belum ada
       if (value && !value.startsWith("'")) {
          currentData.tglRapor = "'" + value;
       } else {
          currentData.tglRapor = value;
       }
       this.schoolChange.emit(currentData);
    }
  }
}
