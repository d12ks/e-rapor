
import { Component, input, output, signal, effect, WritableSignal, inject, computed, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Student } from '../../types';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-leger-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
    
    <!-- Header Semester Info -->
    <div class="bg-green-50 border-l-4 border-green-500 p-4 mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h3 class="font-bold text-green-800">
           Input Nilai - Semester {{ reportService.schoolData().semester }}
        </h3>
        <p class="text-sm text-green-700">Tahun Pelajaran: {{ reportService.schoolData().tahunAjaran }}</p>
      </div>
      
      <!-- Competency DB Status Panel -->
      <div class="flex flex-col items-end gap-1">
         <div class="flex items-center gap-2">
            <span class="text-xs font-semibold" 
               [class.text-green-600]="reportService.isMasterDataLoaded()" 
               [class.text-red-500]="!reportService.isMasterDataLoaded()">
               <span class="inline-block w-2 h-2 rounded-full mr-1" [class.bg-green-500]="reportService.isMasterDataLoaded()" [class.bg-red-500]="!reportService.isMasterDataLoaded()"></span>
               {{ reportService.isMasterDataLoaded() ? 'Database Capaian: Terhubung' : 'Database Capaian: Tidak Terhubung' }}
            </span>
            <div class="flex gap-1">
                <button (click)="refreshDB()" class="text-[10px] bg-white border border-gray-300 hover:bg-gray-100 px-2 py-0.5 rounded text-gray-600 flex items-center gap-1 transition" title="Coba hubungkan ulang database master">
                   <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                   Refresh
                </button>
                <button (click)="clearCacheAndReload()" class="text-[10px] bg-red-50 border border-red-200 hover:bg-red-100 px-2 py-0.5 rounded text-red-600 flex items-center gap-1 transition" title="Hapus cache dan ambil ulang data terbaru">
                   <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                   Hapus Cache
                </button>
            </div>
         </div>
         <div class="text-[10px] text-green-600 italic text-right max-w-xs">
           *Jika terhubung, capaian kompetensi akan terisi otomatis saat nama mapel diketik.
         </div>
      </div>
    </div>
    
    <!-- INFO KHUSUS GURU MAPEL (NEW LABEL) -->
    @if (isGuruMapel()) {
       <div class="bg-blue-100 border-l-4 border-blue-500 text-blue-900 p-4 mb-4 rounded-r shadow-sm animate-fade-in" role="alert">
         <div class="flex items-center gap-3">
            <div class="p-2 bg-blue-200 rounded-full text-blue-700">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
               <p class="font-bold text-sm">Info Guru Mapel</p>
               <p class="text-sm mt-1">
                 Anda dapat menginput <strong>Nilai</strong> dan mengedit <strong>Capaian Kompetensi</strong> untuk mata pelajaran: 
                 <span class="font-bold underline">{{ reportService.userSubjects().join(', ') || '...' }}</span>.
               </p>
            </div>
         </div>
       </div>
    }

    @if (editableStudent(); as studentData) {
      <!-- Nilai Akademik -->
      <div class="bg-white p-6 rounded-lg shadow-md border-t-4 border-rapor-green">
        <h3 class="text-lg font-bold text-gray-800 mb-4 border-b pb-2 flex justify-between items-center">
            <span>A. Nilai Akademik: <span class="uppercase text-green-700">{{ studentData.name }}</span></span>
        </h3>
        
        <!-- KELOMPOK A -->
        <fieldset class="p-4 border rounded mb-4">
            <legend class="px-2 font-bold text-gray-700 text-sm flex justify-between items-center w-full">
              <span>Kelompok Mata Pelajaran Umum</span>
              <div class="flex gap-2">
                <button (click)="addSubject('A')" class="btn-add" [disabled]="isGuruMapel()">
                  + Mapel
                </button>
              </div>
            </legend>
            <div class="space-y-3 pt-2">
              @for (sub of studentData.subjectsA; track $index; let i = $index) {
                <div class="grid grid-cols-[30px_1fr_90px_1fr_40px] gap-2 items-start p-2 rounded hover:bg-gray-50 group border-b border-gray-100 last:border-0">
                    <span class="text-gray-400 font-semibold text-xs mt-2 text-center">{{ i + 1 }}.</span>
                    
                    <!-- Nama Mapel: Hanya Wali Kelas yang bisa edit nama -->
                    <div>
                        <input type="text" class="form-input font-medium" placeholder="Nama Mapel" 
                            [(ngModel)]="sub.name" 
                            (ngModelChange)="onFormChange()" 
                            [disabled]="isGuruMapel()"> 
                    </div>

                    <!-- Nilai: Wali Kelas OR Guru Mapel (jika mapelnya sesuai) -->
                    <div>
                        <input type="number" class="form-input text-center font-bold" placeholder="0" 
                            [(ngModel)]="sub.score" 
                            (ngModelChange)="onFormChange()" 
                            [disabled]="isGuruMapel() && !reportService.canEditSubject(sub.name)">
                    </div>

                    <!-- Capaian: Wali Kelas OR Guru Mapel (jika mapelnya sesuai) -->
                    <div>
                        <textarea class="form-input text-xs min-h-[40px]" placeholder="Capaian Kompetensi..." 
                            [(ngModel)]="sub.competency" 
                            (ngModelChange)="onFormChange()" 
                            [disabled]="isGuruMapel() && !reportService.canEditSubject(sub.name)"></textarea>
                    </div>

                    <!-- Hapus -->
                    <div class="flex justify-center pt-1">
                        <button (click)="removeSubject('A', i)" class="btn-remove group-hover:opacity-100" [disabled]="isGuruMapel()" tabindex="-1">×</button>
                    </div>
                </div>
              }
              @if (studentData.subjectsA.length === 0) {
                  <div class="text-center py-4 text-gray-400 text-xs italic bg-gray-50 rounded border border-dashed border-gray-200">
                    Belum ada mata pelajaran umum. Klik "+ Mapel" untuk menambah.
                  </div>
              }
            </div>
        </fieldset>

        <!-- KELOMPOK B -->
        <fieldset class="p-4 border rounded">
            <legend class="px-2 font-bold text-gray-700 text-sm flex justify-between items-center w-full">
              <span>Kelompok Mata Pelajaran Kejuruan</span>
              <div class="flex gap-2">
                <button (click)="addSubject('B')" class="btn-add" [disabled]="isGuruMapel()">
                  + Mapel
                </button>
              </div>
            </legend>
            <div class="space-y-3 pt-2">
              @for (sub of studentData.subjectsB; track $index; let i = $index) {
                <div class="grid grid-cols-[30px_1fr_90px_1fr_40px] gap-2 items-start p-2 rounded hover:bg-gray-50 group border-b border-gray-100 last:border-0">
                    <span class="text-gray-400 font-semibold text-xs mt-2 text-center">{{ i + 1 }}.</span>
                    
                     <!-- Nama Mapel -->
                    <div>
                        <input type="text" class="form-input font-medium" placeholder="Nama Mapel" 
                            [(ngModel)]="sub.name" 
                            (ngModelChange)="onFormChange()" 
                            [disabled]="isGuruMapel()">
                    </div>

                    <!-- Nilai -->
                    <div>
                        <input type="number" class="form-input text-center font-bold" placeholder="0" 
                            [(ngModel)]="sub.score" 
                            (ngModelChange)="onFormChange()" 
                            [disabled]="isGuruMapel() && !reportService.canEditSubject(sub.name)">
                    </div>

                    <!-- Capaian -->
                    <div>
                        <textarea class="form-input text-xs min-h-[40px]" placeholder="Capaian Kompetensi..." 
                            [(ngModel)]="sub.competency" 
                            (ngModelChange)="onFormChange()" 
                            [disabled]="isGuruMapel() && !reportService.canEditSubject(sub.name)"></textarea>
                    </div>

                    <div class="flex justify-center pt-1">
                        <button (click)="removeSubject('B', i)" class="btn-remove group-hover:opacity-100" [disabled]="isGuruMapel()" tabindex="-1">×</button>
                    </div>
                </div>
              }
              @if (studentData.subjectsB.length === 0) {
                  <div class="text-center py-4 text-gray-400 text-xs italic bg-gray-50 rounded border border-dashed border-gray-200">
                    Belum ada mata pelajaran kejuruan. Klik "+ Mapel" untuk menambah.
                  </div>
              }
            </div>
        </fieldset>
      </div>
      
      <!-- PKL & Ekstrakurikuler -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- PKL -->
        <div class="bg-white p-6 rounded-lg shadow-md">
          <fieldset class="border-t-4 border-green-500 -m-6 p-6" [disabled]="isGuruMapel()">
            <legend class="px-2 font-bold text-gray-800 text-lg flex justify-between items-center w-full">
              <span>B. Praktik Kerja Lapangan</span>
              <button (click)="addPKL()" class="btn-add" [disabled]="isGuruMapel()">+ Tambah PKL</button>
            </legend>
            <div class="space-y-4 pt-4">
              @for (pkl of studentData.pkl; track $index; let i = $index) {
                <div class="p-3 border rounded hover:bg-gray-50 group relative bg-gray-50">
                   <button (click)="removePKL(i)" class="btn-remove group-hover:opacity-100 absolute top-1 right-1" [disabled]="isGuruMapel()">×</button>
                   <div class="grid grid-cols-2 gap-3">
                     <div class="col-span-2">
                        <label class="text-[10px] uppercase text-gray-500 font-bold">Mitra DU/DI</label>
                        <input type="text" class="form-input" placeholder="Nama Mitra" [(ngModel)]="pkl.mitra" (ngModelChange)="onFormChange()">
                     </div>
                     <div class="col-span-2">
                        <label class="text-[10px] uppercase text-gray-500 font-bold">Lokasi</label>
                        <input type="text" class="form-input" placeholder="Alamat Lokasi" [(ngModel)]="pkl.lokasi" (ngModelChange)="onFormChange()">
                     </div>
                     <div>
                        <label class="text-[10px] uppercase text-gray-500 font-bold">Lama (Bulan)</label>
                        <input type="text" class="form-input" placeholder="Contoh: 3 Bulan" [(ngModel)]="pkl.lama" (ngModelChange)="onFormChange()">
                     </div>
                     <div>
                        <label class="text-[10px] uppercase text-gray-500 font-bold">Keterangan</label>
                        <input type="text" class="form-input" placeholder="-" [(ngModel)]="pkl.keterangan" (ngModelChange)="onFormChange()">
                     </div>
                   </div>
                </div>
              }
            </div>
          </fieldset>
        </div>
        <!-- Ekstrakurikuler -->
        <div class="bg-white p-6 rounded-lg shadow-md">
           <fieldset class="border-t-4 border-purple-500 -m-6 p-6" [disabled]="isGuruMapel()">
            <legend class="px-2 font-bold text-gray-800 text-lg flex justify-between items-center w-full">
              <span>C. Ekstrakurikuler</span>
              <button (click)="addExtra()" class="btn-add" [disabled]="isGuruMapel()">+ Tambah Ekskul</button>
            </legend>
            <div class="space-y-4 pt-4">
               @for (ex of studentData.extras; track $index; let i = $index) {
                <div class="p-3 border rounded hover:bg-gray-50 group relative bg-gray-50">
                   <button (click)="removeExtra(i)" class="btn-remove group-hover:opacity-100 absolute top-1 right-1" [disabled]="isGuruMapel()">×</button>
                   <div class="space-y-3">
                     <div class="grid grid-cols-[1fr_100px] gap-3">
                        <div>
                            <label class="text-[10px] uppercase text-gray-500 font-bold">Nama Kegiatan</label>
                            <input type="text" class="form-input" placeholder="Contoh: PRAMUKA" [(ngModel)]="ex.name" (ngModelChange)="onFormChange()">
                        </div>
                        <div>
                            <label class="text-[10px] uppercase text-gray-500 font-bold">Nilai</label>
                            <input type="text" class="form-input" placeholder="A/B" [(ngModel)]="ex.grade" (ngModelChange)="onFormChange()">
                        </div>
                     </div>
                     <div>
                        <label class="text-[10px] uppercase text-gray-500 font-bold">Deskripsi</label>
                        <textarea class="form-input text-xs" placeholder="Keterangan..." [(ngModel)]="ex.description" (ngModelChange)="onFormChange()"></textarea>
                     </div>
                   </div>
                </div>
              }
            </div>
          </fieldset>
        </div>
      </div>

      <!-- Catatan & Absensi -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-lg shadow-md">
           <fieldset [disabled]="isGuruMapel()">
             <h3 class="text-lg font-bold text-gray-800 mb-4">D. Catatan & Kenaikan Kelas</h3>
             <div class="space-y-4">
               <div>
                 <div class="flex justify-between items-end mb-1">
                    <label class="form-label">Catatan Akademik Wali Kelas</label>
                    <button (click)="generateAutoNote(studentData)" class="text-[10px] bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition flex items-center gap-1" title="Buat catatan otomatis berdasarkan rata-rata nilai">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        Buat Otomatis
                    </button>
                 </div>
                 <textarea class="form-input min-h-[80px]" [(ngModel)]="studentData.academicNote" (ngModelChange)="onFormChange()"></textarea>
               </div>
               
               @if (reportService.schoolData().semester === 'Genap') {
                 <div class="p-3 bg-orange-50 border border-orange-200 rounded">
                   <label class="form-label text-orange-800">Keputusan Kenaikan/Kelulusan (Khusus Semester Genap)</label>
                   <input type="text" class="form-input" placeholder="Naik ke kelas XI / Lulus" [(ngModel)]="studentData.note_naik" (ngModelChange)="onFormChange()">
                 </div>
               }
             </div>
           </fieldset>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-md">
           <fieldset [disabled]="isGuruMapel()">
             <h3 class="text-lg font-bold text-gray-800 mb-4">E. Ketidakhadiran</h3>
             <div class="flex items-center gap-4">
               <div class="flex-1">
                 <label class="form-label">Sakit</label>
                 <input type="text" class="form-input text-center" [(ngModel)]="studentData.attendance.sakit" (ngModelChange)="onFormChange()">
               </div>
               <div class="flex-1">
                 <label class="form-label">Izin</label>
                 <input type="text" class="form-input text-center" [(ngModel)]="studentData.attendance.izin" (ngModelChange)="onFormChange()">
               </div>
               <div class="flex-1">
                 <label class="form-label">Tanpa Keterangan</label>
                 <input type="text" class="form-input text-center" [(ngModel)]="studentData.attendance.alpha" (ngModelChange)="onFormChange()">
               </div>
             </div>
           </fieldset>
        </div>
      </div>
    }
    </div>
  `,
  styles: [`
    .form-input {
      width: 100%; background-color: white; color: black;
      border: 1px solid #d1d5db; border-radius: 0.375rem;
      padding: 0.5rem 0.75rem; font-size: 0.875rem;
      transition: all 0.2s ease-in-out;
    }
    .form-input:focus {
      outline: none; box-shadow: 0 0 0 2px rgba(74, 124, 54, 0.4); border-color: #4a7c36;
    }
    .form-input:disabled {
      background-color: #f3f4f6; color: #6b7280; cursor: not-allowed;
    }
    .form-label {
      display: block; font-size: 0.75rem; font-weight: 600; color: #4b5563; margin-bottom: 0.25rem;
    }
    .btn-add {
      background-color: #3b82f6; color: white; padding: 4px 10px;
      border-radius: 4px; font-size: 11px; font-weight: bold;
      transition: background-color 0.2s;
    }
    .btn-add:hover { background-color: #2563eb; }
    .btn-add:disabled { background-color: #9ca3af; cursor: not-allowed; }
    .btn-remove {
      background-color: #fee2e2; color: #dc2626; border-radius: 999px;
      width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
      font-weight: bold; font-size: 1rem; transition: all 0.2s; opacity: 0;
    }
    .btn-remove:hover { background-color: #dc2626; color: white; }
    .btn-remove:disabled { display: none; }
    
    @keyframes fadeIn {
       from { opacity: 0; transform: translateY(-5px); }
       to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
       animation: fadeIn 0.3s ease-out forwards;
    }
  `]
})
export class LegerEditorComponent {
  student = input.required<Student>();
  studentChange = output<Student>();
  
  reportService = inject(ReportService);
  editableStudent: WritableSignal<Student | null> = signal(null);

  isGuruMapel = computed(() => this.reportService.userRole() === 'Guru Mapel');
  
  private currentStudentId: number | null = null;

  constructor() {
    // 1. Effect for Student Selection
    effect(() => {
      const s = this.student();
      untracked(() => {
          if (s && s.id !== this.currentStudentId) {
             this.currentStudentId = s.id;
             const copy = structuredClone(s);
             if (!copy.subjectsA) copy.subjectsA = [];
             if (!copy.subjectsB) copy.subjectsB = [];
             this.editableStudent.set(copy);
          }
      });
    });

    // 2. Aggressive Auto-Fill Watcher
    effect(() => {
        const s = this.editableStudent();
        const masterData = this.reportService.masterCompetencies();
        
        if (!s || masterData.length === 0) return;

        untracked(() => {
            let hasChanges = false;
            
            const checkAndFill = (sub: any) => {
                if (sub.name) {
                    const isEmpty = !sub.competency || sub.competency.trim() === '' || sub.competency.trim() === '-';
                    
                    if (isEmpty) {
                        const desc = this.reportService.getCompetencyForSubject(sub.name);
                        if (desc) {
                            sub.competency = desc;
                            hasChanges = true;
                        }
                    }
                }
            };

            s.subjectsA.forEach(checkAndFill);
            s.subjectsB.forEach(checkAndFill);

            if (hasChanges) {
                this.studentChange.emit(s);
                this.editableStudent.set({...s}); 
            }
        });
    });
  }

  refreshDB() {
    this.reportService.reloadMasterCompetencies();
  }
  
  clearCacheAndReload() {
      if(confirm('Aksi ini akan menghapus data Capaian Kompetensi yang tersimpan di browser dan mengambil ulang dari Google Spreadsheet. Lanjutkan?')) {
          this.reportService.clearMasterCache();
      }
  }

  addSubject(group: 'A' | 'B') {
    const s = this.editableStudent();
    if (!s) return;
    const newSub = { name: '', score: 0, competency: '' };
    if (group === 'A') s.subjectsA.push(newSub);
    else s.subjectsB.push(newSub);
    this.onFormChange();
  }

  onFormChange() {
    const currentData = this.editableStudent();
    if (currentData) {
      this.studentChange.emit(currentData);
    }
  }

  removeSubject(group: 'A' | 'B', index: number) {
    const s = this.editableStudent();
    if (!s) return;
    
    if (group === 'A') {
        if (s.subjectsA && s.subjectsA.length > index) {
            s.subjectsA.splice(index, 1);
        }
    } else {
        if (s.subjectsB && s.subjectsB.length > index) {
            s.subjectsB.splice(index, 1);
        }
    }
    this.onFormChange();
  }

  addPKL() {
    const s = this.editableStudent();
    if(!s) return;
    if(!s.pkl) s.pkl = [];
    s.pkl.push({ mitra: '', lokasi: '', lama: '', keterangan: '' });
    this.onFormChange();
  }

  removePKL(index: number) {
    const s = this.editableStudent();
    if(!s || !s.pkl) return;
    s.pkl.splice(index, 1);
    this.onFormChange();
  }

  addExtra() {
    const s = this.editableStudent();
    if(!s) return;
    if(!s.extras) s.extras = [];
    s.extras.push({ name: '', grade: '', description: '' });
    this.onFormChange();
  }

  removeExtra(index: number) {
    const s = this.editableStudent();
    if(!s || !s.extras) return;
    s.extras.splice(index, 1);
    this.onFormChange();
  }
  
  // NEW: Feature to auto-generate academic note based on average score
  generateAutoNote(student: Student) {
    const subjects = [...(student.subjectsA || []), ...(student.subjectsB || [])];
    const scores = subjects
        .map(s => Number(s.score))
        .filter(n => !isNaN(n) && n > 0);
    
    if (scores.length === 0) {
        alert('Silakan input nilai mata pelajaran terlebih dahulu.');
        return;
    }

    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    let note = "";
    
    // Convert name to Title Case for nicer display
    const name = student.name.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    if (avg >= 90) {
        note = `Ananda ${name} memiliki prestasi yang sangat memuaskan. Pertahankan semangat belajar dan jadilah teladan bagi teman-temanmu.`;
    } else if (avg >= 85) {
        note = `Ananda ${name} menunjukkan perkembangan yang sangat baik. Tingkatkan terus prestasimu di semester berikutnya.`;
    } else if (avg >= 80) {
        note = `Ananda ${name} memiliki kemampuan akademik yang baik. Tingkatkan kedisiplinan dan keaktifan di kelas.`;
    } else if (avg >= 75) {
        note = `Ananda ${name} sudah mencapai kompetensi dengan baik. Perbanyak latihan soal agar hasil belajar lebih maksimal.`;
    } else {
        note = `Ananda ${name} perlu meningkatkan semangat belajar. Jangan ragu bertanya kepada guru dan manfaatkan waktu dengan baik.`;
    }

    student.academicNote = note;
    this.onFormChange();
  }
}
