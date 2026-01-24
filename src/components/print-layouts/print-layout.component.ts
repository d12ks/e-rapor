
import { Component, input, output, inject, signal, HostListener, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Student } from '../../types';
import { ReportService } from '../../services/report.service';
import { ReportViewComponent } from '../report-view/report-view.component';

interface PageSlice {
  id: number;
  offsetY: number;      
  sliceHeight: number;  
  marginTop: number;    
  marginBottom: number; 
  marginLeft: number;   
  marginRight: number;  
  alignment: 'flex-start' | 'center' | 'flex-end'; 
  justify: 'flex-start' | 'center' | 'flex-end';   
  isLocked: boolean;    
  // footnoteX & Y removed because they are now fixed/locked
}

@Component({
  selector: 'app-print-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, ReportViewComponent],
  styles: [`
    :host {
      display: block; width: 100%; height: 100vh; overflow: hidden;
      background: #1f2937; 
    }
    .sheet-container {
      /* Fixed A4 size at 96 DPI */
      width: 794px; 
      height: 1123px; 
      background: white; margin-bottom: 2rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); position: relative;
      overflow: hidden; display: flex; flex-direction: column;
      transition: padding 0.1s; transform-origin: top center; box-sizing: border-box;
    }
    .content-wrapper { flex: 1; display: flex; width: 100%; height: 100%; position: relative; overflow: hidden; }
    .image-mask { position: relative; overflow: hidden; width: 100%; box-shadow: 0 0 0 1px dashed rgba(0,0,0,0.1); transition: height 0.1s; }
    .source-image { width: 100%; position: absolute; left: 0; }
    
    .crop-line {
      position: absolute; left: 0; right: 0; border-bottom: 2px dashed #ef4444; z-index: 9999; cursor: ns-resize;
      display: flex; justify-content: flex-start; padding-left: 0;
    }
    .crop-line:hover { border-width: 3px; }
    .cut-btn {
      background: #ef4444; color: white; font-size: 10px; font-weight: bold;
      padding: 4px 12px; border-radius: 0 4px 4px 0; margin-top: -12px;
      cursor: pointer !important; box-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      display: flex; align-items: center; gap: 4px; transition: all 0.2s; z-index: 10000; pointer-events: auto;
    }
    .cut-btn:hover { transform: scale(1.05); background: #dc2626; }
    .reset-wrapper { position: absolute; left: 0; right: 0; z-index: 10000; display: flex; justify-content: flex-start; padding-left: 0; pointer-events: none; }
    .reset-btn { background: #3b82f6; }
    .reset-btn:hover { background: #2563eb; }

    .margin-handle { position: absolute; z-index: 40; border-color: #3b82f6; border-style: dashed; opacity: 0; transition: opacity 0.2s; }
    .sheet-container:hover .margin-handle { opacity: 0.5; }
    .margin-handle:hover, .margin-handle.dragging { opacity: 1; border-width: 2px; border-style: solid; }
    .margin-t { top: 0; left: 0; right: 0; border-bottom-width: 1px; cursor: ns-resize; }
    .margin-b { bottom: 0; left: 0; right: 0; border-top-width: 1px; cursor: ns-resize; }
    .margin-l { left: 0; top: 0; bottom: 0; border-right-width: 1px; cursor: ew-resize; }
    .margin-r { right: 0; top: 0; bottom: 0; border-left-width: 1px; cursor: ew-resize; }

    /* FIXED FOOTNOTE STYLE - No longer draggable */
    .sheet-footer {
      position: absolute;
      bottom: 0;
      right: 0;
      z-index: 60;
      padding: 4px;
      font-family: 'Times New Roman', serif; 
      font-size: 11px; 
      font-style: italic;
      text-align: right; 
      color: #000;
      pointer-events: none; /* User cannot drag it */
    }

    #ghost-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 794px; /* A4 width @ 96 DPI */
      z-index: -9999; 
      background: white;
      visibility: visible;
      overflow: visible !important;
    }

    @media print {
      .no-print { display: none !important; }
      .sheet-container { box-shadow: none; margin: 0; page-break-after: always; display: block; height: 1122px !important; transform: none !important; overflow: hidden !important; }
      .margin-handle { display: none; }
      .sheet-footer { border: none; background: transparent; }
      :host, body { background: white; }
    }
  `],
  template: `
    <!-- LOADING OVERLAY -->
    @if (!imageData()) {
      <div class="fixed inset-0 bg-gray-900 z-[100] flex flex-col items-center justify-center text-white">
          <div class="relative w-20 h-20 mb-6">
             <div class="absolute top-0 left-0 w-full h-full border-4 border-gray-600 rounded-full"></div>
             <div class="absolute top-0 left-0 w-full h-full border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <h2 class="text-xl font-bold mb-2">Menyiapkan Preview...</h2>
          <p class="text-gray-400 text-sm">
             @if(retryStatus()) {
                {{ retryStatus() }}
             } @else {
                Sedang merender halaman...
             }
          </p>
      </div>
    }

    <div class="flex h-full font-sans" (mousemove)="onGlobalMove($event)" (mouseup)="onGlobalUp()">
      
      <!-- SIDEBAR -->
      <div class="w-80 bg-gray-900 border-r border-gray-700 flex flex-col shadow-xl z-50 no-print">
         <div class="p-4 border-b border-gray-700">
           <h2 class="font-bold text-lg text-white flex items-center gap-2">
              <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              Editor PDF
           </h2>
           <p class="text-xs text-gray-400 mt-1">Sesuaikan potongan & tata letak.</p>
         </div>

         <!-- PILIH SISWA -->
         @if (mode() !== 'petunjuk') {
            <div class="p-4 bg-gray-800 border-b border-gray-700">
               <label class="text-xs font-bold text-gray-400 uppercase mb-2 block">PILIH SISWA</label>
               <select class="w-full bg-gray-900 border border-gray-600 rounded px-2 py-2 text-sm text-white outline-none focus:border-green-500 transition cursor-pointer" (change)="onStudentSelect($event)">
                   @for (s of reportService.students(); track s.id) {
                       <option [value]="s.id" [selected]="s.id === student().id">{{ s.id }}. {{ s.name }}</option>
                   }
               </select>
            </div>
         }

         <!-- ZOOM CONTROLS -->
         <div class="p-4 bg-gray-800 border-b border-gray-700">
            <div class="flex items-center justify-between text-white mb-2">
               <span class="text-xs font-bold uppercase text-gray-400">Zoom Preview</span>
               <span class="text-xs font-mono">{{ (zoomLevel() * 100).toFixed(0) }}%</span>
            </div>
            <div class="flex gap-2">
               <button (click)="zoomOut()" class="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded px-2 py-1 text-xs font-bold" title="Zoom Out">-</button>
               <button (click)="resetZoom()" class="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded px-2 py-1 text-xs font-bold" title="Reset 100%">100%</button>
               <button (click)="zoomIn()" class="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded px-2 py-1 text-xs font-bold" title="Zoom In">+</button>
            </div>
         </div>

         <div class="p-4 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
            <!-- Controls per Page -->
            @for (page of pages(); track page.id; let i = $index) {
                <div class="bg-gray-800 rounded p-3 border border-gray-700">
                   <div class="flex justify-between items-center mb-2">
                      <span class="text-sm font-bold text-white">Halaman {{ i + 1 }}</span>
                      @if (page.isLocked) {
                          <span class="text-[10px] bg-green-900 text-green-300 px-2 py-0.5 rounded">Terkunci</span>
                      } @else {
                          <span class="text-[10px] bg-yellow-900 text-yellow-300 px-2 py-0.5 rounded">Mengedit...</span>
                      }
                   </div>
                   <!-- Alignment Controls -->
                   <div class="grid grid-cols-3 gap-1 mb-2">
                      <button (click)="setAlignment(i, 'flex-start', 'flex-start')" class="p-1 bg-gray-700 hover:bg-gray-600 rounded" title="Kiri Atas">
                        <svg class="w-4 h-4 text-gray-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h10M4 14h6" /></svg>
                      </button>
                      <button (click)="setAlignment(i, 'flex-start', 'center')" class="p-1 bg-gray-700 hover:bg-gray-600 rounded" title="Tengah Atas">
                        <svg class="w-4 h-4 text-gray-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M7 10h10M9 14h6" /></svg>
                      </button>
                      <button (click)="setAlignment(i, 'flex-start', 'flex-end')" class="p-1 bg-gray-700 hover:bg-gray-600 rounded" title="Kanan Atas">
                        <svg class="w-4 h-4 text-gray-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M10 10h10M14 14h6" /></svg>
                      </button>
                      <button (click)="setAlignment(i, 'center', 'center')" class="p-1 bg-gray-700 hover:bg-gray-600 rounded col-span-3 flex justify-center gap-2 items-center" title="Tengah Halaman">
                        <svg class="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12h16M7 8h10M7 16h10" /></svg>
                        <span class="text-xs text-gray-300">Posisi Tengah</span>
                      </button>
                      <button (click)="setAlignment(i, 'flex-end', 'center')" class="p-1 bg-gray-700 hover:bg-gray-600 rounded col-span-3 flex justify-center gap-2 items-center" title="Bawah Halaman">
                         <svg class="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 18h16M7 14h10M9 10h6" /></svg>
                         <span class="text-xs text-gray-300">Posisi Bawah</span>
                      </button>
                   </div>
                   <p class="text-[10px] text-gray-400 mt-2">
                      @if (page.isLocked) { Klik "RESET" untuk membuka kunci potongan. } @else { Geser garis merah & klik "POTONG DISINI". }
                   </p>
                </div>
            }
         </div>

         <div class="p-4 border-t border-gray-700 space-y-3 bg-gray-900">
             <button (click)="downloadPDF()" [disabled]="!imageData() || isProcessing()" class="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded text-sm shadow-lg flex justify-center items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed">
                 @if(isProcessing()) {
                    <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                    <span>MEMPROSES PDF...</span>
                 } @else {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    <span>UNDUH PDF</span>
                 }
             </button>
             <button (click)="close.emit()" class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded text-sm transition">Tutup</button>
         </div>
      </div>

      <!-- MAIN EDITOR AREA -->
      <div class="flex-1 bg-[#525659] overflow-y-auto p-8 flex flex-col items-center custom-scrollbar relative">
         
         <!-- GHOST ELEMENT (Source of Truth) -->
         <div id="ghost-container">
             <app-report-view 
                 [student]="student()" 
                 [viewMode]="mode()"
                 [pageMode]="0" 
                 [showFooter]="mode() === 'rapor'">
             </app-report-view>
         </div>

         <!-- CANVAS EDITOR - Gunakan unit PX untuk binding style agar presisi -->
         <div id="print-area" class="origin-top transition-transform duration-200" [style.transform]="'scale(' + zoomLevel() + ')'">
            @if (imageData()) {
                @for (page of pages(); track page.id; let i = $index) {
                    <div class="sheet-container mb-8"
                         [style.padding-top.px]="cmToPx(page.marginTop)"
                         [style.padding-bottom.px]="cmToPx(page.marginBottom)"
                         [style.padding-left.px]="cmToPx(page.marginLeft)"
                         [style.padding-right.px]="cmToPx(page.marginRight)">
                         
                        <!-- MARGIN HANDLES -->
                        <div class="margin-handle margin-t no-print" [style.height.px]="cmToPx(page.marginTop)" (mousedown)="startMarginDrag($event, i, 'top')"></div>
                        <div class="margin-handle margin-b no-print" [style.height.px]="cmToPx(page.marginBottom)" (mousedown)="startMarginDrag($event, i, 'bottom')"></div>
                        <div class="margin-handle margin-l no-print" [style.width.px]="cmToPx(page.marginLeft)" (mousedown)="startMarginDrag($event, i, 'left')"></div>
                        <div class="margin-handle margin-r no-print" [style.width.px]="cmToPx(page.marginRight)" (mousedown)="startMarginDrag($event, i, 'right')"></div>

                        <!-- CONTENT WRAPPER -->
                        <div class="content-wrapper" [style.align-items]="page.alignment" [style.justify-content]="page.justify">
                            <div class="image-mask" [style.height.px]="page.sliceHeight">
                                <img [src]="imageData()" class="source-image" [style.top.px]="-page.offsetY">
                            </div>
                        </div>
                        
                        <!-- CROP CONTROL -->
                        @if (!page.isLocked && hasMoreContent(i)) {
                            <div class="crop-line no-print" [style.top.px]="getCropLineTop(i)" (mousedown)="startCutDrag($event, i)">
                                 <button class="cut-btn" (mousedown)="$event.stopPropagation()" (click)="lockPage(i)">
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0 0L3 3m9 9l4.5 4.5m-4.5-4.5l-4.5-4.5"></path></svg>
                                    POTONG DISINI
                                 </button>
                            </div>
                        }
                        @if (page.isLocked && i < pages().length - 1) {
                             <div class="reset-wrapper no-print" [style.top.px]="getCropLineTop(i)" data-html2canvas-ignore="true">
                                 <button class="cut-btn reset-btn pointer-events-auto" (click)="resetPage(i)">
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                    RESET
                                 </button>
                             </div>
                        }
                        
                        <!-- FIXED FOOTNOTE (Only for Rapor) - Positioned in Bottom Margin -->
                        @if (mode() === 'rapor') {
                            <div class="sheet-footer" 
                                 [style.right.px]="cmToPx(page.marginRight)" 
                                 [style.bottom.px]="cmToPx(page.marginBottom - 0.7)">
                                 {{ student().nisn }}_{{ school().semester }} {{ school().tahunAjaran }}<br>Hal. {{ i + 1 }} / {{ pages().length }}
                            </div>
                        }
                    </div>
                }
            }
         </div>
      </div>
    </div>
  `
})
export class PrintLayoutComponent implements OnInit {
  mode = input.required<string>(); 
  student = input.required<Student>();
  reportService = inject(ReportService);
  school = this.reportService.schoolData;
  close = output<void>();

