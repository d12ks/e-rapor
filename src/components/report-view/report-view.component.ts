
import { Component, input, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Student, SchoolData } from '../../types';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-report-view',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: auto; 
      min-height: 100%;
      background-color: white;
    }
    .print-text {
      font-size: 12pt;
      line-height: 1.5; 
      color: #000;
    }
    .print-text-sm {
      font-size: 11pt; 
      line-height: 1.4;
      color: #000;
    }
    td {
      vertical-align: top;
      border-color: #000;
    }
    .table-border {
      width: 100%;
      border-collapse: collapse;
    }
    .table-border th, .table-border td {
      border: 1px solid black;
      padding: 6px;
    }
    .uppercase-bold {
      text-transform: uppercase;
      font-weight: bold;
    }
    /* Kertas A4 Simulasi */
    .paper-document {
      position: relative;
      background: white;
    }
    ol {
      counter-reset: item;
      padding-left: 0;
    }
    ol > li {
      display: block;
      position: relative;
      padding-left: 1.5em;
      margin-bottom: 0.5em;
      text-align: justify;
    }
    ol > li:before {
      content: counter(item) ".";
      counter-increment: item;
      position: absolute;
      left: 0;
      width: 1.2em;
      font-weight: bold;
    }
    /* Nested list alpha */
    ol.alpha-list {
      counter-reset: alpha-item;
    }
    ol.alpha-list > li:before {
      content: counter(alpha-item, lower-alpha) ".";
      counter-increment: alpha-item;
      font-weight: normal;
    }
  `],
  template: `
    <div class="w-full min-h-full h-auto text-black font-serif print-text relative flex flex-col p-8 sm:p-0">
      
