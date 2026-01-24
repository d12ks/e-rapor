import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-setup-guide',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full max-h-[85vh] overflow-y-auto border-t-4 border-rapor-green">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-gray-800">Panduan Setup & Code.gs</h2>
        <button (click)="close.emit()" class="text-gray-400 hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <p class="mb-4 text-sm text-gray-600">
        Gunakan kode Google Apps Script (GAS) berikut untuk membuat backend otomatis di Google Spreadsheet Anda.
      </p>

      <div class="relative mb-6">
        <div class="absolute top-0 right-0 p-2">
            <button (click)="copyCode()" 
                class="bg-rapor-green text-white px-3 py-1 rounded text-xs shadow hover:bg-rapor-dark transition">
            {{ copied ? 'Berhasil Disalin!' : 'Salin Code.gs' }}
            </button>
        </div>
        <pre class="bg-gray-900 text-gray-100 p-4 rounded-md text-xs font-mono overflow-x-auto h-64 border border-gray-700 whitespace-pre shadow-inner">{{ gasCode }}</pre>
      </div>

      <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-sm text-yellow-800">
        <strong>Catatan:</strong> Aplikasi ini saat ini berjalan dalam "Mode Demo" menggunakan data lokal (36 siswa contoh) karena keterbatasan lingkungan browser. Kode di atas adalah referensi untuk pengembangan lebih lanjut.
      </div>
    </div>
  `
})
export class SetupGuideComponent {
  reportService = inject(ReportService);
  close = output<void>();
  
  gasCode = this.reportService.getGasCode();
  copied = false;

  copyCode() {
    navigator.clipboard.writeText(this.gasCode).then(() => {
      this.copied = true;
      setTimeout(() => this.copied = false, 2000);
    });
  }
}