  imageData = signal<string | null>(null);
  isProcessing = signal(false);
  retryStatus = signal<string>(''); 
  zoomLevel = signal(1.0);
  pages = signal<PageSlice[]>([]);
  totalImageHeight = 0;
  
  // PRESISI: 1mm = 3.779527559 px @ 96 DPI
  // 1cm = 37.7952755906 px
  readonly PX_PER_CM = 37.7952755906;
  readonly PAGE_WIDTH_PX = 794; 
  readonly PAGE_HEIGHT_PX = 1123; 

  dragState: { active: boolean; type: 'cut' | 'margin' | null; pageIndex: number; subType?: string; startY: number; startX: number; initialVal: any; } 
  = { active: false, type: null, pageIndex: -1, startY: 0, startX: 0, initialVal: 0 };

  constructor() {
    effect(() => {
        const s = this.student();
        this.imageData.set(null);
        this.pages.set([]);
        setTimeout(() => this.generateImage(), 500);
    });
  }

  ngOnInit() { }

  onStudentSelect(event: Event) {
      const val = (event.target as HTMLSelectElement).value;
      this.reportService.selectStudent(parseInt(val));
  }

  // Helper konversi CM ke PX presisi
  cmToPx(cm: number): number {
    return cm * this.PX_PER_CM;
  }

