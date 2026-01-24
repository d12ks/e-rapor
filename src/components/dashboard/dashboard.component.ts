
import { Component, inject, signal, output, OnInit, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../services/report.service';
import { LegerEditorComponent } from '../leger-editor/leger-editor.component';
import { SchoolEditorComponent } from '../school-editor/school-editor.component';
import { StudentEditorComponent } from '../student-editor/student-editor.component';
import { StudentImportComponent } from '../student-import/student-import.component';
import { AppGuideComponent } from '../app-guide/app-guide.component'; 
import { HistoryModalComponent } from '../history-modal/history-modal.component'; // Import History
import { Student } from '../../types';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, LegerEditorComponent, SchoolEditorComponent, StudentEditorComponent, StudentImportComponent, AppGuideComponent, HistoryModalComponent],
  template: `
    <!-- Global Loading Overlay (driven by service) -->
    @if (reportService.isLoading()) {
      <div class="fixed inset-0 bg-black bg-opacity-70 z-[9999] flex items-center justify-center backdrop-blur-sm">
        <div class="bg-white p-8 rounded-lg shadow-2xl flex flex-col items-center max-w-sm w-full mx-4">
          <svg class="animate-spin h-12 w-12 text-rapor-green mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-gray-800 font-bold text-lg">Memuat data...</span>
          <p class="text-gray-500 text-xs mt-2 text-center">Mohon jangan tutup halaman ini.</p>
        </div>
      </div>
    }

    <!-- Modal Import -->
    @if (showImportModal()) {
      <app-student-import 
        (close)="showImportModal.set(false)"
        (studentsImported)="handleStudentsImported($event)"
        (requestSave)="handleImportSave()">
      </app-student-import>
    }

    <!-- Modal Panduan Sistem -->
    @if (showGuideModal()) {
      <app-app-guide (close)="showGuideModal.set(false)"></app-app-guide>
    }

    <!-- Modal Riwayat -->
    @if (showHistoryModal()) {
      <app-history-modal 
        (close)="showHistoryModal.set(false)"
        (fileSelected)="onHistoryFileSelected($event)">
      </app-history-modal>
    }

    <div class="min-h-screen bg-gray-100 pb-12 text-green-900">
      <!-- Navbar -->
      <nav class="bg-green-800 text-white p-4 shadow-md sticky top-0 z-50">
        <div class="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div class="flex items-center gap-2 cursor-pointer" (click)="goToDashboard()">
            <span class="font-bold text-lg">E-Rapor - SMK Negeri 1 Mondokan</span>
          </div>
          <div class="flex items-center gap-4 text-sm">
            <div class="flex flex-col md:flex-row md:items-center text-right md:gap-2">
               <span class="font-semibold">{{ reportService.currentUser() }}</span>
               <span class="text-green-300 hidden md:inline">|</span>
               <span class="text-gray-200">
                  {{ reportService.userRole() }}
                  @if(reportService.userRole() === 'Wali Kelas' && reportService.userClasses().length > 0) {
                     <span class="bg-green-700 px-2 py-0.5 rounded text-white text-xs ml-1">{{ reportService.userClasses()[0] }}</span>
                  }
               </span>
            </div>
            <button (click)="logout()" class="text-xs bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition text-white shadow">Logout</button>
          </div>
        </div>
      </nav>

      <div class="container mx-auto p-6">
        
        <!-- DASHBOARD VIEW -->
        @if (mode() === 'dashboard') {
          
          <!-- INFO CARD KHUSUS WALI KELAS -->
          @if (reportService.userRole() === 'Wali Kelas') {
            <div class="bg-white rounded-lg shadow-sm border-l-4 border-blue-500 p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div class="flex items-center gap-4">
                    <div class="p-3 bg-blue-100 rounded-full text-green-600">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    </div>
                    <div>
                        <h3 class="text-green-900 font-bold text-lg">Identitas Wali Kelas</h3>
                        @if (reportService.userClasses().length > 0) {
                           <p class="text-green-700 font-medium">Kelas Binaan: <span class="text-sm font-bold">{{ reportService.userClasses()[0] }}</span></p>
                        } @else {
                           <p class="text-gray-500 italic text-sm">Belum ada kelas yang di-mapping di database (Kolom H).</p>
                        }
                    </div>
                </div>
                <!-- Tombol Shortcut Buat File Baru sesuai kelas binaan -->
                <div class="hidden sm:block">
                   <button (click)="showHistoryModal.set(true)" class="text-sm bg-yellow-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition shadow">
                      Cek File Rapor
                   </button>
                </div>
            </div>
          }

          <!-- WELCOME AREA: Special View for Admin & Guru Mapel when no file is loaded -->
          @if ((reportService.userRole() === 'Guru Mapel' || reportService.userRole() === 'Admin') && !reportService.currentFileId()) {
            <div class="bg-white rounded-lg shadow p-8 text-center max-w-2xl mx-auto mt-8">
                <h2 class="text-2xl font-bold text-gray-800">
                   @if(reportService.userRole() === 'Admin') { Panel Administrator } @else { Selamat Datang, Guru Mata Pelajaran }
                </h2>
                <p class="text-gray-600 mt-2 mb-6">
                   @if(reportService.userRole() === 'Admin') {
                      Silakan pilih file rapor dari database untuk memonitor, mengedit, atau mencetak rapor siswa.
                   } @else {
                      Untuk memulai, silakan buka file rapor kelas yang ingin Anda isi nilainya.
                   }
                </p>
                <button (click)="showHistoryModal.set(true)" class="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition transform hover:scale-105 flex items-center gap-2 mx-auto">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"></path></svg>
                    Buka Database Rapor
                </button>
            </div>
          } @else {
            
             <!-- Pesan jika tidak ada file aktif (untuk Wali Kelas atau kondisi umum) -->
            @if (!reportService.currentFileId()) {
              <div class="bg-red-50 border-l-4 border-red-400 p-6 mb-8 text-center rounded-r-lg shadow">
                  <h2 class="text-xl font-bold text-red-400">Tidak Ada File Rapor Aktif</h2>
                  <p class="text-red-700 mt-2 mb-4">Untuk memulai, silakan buka file rapor dari riwayat atau buat file baru di halaman login.</p>
                  <button (click)="showHistoryModal.set(true)" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-lg shadow transition flex items-center gap-2 mx-auto">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      Buka Riwayat Rapor
                  </button>
              </div>
            }

            <!-- Compact Info Card (File Aktif) -->
            <div class="bg-white rounded shadow-sm p-3 mb-6 border-l-4 border-rapor-green text-gray-900 flex flex-col md:flex-row justify-between items-center gap-4">
               <div class="flex items-center gap-3">
                  <div class="bg-green-100 p-2 rounded-full text-green-700">
                     <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  </div>
                  <div>
                     <h2 class="text-sm font-bold text-green-800">DATA FILE AKTIF</h2>
                     <p class="text-xs text-red-500 flex items-center gap-1">
                       <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                       {{ reportService.currentFileId() ? 'Terhubung ke Database' : 'Tidak Ada File Aktif' }}
                     </p>
                  </div>
               </div>

               <!-- Read-Only Info Fields -->
               <div class="flex flex-wrap gap-2 w-full md:w-auto justify-end">
                  <div class="bg-green-50 border border-green-200 px-3 py-1.5 rounded flex flex-col min-w-[100px]">
                     <span class="text-[10px] uppercase font-bold text-green-400">Kelas</span>
                     <span class="text-sm font-bold text-green-800 truncate max-w-[200px]" [title]="reportService.schoolData().kelas">
                        {{ reportService.schoolData().kelas || '-' }}
                     </span>
                  </div>
                  <div class="bg-green-50 border border-green-200 px-3 py-1.5 rounded flex flex-col min-w-[80px]">
                     <span class="text-[10px] uppercase font-bold text-green-400">Semester</span>
                     <span class="text-sm font-bold text-green-800">
                        {{ reportService.schoolData().semester || '-' }}
                     </span>
                  </div>
                  <div class="bg-green-50 border border-green-200 px-3 py-1.5 rounded flex flex-col min-w-[100px]">
                     <span class="text-[10px] uppercase font-bold text-green-400">Tahun Pelajaran</span>
                     <span class="text-sm font-bold text-green-800">
                        {{ reportService.schoolData().tahunAjaran || '-' }}
                     </span>
                  </div>
               </div>
            </div>

            <!-- Main Actions -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <!-- Input Area -->
              <div class="lg:col-span-1 space-y-4">
                <div class="bg-white rounded-lg shadow p-6 text-gray-900">
                    <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                      Input Data
                    </h3>
                    <div class="space-y-2">
                      <button (click)="mode.set('input_sekolah')" class="btn-dashboard" [disabled]="!reportService.currentFileId() || reportService.userRole() === 'Guru Mapel'" [title]="!reportService.currentFileId() ? 'Buka atau buat file rapor terlebih dahulu' : (reportService.userRole() === 'Guru Mapel' ? 'Akses terbatas untuk Guru Mapel' : 'Edit data institusi sekolah')">
                        Data Sekolah <span class="arrow">&rarr;</span>
                      </button>
                      <button (click)="enterStudentMode()" class="btn-dashboard" [disabled]="!reportService.currentFileId() || reportService.userRole() === 'Guru Mapel'" [title]="!reportService.currentFileId() ? 'Buka atau buat file rapor terlebih dahulu' : (reportService.userRole() === 'Guru Mapel' ? 'Akses terbatas untuk Guru Mapel' : 'Edit data siswa')">
                        Data Siswa <span class="arrow">&rarr;</span>
                      </button>
                      <button (click)="mode.set('input_nilai')" class="btn-dashboard mt-4" [disabled]="!reportService.currentFileId()" [title]="!reportService.currentFileId() ? 'Buka atau buat file rapor terlebih dahulu' : 'Input leger nilai siswa'">
                        Leger Nilai <span class="arrow">&rarr;</span>
                      </button>
                      <button (click)="showHistoryModal.set(true)" class="btn-dashboard mt-4">
                        <div class="flex items-center gap-2">
                           <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                           Riwayat Rapor
                        </div>
                        <span class="arrow">&rarr;</span>
                      </button>
                    </div>
                </div>

                <div class="bg-green-50 rounded-lg p-4 border border-green-200 shadow-sm">
                  <div class="flex items-start gap-3">
                     <div class="p-2 bg-green-100 rounded text-green-600">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                     </div>
                     <div class="flex-1">
                        <h4 class="font-bold text-green-800 text-sm mb-1">Petunjuk Penggunaan</h4>
                        <p class="text-xs text-green-700 mb-3 leading-relaxed">
                          Bingung mulai dari mana? Lihat alur kerja sistem aplikasi mulai dari input data hingga cetak rapor.
                        </p>
                        <button (click)="showGuideModal.set(true)" class="text-xs bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition w-full font-bold flex items-center justify-center gap-1 shadow">
                          <span>Cara Penggunaan Aplikasi</span>
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                        </button>
                     </div>
                  </div>
                </div>
              </div>

              <!-- Print Area -->
              <div class="lg:col-span-2 bg-white rounded-lg shadow p-6 text-gray-900">
                <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                  Cetak & Unduh
                </h3>
                
                @if (reportService.userRole() === 'Guru Mapel') {
                   <div class="bg-red-50 text-red-700 p-3 rounded mb-4 text-xs font-semibold border border-red-200">
                      Akses Dibatasi: Guru Mapel tidak memiliki akses untuk mencetak rapor.
                   </div>
                }

                <div class="mb-4 text-xs text-gray-500 italic">
                  Pilih menu di bawah ini. Untuk menu yang memerlukan data spesifik siswa (Identitas & Rapor), pilihan siswa tersedia di dalam tampilan pratinjau.
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <button (click)="setPrintMode('rapor')" class="btn-print col-span-2 sm:col-span-2" [disabled]="!reportService.currentFileId() || reportService.userRole() === 'Guru Mapel'">
                    <span class="text-2xl">📊</span>
                    <span class="text-xs font-bold text-center">Rapor Akademik (Nilai)</span>
                  </button>
                  <button (click)="setPrintMode('cover')" class="btn-print" [disabled]="!reportService.currentFileId() || reportService.userRole() === 'Guru Mapel'">
                    <span class="text-2xl">📄</span>
                    <span class="text-xs font-bold text-center">Sampul</span>
                  </button>
                  <button (click)="setPrintMode('petunjuk')" class="btn-print" [disabled]="!reportService.currentFileId() || reportService.userRole() === 'Guru Mapel'">
                    <span class="text-2xl">ℹ️</span>
                    <span class="text-xs font-bold text-center">Petunjuk Rapor</span>
                  </button>
                  <button (click)="setPrintMode('identitas_siswa')" class="btn-print" [disabled]="!reportService.currentFileId() || reportService.userRole() === 'Guru Mapel'">
                    <span class="text-2xl">👨‍🎓</span>
                    <span class="text-xs font-bold text-center">Identitas Siswa</span>
                  </button>
                  <button (click)="setPrintMode('identitas_sekolah')" class="btn-print" [disabled]="!reportService.currentFileId() || reportService.userRole() === 'Guru Mapel'">
                    <span class="text-2xl">🏫</span>
                    <span class="text-xs font-bold text-center">Identitas Sekolah</span>
                  </button>
                </div>
              </div>
            </div>
          }
        }

        <!-- INPUT/EDIT VIEW -->
        @if (mode() !== 'dashboard') {
           <div class="flex flex-col gap-4 text-gray-900">
             
             <!-- HEADER NAV -->
             <div class="flex justify-between items-center bg-white p-4 rounded shadow">
               <div class="flex items-center gap-4">
                  @if (mode() === 'input_siswa' && studentViewMode() === 'edit') {
                    <button (click)="studentViewMode.set('list')" class="text-red-500 hover:text-red-800 font-bold flex items-center gap-1">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                      Kembali ke Daftar
                    </button>
                  } @else {
                    <button (click)="mode.set('dashboard')" class="text-red-500 hover:text-red-800 font-bold flex items-center gap-1">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                      Kembali
                    </button>
                  }
                  
                  <h2 class="text-lg font-bold text-black flex items-center gap-2">
                    @if(mode() === 'input_sekolah') { Input Data Sekolah }
                    @if(mode() === 'input_siswa') { 
                       @if(studentViewMode() === 'list') { Daftar Siswa } @else { Edit Data Siswa }
                    }
                    @if(mode() === 'input_nilai') { Input Leger Nilai }
                  </h2>
               </div>
               
               <div class="flex items-center gap-4">
                  @if (mode() === 'input_nilai') {
                    <select class="border border-gray-300 rounded p-2 text-sm bg-white text-black" (change)="onStudentSelect($event)">
                        @for (s of reportService.students(); track s.id) {
                            <option [value]="s.id" [selected]="s.id === reportService.selectedStudent().id">{{ s.id }}. {{ s.name }}</option>
                        }
                    </select>
                  }
                  
                  @if (!(mode() === 'input_siswa' && studentViewMode() === 'list')) {
                    <!-- KONDISIONAL TOMBOL SIMPAN (IDE DARI PENGGUNA) -->
                    @if (mode() === 'input_nilai' && reportService.userRole() !== 'Guru Mapel') {
                      
                      @if(isInitialSetup()) {
                        <!-- Tombol Kuning: Hanya untuk setup awal -->
                         <div class="relative group">
                            <span class="absolute -top-7 left-1/2 -translate-x-1/2 w-max bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              Simpan & salin template mapel ke semua siswa
                            </span>
                            <!-- ACTION: Menggunakan saveInitialStructure -->
                            <button (click)="saveInitialStructure()" [disabled]="reportService.isLoading()" class="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded shadow font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-wait">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                                <span>SIMPAN STRUKTUR MAPEL</span>
                            </button>
                         </div>
                      } @else {
                        <!-- Tombol Hijau: Simpan data biasa -->
                        <button (click)="saveData()" [disabled]="reportService.isLoading()" class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded shadow font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-wait">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                            <span>SIMPAN PERUBAHAN DATA</span>
                        </button>
                      }

                    } @else {
                       <!-- Tombol Simpan standar untuk mode lain (Data Sekolah, Data Siswa, atau Admin/GuruMapel di mode nilai) -->
                       <button (click)="saveData()" [disabled]="reportService.isLoading()" class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded shadow font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-wait">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                            <span>SIMPAN DATA</span>
                       </button>
                    }
                  }
               </div>
             </div>

             <!-- Render Editor based on Mode -->
             @if (mode() === 'input_nilai') {
               <app-leger-editor 
                  [student]="reportService.selectedStudent()" 
                  (studentChange)="reportService.updateStudent($event)">
               </app-leger-editor>

             } @else if (mode() === 'input_siswa') {
               
               @if (studentViewMode() === 'list') {
                  <div class="bg-white rounded-lg shadow p-6">
                    
                    <div class="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                       <div class="flex gap-3">
                          <button (click)="showImportModal.set(true)" class="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold text-sm shadow transition">
                             <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                             Import Excel
                          </button>
                          <button (click)="addNewStudent()" class="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold text-sm shadow transition">
                             <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                             Tambah Manual
                          </button>
                       </div>
                       
                       <div class="flex items-center gap-2">
                         <button (click)="saveData()" [disabled]="reportService.isLoading()" class="bg-green-800 hover:bg-green-700 text-white px-4 py-2 rounded font-bold text-sm shadow transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-wait">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                            <span>Simpan Perubahan ke Server</span>
                         </button>
                       </div>
                    </div>

                    <div class="overflow-x-auto border rounded-lg">
                      <table class="w-full text-sm text-left text-gray-700">
                        <thead class="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                          <tr>
                            <th class="px-6 py-3 w-16 text-center">No</th>
                            <th class="px-6 py-3 w-32">NISN</th>
                            <th class="px-6 py-3">Nama Lengkap</th>
                            <th class="px-6 py-3 w-24">L/P</th>
                            <th class="px-6 py-3 w-24">Kelas</th>
                            <th class="px-6 py-3 w-32 text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          @for (s of reportService.students(); track s.id; let i = $index) {
                            <tr class="bg-white border-b hover:bg-gray-50 transition">
                              <td class="px-6 py-3 text-center font-medium">{{ i + 1 }}</td>
                              <td class="px-6 py-3">{{ s.nisn || '-' }}</td>
                              <td class="px-6 py-3 font-bold text-gray-900">{{ s.name }}</td>
                              <td class="px-6 py-3">{{ s.jenisKelamin === 'Laki-laki' ? 'L' : 'P' }}</td>
                              <td class="px-6 py-3">{{ s.kelas || '-' }}</td>
                              <td class="px-6 py-3 flex justify-center gap-2">
                                <button (click)="editStudent(s.id)" class="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200 transition" title="Edit">
                                   <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                </button>
                                <button (click)="deleteStudentFromList(s)" class="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition" title="Hapus">
                                   <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                              </td>
                            </tr>
                          }
                          @if (reportService.students().length === 0) {
                            <tr>
                              <td colspan="6" class="px-6 py-8 text-center text-gray-500 italic">
                                Belum ada data siswa. Silakan Import Excel atau Tambah Manual.
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>
               } @else {
                  <app-student-editor
                      [student]="reportService.selectedStudent()"
                      (studentChange)="reportService.updateStudent($event)"
                      (delete)="handleDeleteStudent($event)">
                  </app-student-editor>
               }

             } @else if (mode() === 'input_sekolah') {
               <app-school-editor 
                  [school]="reportService.schoolData()"
                  (schoolChange)="reportService.updateSchoolData($event)">
               </app-school-editor>
             }
           </div>
        }

      </div>
      
      <footer class="text-center text-gray-500 text-xs mt-12 mb-4">
         <p>E-Rapor | d12ks-2026</p>
      </footer>
    </div>
  `,
  styles: [`
    .btn-dashboard {
      width: 100%; text-align: left; padding: 0.75rem 1rem;
      background-color: #f9fafb; color: black; border-radius: 0.25rem;
      border: 1px solid #e5e7eb; font-size: 0.875rem; font-weight: 500;
      transition: background-color 0.2s;
      display: flex; justify-content: space-between;
    }
    .btn-dashboard:not(:disabled):hover { background-color: #f3f4f6; }
    .btn-dashboard:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-dashboard .arrow { color: #9ca3af; transition: color 0.2s; }
    .btn-dashboard:not(:disabled):hover .arrow { color: #1f2937; }

    .btn-print {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 1rem; border-radius: 0.25rem;
      border: 1px solid #e5e7eb; color: black;
      transition: all 0.2s; gap: 0.5rem; height: 6rem;
    }
    .btn-print:not(:disabled):hover { background-color: #f9fafb; border-color: #4a7c36; color: #4a7c36; }
    .btn-print:disabled { opacity: 0.5; cursor: not-allowed; background-color: #f9fafb; }
  `]
})
export class DashboardComponent implements OnInit {
  reportService = inject(ReportService);
  
