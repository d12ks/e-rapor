
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from './services/report.service';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PrintLayoutComponent } from './components/print-layouts/print-layout.component';
import { SetupGuideComponent } from './components/setup-guide/setup-guide.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LoginComponent, DashboardComponent, PrintLayoutComponent, SetupGuideComponent],
  template: `
    @if (!reportService.isLoggedIn()) {
      <app-login></app-login>
    } @else {
      
      <!-- TAMPILKAN DASHBOARD HANYA JIKA TIDAK SEDANG PRINT -->
      @if (!printMode()) {
        <app-dashboard 
          (printMode)="openPrint($event)"
        ></app-dashboard>
      }

      <!-- TAMPILKAN PRINT LAYOUT HANYA JIKA MODE PRINT AKTIF -->
      @if (printMode()) {
        <app-print-layout 
          [mode]="printMode()" 
          [student]="reportService.selectedStudent()"
          (close)="printMode.set('')">
        </app-print-layout>
      }

      <!-- Setup Modal (Global) -->
      @if (showSetup()) {
        <div class="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm no-print">
           <app-setup-guide (close)="showSetup.set(false)"></app-setup-guide>
        </div>
      }
    }
  `
})
export class AppComponent {
  reportService = inject(ReportService);
  printMode = signal<string>(''); // '' | 'cover' | 'identitas_sekolah' | 'identitas_siswa' | 'rapor'
  showSetup = signal(false);

  openPrint(mode: string) {
    this.printMode.set(mode);
  }
}