  private loadLibrary(url: string, globalKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any)[globalKey]) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = url;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Gagal mengunduh ${url}`));
      document.head.appendChild(script);
    });
  }

  async generateImage(retryCount = 0) {
      this.isProcessing.set(true);
      const MAX_RETRIES = 10;
      
      const ghost = document.getElementById('ghost-container');
      
      if (typeof (window as any).html2canvas === 'undefined') {
          this.retryStatus.set(`Mengunduh library grafis...`);
          try {
             await this.loadLibrary('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', 'html2canvas');
          } catch (e) {
             this.isProcessing.set(false);
             alert('Gagal mengunduh library pencetakan (html2canvas). Mohon periksa koneksi internet Anda.');
             return;
          }
      }

      if (!ghost) {
          if (retryCount < MAX_RETRIES) {
             this.retryStatus.set(`Menunggu render halaman... (${retryCount + 1}/${MAX_RETRIES})`);
             setTimeout(() => this.generateImage(retryCount + 1), 500);
             return;
          }
           this.isProcessing.set(false);
           console.error('Ghost container not found after retries.');
           alert('Gagal menemukan elemen rapor. Silakan tutup dan buka kembali menu cetak.');
           return;
      }

      this.retryStatus.set('Sedang mengambil gambar...');
      await new Promise(r => setTimeout(r, 800));

      try {
          const html2canvas = (window as any).html2canvas;
          window.scrollTo(0, 0);

          // Force width and windowWidth to match PAGE_WIDTH_PX to prevent shifting
          const canvas = await html2canvas(ghost, {
              scale: 2,
              useCORS: true,
              logging: false,
              width: this.PAGE_WIDTH_PX,
              windowWidth: this.PAGE_WIDTH_PX,
              scrollY: 0,
              allowTaint: true,
              backgroundColor: '#ffffff'
          });

          this.totalImageHeight = canvas.height / 2;
          this.imageData.set(canvas.toDataURL('image/png'));
          this.initFirstPage();
          this.isProcessing.set(false);
          this.retryStatus.set('');

      } catch (err: any) {
          console.error("HTML2Canvas Error:", err);
          this.isProcessing.set(false);
          alert("Gagal merender halaman: " + err.message);
      }
  }

  getMaxSliceHeight(page: PageSlice): number {
    const verticalMarginPx = (page.marginTop + page.marginBottom) * this.PX_PER_CM;
    // BUFFER TAMBAHAN (50px) agar konten tidak menabrak footnote yang baru dinaikkan
    return this.PAGE_HEIGHT_PX - verticalMarginPx - 50;
  }

  initFirstPage() {
      const defMargin = { t: 1.5, b: 1.0, l: 1.5, r: 1.0 };
      const firstPage: PageSlice = {
          id: 1, offsetY: 0, sliceHeight: 0, 
          marginTop: defMargin.t, marginBottom: defMargin.b, marginLeft: defMargin.l, marginRight: defMargin.r,
          alignment: 'flex-start', justify: 'flex-start',
          isLocked: false
      };
      
      const maxH = this.getMaxSliceHeight(firstPage);
      firstPage.sliceHeight = Math.min(this.totalImageHeight, maxH);
      this.pages.set([firstPage]);
  }

  zoomIn() { this.zoomLevel.update(v => parseFloat((v + 0.1).toFixed(1))); }
  zoomOut() { this.zoomLevel.update(v => Math.max(0.5, parseFloat((v - 0.1).toFixed(1)))); }
  resetZoom() { this.zoomLevel.set(1.0); }

  lockPage(index: number) {
      this.pages.update(curr => {
          const p = curr[index];
          p.isLocked = true;
          const nextOffset = p.offsetY + p.sliceHeight;
          const remaining = this.totalImageHeight - nextOffset;
          if (remaining > 5) {
              const nextPage: PageSlice = {
                  id: index + 2, offsetY: nextOffset, sliceHeight: 0, 
                  marginTop: 1.0, marginBottom: 1.0, marginLeft: p.marginLeft, marginRight: p.marginRight, 
                  alignment: 'flex-start', justify: 'flex-start', isLocked: false
              };
              const maxH = this.getMaxSliceHeight(nextPage);
              nextPage.sliceHeight = Math.min(remaining, maxH);
              curr.push(nextPage);
          }
          return [...curr];
      });
  }

  resetPage(index: number) {
      this.pages.update(curr => {
          curr[index].isLocked = false;
          const remaining = this.totalImageHeight - curr[index].offsetY;
          const maxH = this.getMaxSliceHeight(curr[index]);
          curr[index].sliceHeight = Math.min(remaining, maxH);
          return curr.slice(0, index + 1);
      });
  }

  setAlignment(index: number, align: any, justify: any) {
      this.pages.update(curr => { curr[index].alignment = align; curr[index].justify = justify; return [...curr]; });
  }

  startCutDrag(e: MouseEvent, index: number) {
      e.preventDefault(); e.stopPropagation();
      this.dragState = { active: true, type: 'cut', pageIndex: index, startY: e.clientY, startX: 0, initialVal: this.pages()[index].sliceHeight };
  }
  startMarginDrag(e: MouseEvent, index: number, side: string) {
      e.preventDefault(); e.stopPropagation();
      const p = this.pages()[index];
      let val = 0;
      if (side === 'top') val = p.marginTop; if (side === 'bottom') val = p.marginBottom;
      if (side === 'left') val = p.marginLeft; if (side === 'right') val = p.marginRight;
      this.dragState = { active: true, type: 'margin', pageIndex: index, subType: side, startY: e.clientY, startX: e.clientX, initialVal: val };
  }

  @HostListener('window:mouseup') onGlobalUp() { this.dragState.active = false; }
  @HostListener('window:mousemove', ['$event']) onGlobalMove(e: MouseEvent) {
      if (!this.dragState.active) return;
      const idx = this.dragState.pageIndex;
      const zoom = this.zoomLevel();
      
      if (this.dragState.type === 'cut') {
          const delta = (e.clientY - this.dragState.startY) / zoom;
          let newH = this.dragState.initialVal + delta;
          const p = this.pages()[idx];
          const maxAvailable = this.totalImageHeight - p.offsetY;
          const maxPageHeight = this.getMaxSliceHeight(p);
          if (newH < 50) newH = 50;
          if (newH > maxPageHeight) newH = maxPageHeight;
          if (newH > maxAvailable) newH = maxAvailable;
          this.pages.update(curr => { curr[idx].sliceHeight = newH; return [...curr]; });
      }
      if (this.dragState.type === 'margin') {
          const isVert = this.dragState.subType === 'top' || this.dragState.subType === 'bottom';
          const deltaPx = (isVert ? (e.clientY - this.dragState.startY) : (e.clientX - this.dragState.startX)) / zoom;
          let mod = 1;
          if (this.dragState.subType === 'bottom' || this.dragState.subType === 'right') mod = -1;
          // Use PX_PER_CM const for drag calc
          const deltaCm = (deltaPx * mod) / this.PX_PER_CM;
          let newVal = this.dragState.initialVal + deltaCm;
          if (newVal < 0) newVal = 0; if (newVal > 10) newVal = 10;
          this.pages.update(curr => {
             const p = curr[idx];
             if (this.dragState.subType === 'top') p.marginTop = newVal;
             if (this.dragState.subType === 'bottom') p.marginBottom = newVal;
             if (this.dragState.subType === 'left') p.marginLeft = newVal;
             if (this.dragState.subType === 'right') p.marginRight = newVal;
             return [...curr];
          });
      }
  }

  hasMoreContent(index: number) {
      const p = this.pages()[index];
      return (p.offsetY + p.sliceHeight) < (this.totalImageHeight - 2);
  }
  
  // Perhitungan Top Line Garis Potong yang Presisi
  getCropLineTop(index: number) {
      const p = this.pages()[index];
      // marginTop (cm) -> px, ditambah sliceHeight (px)
      return this.cmToPx(p.marginTop) + p.sliceHeight;
  }

  async downloadPDF() {
    this.isProcessing.set(true);
    
    if (!(window as any).jspdf) {
         try {
             await this.loadLibrary('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', 'jspdf');
         } catch(e) {
             alert('Gagal mengunduh library PDF (jsPDF). Mohon periksa koneksi internet Anda.');
             this.isProcessing.set(false);
             return;
         }
    }

    try {
        const globalJspdf = (window as any).jspdf;
        const { jsPDF } = globalJspdf; 
        
        const doc = new jsPDF({
           orientation: 'p',
           unit: 'mm',
           format: 'a4',
           compress: true
        });

        const img = new Image();
        const currentImageData = this.imageData();
        if (!currentImageData) throw new Error("Tidak ada data gambar untuk dicetak.");
        
        img.src = currentImageData;
        
        await new Promise<void>((resolve, reject) => {
            img.onload = () => {
                try {
                    const pages = this.pages();
                    if(pages.length === 0) {
                        reject(new Error("Halaman kosong. Tunggu preview muncul."));
                        return;
                    }

                    pages.forEach((page, i) => {
                        if (i > 0) doc.addPage();
                        
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        
                        // --- CORE LOGIC FIX (WYSIWYG) ---
                        // Hitung lebar area konten di layar (dalam px)
                        const visualContentWidth = this.PAGE_WIDTH_PX - this.cmToPx(page.marginLeft) - this.cmToPx(page.marginRight);
                        
                        // Rasio: Seberapa besar gambar asli dibandingkan gambar yang tampil di layar
                        const ratio = img.width / visualContentWidth;

                        const sx = 0;
                        const sy = page.offsetY * ratio; // Sesuaikan koordinat Y dengan rasio
                        const sw = img.width; 
                        const sh = page.sliceHeight * ratio; // Sesuaikan tinggi potongan dengan rasio
                        
                        canvas.width = sw; canvas.height = sh;
                        
                        if (ctx) {
                            // --- FIX BLACK BOX ARTIFACTS ---
                            // Ensure transparent parts of the image or canvas are white
                            ctx.fillStyle = '#FFFFFF';
                            ctx.fillRect(0, 0, sw, sh);
                            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
                        }

                        const sliceImgData = canvas.toDataURL('image/jpeg', 0.95);
                        
                        // Dimensi di PDF (mm)
                        const pdfContentWidth = 210 - (page.marginLeft * 10) - (page.marginRight * 10);
                        const pdfContentHeight = (sh / sw) * pdfContentWidth;
                        
                        doc.addImage(sliceImgData, 'JPEG', page.marginLeft * 10, page.marginTop * 10, pdfContentWidth, pdfContentHeight);
                        
                        // --- FIXED FOOTNOTE LOGIC IN PDF ---
                        // Menggunakan koordinat absolut PDF, bukan drag relative
                        if (this.mode() === 'rapor') {
                            doc.setFontSize(9);
                            doc.setFont("times", "italic");
                            // Modified footnote: Page i+1 / total pages
                            const txt = `${this.student().nisn}_${this.school().semester} ${this.school().tahunAjaran}\nHal. ${i + 1} / ${pages.length}`;
                            
                            // Align right (RightMargin + sedikit buffer)
                            // 210mm lebar kertas. X = 210 - MarginRight - 10mm buffer
                            const pdfFooterX = 210 - (page.marginRight * 10);
                            
                            // Bottom align: 297mm height. Y = 297 - MarginBottom + adjustment (biar di dalam area margin)
                            // Kita taruh di 297 - 10mm (1cm dari bawah)
                            const pdfFooterY = 297 - 10; 

                            doc.text(txt, pdfFooterX, pdfFooterY, { align: 'right' });
                        }
                    });
                    resolve();
                } catch (e) {
                    reject(e);
                }
            };
            img.onerror = (e) => reject(new Error("Gagal memuat source gambar."));
        });
        
        const filename = `${this.mode()}_${this.student().name.replace(/\s+/g, '_')}.pdf`;
        doc.save(filename);
        
    } catch (e: any) {
        console.error(e);
        alert("Terjadi kesalahan saat membuat PDF: " + e.message);
    } finally {
        this.isProcessing.set(false);
    }
  }
}