  mode = signal<'dashboard' | 'input_sekolah' | 'input_siswa' | 'input_nilai'>('dashboard');
  studentViewMode = signal<'list' | 'edit'>('list');
  
  printMode = output<string>(); 
  showImportModal = signal(false);
  showGuideModal = signal(false);
  showHistoryModal = signal(false);
  
  // Logic untuk tombol kuning.
  isInitialSetup = computed(() => {
    const students = this.reportService.students();
    if (students.length === 0) return true;
    return students.some(s => !s.subjectsA?.length && !s.subjectsB?.length);
  });

  constructor() {
    // Effect removed. Logic moved to ngOnInit for reliable execution.
  }

  ngOnInit() {
    // Gunakan setTimeout untuk memastikan UI sudah dirender sebelum menampilkan modal
    // Hal ini memperbaiki masalah popup tidak muncul di localhost karena race condition
    setTimeout(() => {
        const role = this.reportService.userRole();
        const hasFile = this.reportService.currentFileId();
        
        // Auto-open history modal for Admin and Guru Mapel if no file is selected
        if (this.reportService.isLoggedIn() && 
           (role === 'Guru Mapel' || role === 'Admin') && 
           !hasFile) {
            this.showHistoryModal.set(true);
        }
    }, 100);
  }

  logout() {
    this.reportService.logout();
  }

