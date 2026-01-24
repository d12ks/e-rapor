
import { Component, output, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-history-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" (click)="close.emit()">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden" (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="bg-green-800 p-4 flex justify-between items-center text-white shrink-0">
          <h2 class="text-xl font-bold flex items-center gap-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Riwayat File Rapor
          </h2>
          <!-- Tombol X pojok kanan atas tetap ada untuk membatalkan -->
          <button (click)="close.emit()" class="text-gray-300 hover:text-white transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 overflow-y-auto flex-1 bg-gray-50">
          
          @if(reportService.userRole() === 'Guru Mapel' && reportService.userClasses().length > 0) {
            <div class="bg-blue-50 border border-blue-200 p-3 rounded mb-4 text-sm text-blue-800">
                <p>Menampilkan file rapor untuk kelas yang Anda ampu: <strong>{{ reportService.userClasses().join(', ') }}</strong>.</p>
            </div>
          } @else {
            <div class="bg-green-50 border border-green-200 p-3 rounded mb-4 text-sm text-green-800 flex gap-2 items-start">
              <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <p>Berikut adalah daftar file rapor yang pernah dibuat oleh user <strong>{{ reportService.currentUser() }}</strong>. Klik "Buka File" untuk memuat data dan mengeditnya.</p>
            </div>
          }

          @if (isLoading()) {
             <div class="flex flex-col items-center justify-center py-10 space-y-3">
                <svg class="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                <span class="text-gray-500 text-sm">Mengambil daftar riwayat...</span>
             </div>
          } @else if (fileList().length === 0) {
             <div class="text-center py-10 text-gray-500 bg-white border border-dashed border-gray-300 rounded-lg">
                <svg class="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                @if(reportService.userRole() === 'Guru Mapel') {
                  <p class="font-bold">Tidak ada file rapor ditemukan.</p>
                  <p class="text-xs mt-1">Pastikan Wali Kelas sudah membuat file rapor untuk kelas yang Anda ampu.</p>
                } @else {
                  <p>Tidak ada riwayat file ditemukan untuk akun ini.</p>
                }
             </div>
          } @else {
             <div class="space-y-3">
                @for (file of fileList(); track file.id) {
                   <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-green-400 hover:shadow-md transition group">
                      <div class="flex justify-between items-start">
                         <div>
                            <h3 class="font-bold text-gray-800 break-all">{{ file.name }}</h3>
                            <p class="text-xs text-gray-500 mt-1 flex items-center gap-1">
                               <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                               Diperbarui: {{ formatDate(file.lastUpdated) }}
                            </p>
                         </div>
                         <!-- Tombol Buka File langsung emit event ke parent -->
                         <button (click)="selectFile(file)" 
                            class="bg-gray-100 text-gray-600 group-hover:bg-green-600 group-hover:text-white px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1 border">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                            Buka File
                         </button>
                      </div>
                   </div>
                }
             </div>
          }
        </div>
        
        <!-- Footer tombol tutup dihapus sesuai permintaan -->
      </div>
    </div>
  `
})
export class HistoryModalComponent implements OnInit {
  close = output<void>();
  fileSelected = output<{id: string, name: string}>(); // Mengirim objek file ke parent
  
  reportService = inject(ReportService);
  
  isLoading = signal(true);
  fileList = signal<any[]>([]);

  ngOnInit() {
    this.fetchHistory();
  }

  async fetchHistory() {
    this.isLoading.set(true);
    try {
      const files = await this.reportService.getHistoryFiles();
      this.fileList.set(files);
    } catch (e) {
      console.error(e);
      alert('Gagal mengambil riwayat file.');
    } finally {
      this.isLoading.set(false);
    }
  }

  selectFile(file: any) {
    // Kirim data ke parent (Dashboard) dan tutup modal
    this.fileSelected.emit({ id: file.id, name: file.name });
    this.close.emit();
  }

  formatDate(dateString: string) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }
}