<!-- COVER PAGE -->
        @if (viewMode() === 'cover') {
          <div class="paper-document bg-white w-[210mm] min-h-[297mm] p-8 shadow-2xl print:shadow-none print:w-full flex flex-col items-center justify-around text-black font-serif text-center relative print:mx-auto">
            
            <!-- Top Block: Titles -->
            <div class="w-full">
              <h1 class="text-2xl font-bold mb-4 !text-black">LAPORAN HASIL BELAJAR<br>(RAPOR)</h1>
              <h2 class="text-2xl font-bold !text-black">SEKOLAH MENENGAH KEJURUAN<br>(SMK)</h2>
            </div>

            <!-- Middle Block: Logo -->
            <div>
              <img src="https://upload.wikimedia.org/wikipedia/commons/9/9c/Logo_Tut_Wuri_Handayani.png" class="h-64 w-auto object-contain mx-auto grayscale opacity-80" alt="Logo Sekolah">
            </div>

            <!-- Bottom Block: Identitas Siswa -->
            <div class="w-full">
              <p class="mb-4 text-base">Nama Peserta Didik</p>
              <div class="border border-black p-3 inline-block min-w-[300px] font-bold text-lg mb-4 uppercase bg-white">
                {{ student().name }}
              </div>

              <p class="mb-2 text-base">NISN</p>
              <div class="border border-black p-3 inline-block min-w-[300px] font-bold text-lg bg-white">
                {{ student().nisn }}
              </div>
            </div>

          </div>
        }

      <!-- MODE: IDENTITAS SEKOLAH -->
      @if (viewMode() === 'identitas_sekolah') {
         <div class="py-8">
            <h1 class="text-center text-xl font-bold uppercase mb-12">IDENTITAS SEKOLAH</h1>
            <table class="w-full text-lg">
               <tbody>
                  <tr class="h-10"><td class="w-[30%] font-bold">Nama Sekolah</td><td class="w-[2%]">:</td><td>{{ school().namaSekolah }}</td></tr>
                  <tr class="h-10"><td class="font-bold">NPSN</td><td>:</td><td>{{ school().npsn }}</td></tr>
                  <tr class="h-10"><td class="font-bold">Alamat</td><td>:</td><td>{{ school().alamat }}</td></tr>
                  <tr class="h-10"><td class="font-bold">Kelurahan</td><td>:</td><td>{{ school().kelurahan }}</td></tr>
                  <tr class="h-10"><td class="font-bold">Kecamatan</td><td>:</td><td>{{ school().kecamatan }}</td></tr>
                  <tr class="h-10"><td class="font-bold">Kabupaten/Kota</td><td>:</td><td>{{ school().kabupaten }}</td></tr>
                  <tr class="h-10"><td class="font-bold">Provinsi</td><td>:</td><td>{{ school().provinsi }}</td></tr>
                  <tr class="h-10"><td class="font-bold">Website</td><td>:</td><td>{{ school().website }}</td></tr>
                  <tr class="h-10"><td class="font-bold">E-mail</td><td>:</td><td>{{ school().email }}</td></tr>
               </tbody>
            </table>
         </div>
      }

      <!-- MODE: IDENTITAS SISWA -->
      @if (viewMode() === 'identitas_siswa') {
         <div class="py-8">
            <h1 class="text-center text-xl font-bold uppercase mb-8">KETERANGAN TENTANG DIRI PESERTA DIDIK</h1>
            <table class="w-full text-[11pt]">
               <tbody>
                  <tr class="h-8"><td class="w-[5%]">1.</td><td class="w-[35%]">Nama Peserta Didik (Lengkap)</td><td class="w-[2%]">:</td><td class="uppercase-bold">{{ student().name }}</td></tr>
                  <tr class="h-8"><td>2.</td><td>Nomor Induk Siswa Nasional</td><td>:</td><td>{{ student().nisn }}</td></tr>
                  <tr class="h-8"><td>3.</td><td>Tempat Tanggal Lahir</td><td>:</td><td>{{ student().tempatLahir }}, {{ student().tanggalLahir }}</td></tr>
                  <tr class="h-8"><td>4.</td><td>Jenis Kelamin</td><td>:</td><td>{{ student().jenisKelamin }}</td></tr>
                  <tr class="h-8"><td>5.</td><td>Agama</td><td>:</td><td>{{ student().agama }}</td></tr>
                  <tr class="h-8"><td>6.</td><td>Status dalam Keluarga</td><td>:</td><td>{{ student().statusKeluarga }}</td></tr>
                  <tr class="h-8"><td>7.</td><td>Anak ke</td><td>:</td><td>{{ student().anakKe }}</td></tr>
                  <tr class="h-8"><td>8.</td><td>Alamat Peserta Didik</td><td>:</td><td>{{ student().alamat }}</td></tr>
                  <tr class="h-8"><td></td><td>Nomor Telepon Rumah</td><td>:</td><td>{{ student().telp }}</td></tr>
                  <tr class="h-8"><td>9.</td><td>Sekolah Asal</td><td>:</td><td>{{ student().sekolahAsal }}</td></tr>
                  <tr class="h-8"><td>10.</td><td>Diterima di sekolah ini</td><td></td><td></td></tr>
                  <tr class="h-8"><td></td><td>Di kelas</td><td>:</td><td>{{ student().diterimaKelas }}</td></tr>
                  <tr class="h-8"><td></td><td>Pada tanggal</td><td>:</td><td>{{ student().diterimaTanggal }}</td></tr>
                  
                  <tr class="h-12"><td colspan="4" class="font-bold align-bottom pb-1">Orang Tua</td></tr>
                  <tr class="h-8"><td>11.</td><td>Nama Ayah</td><td>:</td><td>{{ student().namaAyah }}</td></tr>
                  <tr class="h-8"><td>12.</td><td>Nama Ibu</td><td>:</td><td>{{ student().namaIbu }}</td></tr>
                  <tr class="h-8"><td>13.</td><td>Alamat Orang Tua</td><td>:</td><td>{{ student().alamatOrangTua }}</td></tr>
                  <tr class="h-8"><td>14.</td><td>Nomor Telepon Rumah</td><td>:</td><td>{{ student().telpOrangTua }}</td></tr>
                  <tr class="h-8"><td>15.</td><td>Pekerjaan Ayah</td><td>:</td><td>{{ student().pekerjaanAyah }}</td></tr>
                  <tr class="h-8"><td>16.</td><td>Pekerjaan Ibu</td><td>:</td><td>{{ student().pekerjaanIbu }}</td></tr>
                  
                  <tr class="h-12"><td colspan="4" class="font-bold align-bottom pb-1">Wali</td></tr>
                  <tr class="h-8"><td>17.</td><td>Nama Wali</td><td>:</td><td>{{ student().namaWali }}</td></tr>
                  <tr class="h-8"><td>18.</td><td>Alamat Wali</td><td>:</td><td>{{ student().alamatWali }}</td></tr>
                  <tr class="h-8"><td>19.</td><td>Nomor Telepon Rumah</td><td>:</td><td>{{ student().telpWali }}</td></tr>
                  <tr class="h-8"><td>20.</td><td>Pekerjaan Wali</td><td>:</td><td>{{ student().pekerjaanWali }}</td></tr>
               </tbody>
            </table>
            
             <div class="flex justify-end mt-16 px-16">
                <div class="text-center w-1/3">
                    <div class="border border-black w-24 h-32 mx-auto mb-2 flex items-center justify-center text-xs text-gray-400 bg-gray-50">
                        Pas Foto<br>3x4
                    </div>
                </div>
                <div class="text-center w-1/3">
                  <p class="mb-24">{{ school().kabupaten }}, {{ school().tglRapor }}<br>Kepala Sekolah,</p>
                  <p class="font-bold underline">{{ school().kepalaSekolah }}</p>
                  <p>NIP. {{ school().nipKepalaSekolah }}</p>
                </div>
             </div>
         </div>
      }

        <!-- MODE: PETUNJUK -->
        @if (viewMode() === 'petunjuk') {
          <div class="paper-document bg-white w-[210mm] min-h-[297mm] px-12 py-10 shadow-2xl print:shadow-none print:w-full text-black font-serif text-[11pt] leading-normal print:mx-auto">
            <h1 class="text-center font-bold uppercase mb-6 text-base !text-black border-b-2 border-black pb-2">PETUNJUK PENGGUNAAN</h1>
            
            <ol class="text-justify !text-black space-y-2">
              <li>Buku Laporan Pencapaian Kompetensi ini digunakan selama peserta didik mengikuti pembelajaran di Sekolah Menengah Kejuruan.</li>
              <li>Apabila peserta didik pindah sekolah, maka Buku Laporan Pencapaian Kompetensi dibawa oleh peserta didik yang bersangkutan untuk dipergunakan sebagai mana mestinya di sekolah yang baru.</li>
              <li>Apabila Buku Laporan Pencapaian Kompetensi peserta didik hilang atau rusak, dapat diganti dengan Buku Laporan Pencapaian Kompetensi pengganti atas biaya peserta didik yang bersangkutan setelah diketahui oleh Kepala Sekolah.</li>
              <li>Buku Laporan Pencapaian Kompetensi peserta didik ini harus dilengkapi dengan pas foto terbaru ukuran 3 x 4 cm.</li>
              <li>Kriteria Ketuntasan Minimal (KKM) ditentukan dengan mempertimbangkan tingkat kemampuan rata-rata peserta didik, kompleksitas kompetensi, dan sumber daya pendukung dalam penyelenggaraan pembelajaran.</li>
              <li>
                Menganalisis KKM dengan menggunakan rentang nilai pada setiap kriteria:
                <ol class="alpha-list mt-1 space-y-1">
                   <li>
                       <span class="font-bold italic">Tingkat Kompleksitas Kompetensi:</span>
                       <ul class="list-disc pl-6 mb-1">
                           <li>Kompleksitas rendah diberi nilai 81 – 100</li>
                           <li>Kompleksitas sedang diberi nilai 65 – 80</li>
                           <li>Kompleksitas tinggi diberi nilai 50 – 64</li>
                       </ul>
                   </li>
                   <li>
                       <span class="font-bold italic">Tingkat Kemampuan Rata-rata:</span>
                       <ul class="list-disc pl-6 mb-1">
                           <li>Rata-rata tinggi diberi nilai 81 – 100</li>
                           <li>Rata-rata sedang diberi nilai 65 – 80</li>
                           <li>Rata-rata rendah nilai 50 – 64</li>
                       </ul>
                   </li>
                   <li>
                       <span class="font-bold italic">Sumberdaya Pendukung Pembelajaran:</span>
                       <ul class="list-disc pl-6">
                           <li>Daya dukung tinggi diberi nilai 81 – 100</li>
                           <li>Daya dukung sedang diberi nilai 65 – 80</li>
                           <li>Daya dukung rendah diberi nilai 50 – 64</li>
                       </ul>
                   </li>
                </ol>
              </li>
              <li>Kolom penilaian terdiri atas sub-kolom nilai Angka dan Predikat. Nilai ditulis dalam dua digit pada sub-kolom Angka dan diperkuat dengan pernyataan Predikat dalam bentuk huruf pada sub-kolom Predikat.</li>
              <li>
                Predikat nilai ditetapkan seperti dijelaskan dalam tabel berikut:
                <div class="flex justify-center my-4">
                  <table class="w-[90%] border-collapse border border-black text-center text-[10pt] font-sans text-black">
                    <thead>
                      <tr class="font-bold bg-gray-100">
                         <th class="border border-black px-2 py-2 !text-black w-1/3 align-middle">Nilai Adaptif & Normatif</th>
                         <th class="border border-black px-2 py-2 !text-black w-1/3 align-middle">Nilai Produktif</th>
                         <th class="border border-black px-2 py-2 !text-black w-1/3 align-middle">Predikat</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td class="border border-black p-2 align-middle">95 - 100</td><td class="border border-black p-2 align-middle">95 - 100</td><td class="border border-black p-2 align-middle font-bold">A+</td></tr>
                      <tr><td class="border border-black p-2 align-middle">90 - 94</td><td class="border border-black p-2 align-middle">90 - 94</td><td class="border border-black p-2 align-middle font-bold">A</td></tr>
                      <tr><td class="border border-black p-2 align-middle">85 - 89</td><td class="border border-black p-2 align-middle">85 - 89</td><td class="border border-black p-2 align-middle font-bold">A-</td></tr>
                      <tr><td class="border border-black p-2 align-middle">80 - 84</td><td class="border border-black p-2 align-middle">80 - 84</td><td class="border border-black p-2 align-middle font-bold">B+</td></tr>
                      <tr><td class="border border-black p-2 align-middle">75 - 79</td><td class="border border-black p-2 align-middle">75 - 79</td><td class="border border-black p-2 align-middle font-bold">B</td></tr>
                      <tr><td class="border border-black p-2 align-middle">70 - 74</td><td class="border border-black p-2 align-middle">70 - 74</td><td class="border border-black p-2 align-middle font-bold">B-</td></tr>
                      <tr><td class="border border-black p-2 align-middle">60 - 69</td><td class="border border-black p-2 align-middle">65 - 69</td><td class="border border-black p-2 align-middle font-bold">C</td></tr>
                      <tr><td class="border border-black p-2 align-middle">0 - 59</td><td class="border border-black p-2 align-middle">0 - 64</td><td class="border border-black p-2 align-middle font-bold">D</td></tr>
                    </tbody>
                  </table>
                </div>
              </li>
              <li>Nilai yang dimasukkan dalam Buku Laporan Hasil Belajar adalah nilai terendah dari sub kompetensi masing-masing mata pelajaran / kompetensi.</li>
              <li>Kolom kegiatan belajar di dunia usaha/industri dan instansi relevan hanya diisi bagi peserta didik yang memiliki surat keterangan atau sertifikat dari dunia usaha/industri atau instansi yang relevan.</li>
              <li>
                Nilai Pengembangan diri terdiri dari:
                <div class="grid grid-cols-[40px_1fr] ml-4 mt-2 gap-y-1">
                  <span class="font-bold">A :</span><span>Sangat Baik</span>
                  <span class="font-bold">B :</span><span>Baik</span>
                  <span class="font-bold">C :</span><span>Cukup</span>
                  <span class="font-bold">D :</span><span>Kurang</span>
                </div>
              </li>
            </ol>
            
            <div class="mt-8 pt-4 border-t-2 border-black break-inside-avoid">
                <h3 class="font-bold text-center uppercase mb-2 text-sm !text-black">KETENTUAN MENGIKUTI PROGRAM PENDIDIKAN</h3>
                <p class="mb-2 !text-black text-justify">Setiap peserta didik wajib mengikuti program pendidikan dengan ketentuan sebagai berikut:</p>
                <ol class="text-justify !text-black">
                    <li>Menempuh program pembelajaran sesuai dengan rencana pembelajaran yang disusun bersama dengan guru/pembimbing.</li>
                    <li>Kelanjutan program pembelajaran (yang terkait dengan program pembelajaran sebelumnya) dapat dilaksanakan apabila hasil belajar untuk setiap kompetensi/subkompetensi program pembelajaran sebelumnya telah dinyatakan kompeten berdasar kriteria ketuntasan minimal.</li>
                </ol>
            </div>
          </div>
        }

      <!-- MODE: RAPOR (DEFAULT) -->
      @if (viewMode() === 'rapor') {
        @if (student(); as studentData) {
          
          <!-- HEADER: Muncul di Halaman 1 ATAU jika mode Full (0) -->
          @if (pageMode() === 1 || pageMode() === 0) {
            <div class="text-center mb-8 shrink-0">
              <h1 class="font-bold text-black uppercase tracking-wide text-[14pt] leading-normal">
                Laporan Hasil Belajar<br>(Rapor)
              </h1>
            </div>

            <div class="grid grid-cols-2 gap-x-10 mb-8 font-medium text-black shrink-0 leading-relaxed text-[11pt]">
              <!-- Kolom Kiri -->
              <div class="space-y-1">
                <div class="grid grid-cols-[100px_10px_1fr]"><p>Nama</p><p>:</p><p class="uppercase font-bold">{{ studentData.name }}</p></div>
                <div class="grid grid-cols-[100px_10px_1fr]"><p>NISN</p><p>:</p><p>{{ studentData.nisn }}</p></div>
                <div class="grid grid-cols-[100px_10px_1fr]"><p>Sekolah</p><p>:</p><p>{{ school().namaSekolah }}</p></div>
                <div class="grid grid-cols-[100px_10px_1fr]"><p>Alamat</p><p>:</p><p>{{ getFullAddress(school()) }}</p></div>
              </div>
              <!-- Kolom Kanan -->
              <div class="space-y-1">
                <div class="grid grid-cols-[120px_10px_1fr]"><p>Kelas</p><p>:</p><p>{{ studentData.kelas }}</p></div>
                <div class="grid grid-cols-[120px_10px_1fr]"><p>Fase</p><p>:</p><p>{{ studentData.fase }}</p></div>
                <div class="grid grid-cols-[120px_10px_1fr]"><p>Semester</p><p>:</p><p>{{ school().semester }}</p></div>
                <div class="grid grid-cols-[120px_10px_1fr]"><p>Tahun Pelajaran</p><p>:</p><p>{{ school().tahunAjaran }}</p></div>
              </div>
            </div>
          } 
          @else {
            <!-- Header Minimalis untuk Halaman Lanjutan -->
            <div class="mb-6 border-b border-gray-400 pb-2 text-[10pt] flex justify-between text-gray-600 italic shrink-0">
                <span>{{ studentData.name }} - {{ studentData.nisn }}</span>
                <span>Lanjutan Halaman {{ pageMode() }}</span>
            </div>
          }

          <!-- TABEL NILAI -->
          <div class="mb-6 flex-grow">
            @if (slicedData().hasData) {
              <table class="table-border print-text">
                <thead>
                  <tr class="bg-gray-100">
                    <th class="w-[5%] text-center">No</th>
                    <th class="w-[28%] text-center">Muatan Pelajaran</th>
                    <th class="w-[10%] text-center text-[10pt]">Nilai<br>Akhir</th>
                    <th class="w-[57%] text-center">Capaian Kompetensi</th>
                  </tr>
                </thead>
                <tbody>
                  
                  <!-- KELOMPOK A (UMUM) -->
                  @if (slicedData().subjectsA.length > 0) {
                    @if (pageMode() === 0 || pageMode() === 1) {
                      <tr class="bg-gray-50 font-bold"><td colspan="4" class="px-2 py-1">A. KELOMPOK MATA PELAJARAN UMUM:</td></tr>
                    } @else if (slicedData().isContinuedA) {
                      <tr class="bg-gray-50 font-bold italic"><td colspan="4" class="px-2 py-1 text-[10pt]">... Lanjutan Kelompok A</td></tr>
                    }

                    @for (sub of slicedData().subjectsA; track $index) {
                      <tr>
                        <td class="text-center align-top">{{ sub.globalIndex }}</td>
                        <td class="align-top font-medium">
                            <div title="{{ sub.data.name }}">{{ sub.data.name }}</div>
                        </td>
                        <td class="text-center align-top font-bold">{{ sub.data.score }}</td>
                        <td class="align-top text-justify leading-relaxed text-[10.5pt]">{{ sub.data.competency }}</td>
                      </tr>
                    }
                  }

                  <!-- KELOMPOK B (KEJURUAN) -->
                  @if (slicedData().subjectsB.length > 0) {
                    @if (pageMode() === 0 || (slicedData().isStartOfB && (pageMode() === 1 || !slicedData().isContinuedB))) {
                      <tr class="bg-gray-50 font-bold"><td colspan="4" class="px-2 py-1">B. KELOMPOK MATA PELAJARAN KEJURUAN:</td></tr>
                    } 
                    @else if (slicedData().isContinuedB) {
                      <tr class="bg-gray-50 font-bold italic"><td colspan="4" class="px-2 py-1 text-[10pt]">... Lanjutan Kelompok B</td></tr>
                    }

                    @for (sub of slicedData().subjectsB; track $index) {
                      <tr>
                        <td class="text-center align-top">{{ sub.globalIndex }}</td>
                        <td class="align-top font-medium">
                            <div title="{{ sub.data.name }}">{{ sub.data.name }}</div>
                        </td>
                        <td class="text-center align-top font-bold">{{ sub.data.score }}</td>
                        <td class="align-top text-justify leading-relaxed text-[10.5pt]">{{ sub.data.competency }}</td>
                      </tr>
                    }
                  }
                </tbody>
              </table>
            }
          </div>

          <!-- BAGIAN BAWAH (PKL, Ekskul, TTD) -->
          @if (showFooter() || pageMode() === 0) {
            <div class="shrink-0 mt-auto">
              <!-- PKL Table -->
              @if (studentData.pkl.length > 0) {
                <div class="mb-6 text-black">
                  <p class="font-bold mb-1 text-sm">Praktik Kerja Lapangan</p>
                  <table class="table-border print-text-sm">
                    <thead><tr class="bg-gray-100 font-bold"><th class="w-8">No</th><th>Mitra DU/DI</th><th>Lokasi</th><th class="w-24">Lama</th><th>Keterangan</th></tr></thead>
                    <tbody>
                      @for (pkl of studentData.pkl; track $index; let i = $index) {
                        <tr><td class="text-center">{{ i + 1 }}</td><td>{{ pkl.mitra }}</td><td>{{ pkl.lokasi }}</td><td class="text-center">{{ pkl.lama }}</td><td>{{ pkl.keterangan }}</td></tr>
                      }
                    </tbody>
                  </table>
                </div>
              }

              <!-- Extras Table -->
              <div class="mb-6 text-black">
                <p class="font-bold mb-1 text-sm">Ekstrakurikuler</p>
                <table class="table-border print-text-sm">
                  <thead><tr class="bg-gray-100 font-bold"><th class="w-8">No</th><th class="w-48">Nama Kegiatan</th><th class="w-16">Nilai</th><th>Keterangan</th></tr></thead>
                  <tbody>
                    @for (ex of studentData.extras; track $index; let i = $index) {
                      <tr><td class="text-center">{{ i + 1 }}</td><td>{{ ex.name }}</td><td class="text-center">{{ ex.grade }}</td><td>{{ ex.description }}</td></tr>
                    }
                    @if (studentData.extras.length === 0) {
                      <tr><td class="text-center">-</td><td>-</td><td class="text-center">-</td><td>-</td></tr>
                    }
                  </tbody>
                </table>
              </div>
              
              <!-- Absensi & Catatan -->
              <div class="flex gap-4 mb-4 items-start text-black print-text-sm">
                <table class="w-1/3 table-border">
                  <thead><tr><th colspan="3" class="text-center bg-gray-100 font-bold">Ketidakhadiran</th></tr></thead>
                  <tbody>
                    <tr><td>Sakit</td><td class="text-center w-12">{{ studentData.attendance.sakit }}</td><td class="w-12 text-center">hari</td></tr>
                    <tr><td>Izin</td><td class="text-center w-12">{{ studentData.attendance.izin }}</td><td class="w-12 text-center">hari</td></tr>
                    <tr><td>Tanpa Ket.</td><td class="text-center w-12">{{ studentData.attendance.alpha }}</td><td class="w-12 text-center">hari</td></tr>
                  </tbody>
                </table>
                <div class="w-2/3 space-y-2">
                  <table class="table-border">
                    <tr><td class="text-center font-bold bg-gray-100">Catatan Akademik</td></tr>
                    <tr><td class="min-h-[50px] italic align-top p-2">{{studentData.academicNote}}</td></tr>
                  </table>
                  
                  @if (school().semester?.toLowerCase()?.includes('genap')) {
                    <table class="table-border">
                      <tr><td class="text-center font-bold bg-gray-100">Kenaikan Kelas</td></tr>
                      <tr><td class="font-bold h-10 align-middle p-2">Keputusan: {{studentData.note_naik}}</td></tr>
                    </table>
                  }
                </div>
              </div>
              
              <!-- Tanda Tangan -->
              <div class="flex flex-wrap justify-between mt-4 px-4 text-center print-text-sm text-black">
                <div class="w-1/3">
                  <p class="mb-20">Orang Tua,</p>
                  <p class="border-b border-dotted border-black font-bold">{{ studentData.parentName || '....................' }}</p>
                </div>
                <div class="w-1/3">
                  <p class="mb-20">{{ school().kabupaten }}, {{ school().tglRapor }}<br>Wali Kelas</p>
                  <p class="font-bold underline">{{ school().waliKelas }}</p>
                  <p>NIP. {{ school().nipWaliKelas }}</p>
                </div>
                <div class="w-full flex justify-center mt-6">
                  <div class="w-1/3 text-center">
                    <p class="mb-20">Mengetahui,<br>Kepala Sekolah</p>
                    <p class="font-bold underline">{{ school().kepalaSekolah }}</p>
                    <p>NIP. {{ school().nipKepalaSekolah }}</p>
                  </div>
                </div>
              </div>
              
              <!-- PADDING TAMBAHAN DI AKHIR HALAMAN AGAR TEKS TIDAK TERPOTONG CANVAS -->
              <div class="h-4"></div>
            </div>
          }
        }
      }
    </div>
  `
})
export class ReportViewComponent {
  student = input.required<Student>();
  viewMode = input<string>('rapor'); // 'cover', 'identitas_sekolah', 'identitas_siswa', 'petunjuk', 'rapor'
  pageMode = input<number>(1); // 0 = FULL MODE (Infinite), 1 = Page 1, 2 = Page 2
  cutAtRow = input<number>(100); 
  showFooter = input<boolean>(false); 

  reportService = inject(ReportService);
  school = this.reportService.schoolData;

  slicedData = computed(() => {
    // Only slice data if viewMode is 'rapor'
    if (this.viewMode() !== 'rapor') {
        return { subjectsA: [], subjectsB: [], isContinuedA: false, isContinuedB: false, isStartOfB: false, hasData: false };
    }

    const s = this.student();
    const mode = this.pageMode();

    const listA = (s.subjectsA || []).map((sub, i) => ({ data: sub, globalIndex: i + 1 }));
    const listB = (s.subjectsB || []).map((sub, i) => ({ data: sub, globalIndex: i + 1 }));

    if (mode === 0) {
      return {
        subjectsA: listA,
        subjectsB: listB,
        isContinuedA: false,
        isContinuedB: false,
        isStartOfB: true,
        hasData: true
      };
    }

    const limit = this.cutAtRow(); 
    let resultA: any[] = [];
    let resultB: any[] = [];
    let isContinuedA = false;
    let isContinuedB = false; 
    let isStartOfB = true;

    const countA = listA.length;

    if (mode === 1) {
      if (countA >= limit) {
         resultA = listA.slice(0, limit);
         resultB = []; 
      } else {
         resultA = listA;
         const slotForB = limit - countA;
         resultB = listB.slice(0, slotForB);
      }
    } else {
      if (countA >= limit) {
         resultA = listA.slice(limit); 
         isContinuedA = true;
         resultB = listB; 
         isStartOfB = true;
         isContinuedB = false;
      } else {
         resultA = []; 
         const slotForBUsedInPage1 = limit - countA;
         resultB = listB.slice(slotForBUsedInPage1);
         isStartOfB = false; 
         isContinuedB = slotForBUsedInPage1 > 0; 
      }
    }

    return {
      subjectsA: resultA,
      subjectsB: resultB,
      isContinuedA,
      isContinuedB,
      isStartOfB,
      hasData: resultA.length > 0 || resultB.length > 0
    };
  });

  getFullAddress(s: SchoolData) {
     return [s.alamat, s.kelurahan, s.kecamatan, s.kabupaten, s.provinsi].filter(p => !!p && p.trim() !== '').join(', ');
  }

  getJurusanFull(code: string) {
     const c = code.toUpperCase();
     if(c.includes('TJKT')) return 'Teknik Jaringan Komputer & Telekomunikasi';
     if(c.includes('TKR')) return 'Teknik Otomotif';
     if(c.includes('BUSANA')) return 'Busana';
     if(c.includes('TPFL')) return 'Teknik Pengelasan & Fabrikasi Logam';
     return code;
  }
}