  goToDashboard() {
    this.mode.set('dashboard');
  }

  enterStudentMode() {
    this.mode.set('input_siswa');
    this.studentViewMode.set('list');
  }

  addNewStudent() {
    const newId = this.reportService.createNewStudent();
    this.reportService.selectStudent(newId);
    this.studentViewMode.set('edit');
  }

  editStudent(id: number) {
    this.reportService.selectStudent(id);
    this.studentViewMode.set('edit');
  }

  deleteStudentFromList(s: Student) {
    if (confirm(`Hapus data siswa: ${s.name}?`)) {
      this.reportService.deleteStudent(s.id);
    }
  }

  handleDeleteStudent(id: number) {
     this.reportService.deleteStudent(id);
     this.studentViewMode.set('list');
  }
  
  async onHistoryFileSelected(file: {id: string, name: string}) {
    this.showHistoryModal.set(false);
    
    try {
        await this.reportService.loadHistoryFile(file.id);
        alert(`Data raport "${file.name}" berhasil dimuat, silahkan melakukan tugas anda sebagai guru mapel.`);

        // Auto-navigate to grading for Guru Mapel
        if (this.reportService.userRole() === 'Guru Mapel') {
            this.mode.set('input_nilai');
        }
        
    } catch (e) {
        console.error(e);
        alert('Gagal memuat file rapor.');
    }
  }

  onStudentSelect(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.reportService.selectStudent(parseInt(val));
  }

  setPrintMode(mode: string) {
    this.printMode.emit(mode);
  }

  async saveInitialStructure() {
    // Prevent double clicking
    if (this.reportService.isLoading()) return;

    const student = this.reportService.selectedStudent();
    if (!student) {
      alert('Error: Tidak ada siswa yang dipilih.');
      return;
    }
    
    const studentCount = this.reportService.students().length > 0 ? this.reportService.students().length - 1 : 0;
    
    if (confirm(`Ini akan menyalin struktur mapel dari siswa '${student.name}' ke ${studentCount} siswa lainnya, dan menyimpannya ke server. Aksi ini biasanya hanya dilakukan sekali di awal semester. Lanjutkan?`)) {
      
      // 1. Lakukan sinkronisasi data lokal
      this.reportService.syncSubjectsToAllStudents(student.id);
      
      // 2. Simpan ke server
      await this.reportService.saveData(); 
    } 
  }


  async saveData() {
    if (this.reportService.isLoading()) return;
    await this.reportService.saveData();
  }

  handleStudentsImported(newStudents: Partial<Student>[]) {
    this.reportService.addStudents(newStudents);
    this.studentViewMode.set('list'); 
  }

  async handleImportSave() {
    await this.saveData();
    this.showImportModal.set(false);
  }
}
