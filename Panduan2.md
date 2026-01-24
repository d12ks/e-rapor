
# Panduan Integrasi Database Capaian Kompetensi (V3.0)

Fitur ini memungkinkan aplikasi mengisi otomatis **Capaian Kompetensi** saat Wali Kelas menyimpan struktur mapel, serta memungkinkan update database capaian langsung dari aplikasi.

## 1. Persiapan Spreadsheet Database Capaian

1.  Buat **Google Spreadsheet Baru**.
2.  Beri nama file, misal: `DB_MASTER_CAPAIAN_ERAPOR`.
3.  Buat **3 Sheet** dengan nama persis berikut (huruf kecil semua):
    *   `capaian_kelas_x`
    *   `capaian_kelas_xi`
    *   `capaian_kelas_xii`
4.  Pada setiap sheet, buat **Header** di baris 1:
    *   Kolom A: `Mata Pelajaran`
    *   Kolom B: `Jurusan` (Isi "SEMUA" jika mapel umum, atau kode jurusan spesifik misal "TJKT")
    *   Kolom C: `Semester` (Gasal/Genap)
    *   Kolom D: `Capaian Kompetensi`
5.  **Salin ID Spreadsheet** dari URL file baru tersebut.
    *   Contoh URL: `https://docs.google.com/spreadsheets/d/1aBcDeFgHiJkLmNoPqRsTuVwXyZ/edit`
    *   ID-nya adalah: `1aBcDeFgHiJkLmNoPqRsTuVwXyZ`

## 2. Update Code.gs

Copy seluruh kode di bawah ini dan paste ke dalam **Extensions > Apps Script** di file E-Rapor utama Anda. **JANGAN LUPA** ganti variabel `CAPAIAN_DB_ID` dengan ID yang Anda dapatkan di langkah 1.

```javascript
/**
 * BACKEND E-RAPOR SMK 
 * Version: 3.0 (Auto-Fill Capaian Kompetensi & Reverse Sync)
 */

const APP_VERSION = "3.0";
// GANTI DENGAN ID FOLDER GOOGLE DRIVE ANDA
const FOLDER_ID = '1Z_NdJA_PXNJDxyDZNafq03ZXSun5y--n'; 
// GANTI DENGAN ID TEMPLATE RAPOR (KOSONG) ANDA
const TEMPLATE_ID = '1IJRb6Byl5zX3UOcRfpj1me8KIZPA4Cuh6k2QV5-Hlho';
// GANTI DENGAN ID SPREADSHEET DATABASE CAPAIAN BARU ANDA
const CAPAIAN_DB_ID = 'GANTI_DENGAN_ID_SPREADSHEET_DB_CAPAIAN_ANDA'; 

const MAX_MAPEL = 15; 
const MAX_EXTRA = 3;
const MAX_PKL = 3;

function onOpen() {
  SpreadsheetApp.getUi().createMenu('ADMIN E-RAPOR')
      .addItem('1. Setup 5 Sheet Template', 'setupMasterTemplate')
      .addSeparator()
      .addItem('Cek ID File Ini', 'showId')
      .addToUi();
}

function showId() {
  Browser.msgBox("File ID: " + SpreadsheetApp.getActiveSpreadsheet().getId());
}

function setupMasterTemplate() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  setupSheet(ss, 'Data_Sekolah', [
    ['Atribut', 'Isian Data'], ['Nama Sekolah', 'SMK NEGERI CONTOH'], ['NPSN', ''], ['Alamat', ''], ['Kelurahan', ''], ['Kecamatan', ''], ['Kabupaten', ''], ['Provinsi', ''], ['Website', ''], ['Email', ''], ['Kepala Sekolah', ''], ['NIP Kepsek', ''], ['Nama Wali Kelas', ''], ['NIP Wali Kelas', ''], ['Tanggal Rapor', ''], ['Semester', ''], ['Tahun Pelajaran', ''], ['Kelas', '']
  ], [200, 400], "#4a7c36");

  const headerSiswa = ['No', 'NISN', 'Nama Lengkap', 'L/P', 'Tempat Lahir', 'Tanggal Lahir', 'Agama', 'Status Keluarga', 'Anak Ke', 'Alamat Siswa', 'No Telp', 'Sekolah Asal', 'Diterima Kelas', 'Diterima Tanggal','Nama Ayah', 'Nama Ibu', 'Pekerjaan Ayah', 'Pekerjaan Ibu', 'Alamat Ortu', 'Telp Ortu','Nama Wali', 'Pekerjaan Wali', 'Alamat Wali', 'Telp Wali','Kelas', 'Fase', 'Jurusan'];
  setupSheet(ss, 'Data_Siswa', [headerSiswa], [40, 100, 250], "#2c3e50");

  const headerUser = ['No', 'Username', 'Password', 'Nama Guru', 'NIP', 'Role', 'Mapel Ampu', 'Kelas'];
  // Contoh user default
  const defaultUsers = [
    headerUser,
    [1, 'admin', '123456', 'Administrator', '-', 'Admin', '', ''],
    [2, 'walikelas_tjkt1', 'pass1', 'Siti Marfuah, S.Pd', '199...', 'Wali Kelas', '', ''],
    [3, 'guru_mtk', 'pass2', 'Budi Santoso, M.Pd', '198...', 'Guru Mapel', 'Matematika', 'XII TJKT 1, XII TJKT 2'],
  ];
  setupSheet(ss, 'DB_user', defaultUsers, [40, 150, 150, 200, 150, 100, 250, 250], "#8e44ad");

  let headerLeger = ['No', 'NISN', 'Nama Siswa', 'L/P'];
  for (let i = 1; i <= MAX_MAPEL; i++) { headerLeger.push('MP ' + i, 'Nilai ' + i, 'Capaian ' + i); }
  headerLeger.push('Rerata', 'Sakit', 'Izin', 'Alpha');
  for (let i = 1; i <= MAX_EXTRA; i++) { headerLeger.push('Ekskul ' + i, 'Nilai Eks ' + i); }
  for (let i = 1; i <= MAX_PKL; i++) { headerLeger.push('PKL ' + i + ' Mitra', 'PKL ' + i + ' Lokasi', 'PKL ' + i + ' Lama', 'PKL ' + i + ' Ket'); }
  headerLeger.push('Catatan Akademik'); 

  setupSheet(ss, 'Leger_Gasal', [headerLeger], [40, 100, 250, 40], "#c0392b");
  setupSheet(ss, 'Leger_Genap', [[...headerLeger, 'Keputusan Naik/Lulus']], [40, 100, 250, 40], "#d35400");

  let sheetJson = ss.getSheetByName('JSON_DATA');
  if (!sheetJson) sheetJson = ss.insertSheet('JSON_DATA');
  sheetJson.clear(); sheetJson.appendRow(['DATA_JSON_DO_NOT_EDIT']);

  const s1 = ss.getSheetByName('Sheet1');
  if (s1) ss.deleteSheet(s1);
}

function setupSheet(ss, name, data, colWidths, color) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  sheet.clear(); sheet.setTabColor(color);
  if (data && data.length > 0) {
    sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
    sheet.getRange(1, 1, 1, data[0].length).setFontWeight("bold").setBackground(color).setFontColor("white");
    sheet.setFrozenRows(1);
  }
  if (colWidths) colWidths.forEach((w, i) => sheet.setColumnWidth(i + 1, w));
}

// ================= WEB APP BACKEND =================

function doGet(e) {
  if (!e || !e.parameter) return responseJSON({status:'error', message:'No parameters', serverVersion: APP_VERSION});
  const p = e.parameter;
  
  try {
    if (p.action === 'login') return handleLogin(p);
    if (p.action === 'load') return handleLoadData(p.fileId);
    if (p.action === 'history') return handleListHistory(p.username);
    return responseJSON({status:'ready', serverVersion: APP_VERSION});
  } catch (err) {
    return responseJSON({status:'error', message: err.toString(), stack: err.stack, serverVersion: APP_VERSION});
  }
}

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    
    // Fitur Baru: Update Master Capaian ke DB Eksternal
    if (d.action === 'save_competency_master') {
      return handleSaveCompetencyMaster(d.payload);
    }

    const ss = SpreadsheetApp.openById(d.fileId);
    const userInfo = getUserInfo(d.username);

    if (!userInfo) return responseJSON({status:'error', message: 'User tidak ditemukan untuk proses penyimpanan.'});

    if (userInfo.role === 'Admin' || userInfo.role === 'Wali Kelas') {
      saveSchoolData(ss, d.payload.school);
      // AUTO-FILL LOGIC HERE
      const enrichedStudents = autoFillCompetencies(d.payload.students, d.payload.school);
      saveStudentData(ss, enrichedStudents, d.payload.school.semester);
    } else if (userInfo.role === 'Guru Mapel') {
      const mergedStudents = mergeTeacherGrades(ss, d.payload.students, userInfo.subjects);
      saveStudentData(ss, mergedStudents, d.payload.school.semester);
    } else {
       return responseJSON({status:'error', message: 'Anda tidak memiliki hak akses untuk menyimpan data.'});
    }
    
    return responseJSON({status:'success', serverVersion: APP_VERSION});
  } catch (err) {
    return responseJSON({status:'error', message: err.toString(), serverVersion: APP_VERSION});
  }
}

// --- LOGIC BARU: AUTO FILL CAPAIAN ---

function autoFillCompetencies(students, schoolData) {
  if (!students || students.length === 0) return students;

  // 1. Tentukan Sheet DB berdasarkan Kelas (X, XI, XII)
  let sheetName = '';
  const kelasStr = (schoolData.kelas || '').toUpperCase();
  if (kelasStr.includes('XII')) sheetName = 'capaian_kelas_xii';
  else if (kelasStr.includes('XI')) sheetName = 'capaian_kelas_xi';
  else if (kelasStr.includes('X')) sheetName = 'capaian_kelas_x';
  else return students; // Kelas tidak dikenali, skip

  // 2. Load Data Capaian dari DB Eksternal (Cache in memory)
  let capaianMap = new Map(); // Key: "Mapel_Jurusan_Semester", Value: "Deskripsi"
  try {
    // Validasi ID DB
    if (!CAPAIAN_DB_ID || CAPAIAN_DB_ID.includes('GANTI')) {
      // Jika ID belum diset, skip tanpa error
      return students; 
    }

    const dbSS = SpreadsheetApp.openById(CAPAIAN_DB_ID);
    const dbSheet = dbSS.getSheetByName(sheetName);
    if (dbSheet && dbSheet.getLastRow() > 1) {
      const data = dbSheet.getRange(2, 1, dbSheet.getLastRow() - 1, 4).getValues(); // A-D
      // A: Mapel, B: Jurusan, C: Semester, D: Deskripsi
      data.forEach(row => {
        const key = generateKey(row[0], row[1], row[2]);
        capaianMap.set(key, row[3]);
      });
    }
  } catch (e) {
    // Jika DB tidak bisa dibuka/error, log dan kembalikan data asli (fail safe)
    console.error("Error loading Capaian DB: " + e.toString());
    return students;
  }

  // 3. Helper untuk membuat key pencarian
  function generateKey(mapel, jurusan, semester) {
    return (String(mapel).trim().toLowerCase() + "_" + 
            String(jurusan).trim().toLowerCase() + "_" + 
            String(semester).trim().toLowerCase());
  }

  // Ambil konteks jurusan dari nama kelas (misal "XII TJKT 1" -> "TJKT")
  // Atau lebih aman ambil dari students[0].jurusan jika konsisten
  let jurusanContext = 'SEMUA';
  const parts = (schoolData.kelas || '').split(' ');
  if (parts.length > 1) jurusanContext = parts[1]; // Asumsi format "Kelas Jurusan No"
  
  const currentSemester = (schoolData.semester || '').trim();

  // 4. Loop Students & Subjects
  students.forEach(s => {
    const processSubjects = (subjects) => {
      if (!subjects) return;
      subjects.forEach(sub => {
        // Hanya isi jika competency KOSONG dan Nama Mapel ADA
        if (sub.name && (!sub.competency || sub.competency.trim() === '')) {
          
          // Coba cari match spesifik jurusan
          let key = generateKey(sub.name, jurusanContext, currentSemester);
          let desc = capaianMap.get(key);

          // Jika tidak ada, coba cari match "SEMUA" jurusan (Mapel Umum)
          if (!desc) {
            key = generateKey(sub.name, 'SEMUA', currentSemester);
            desc = capaianMap.get(key);
          }

          // Isi nilai atau strip
          sub.competency = desc ? desc : '-';
        }
      });
    };

    processSubjects(s.subjectsA);
    processSubjects(s.subjectsB);
  });

  return students;
}

// --- LOGIC BARU: SAVE KE DB MASTER ---
function handleSaveCompetencyMaster(payload) {
  // payload: { level: 'X'/'XI'/'XII', mapel: '...', jurusan: '...', semester: '...', deskripsi: '...' }
  
  try {
     if (!CAPAIAN_DB_ID || CAPAIAN_DB_ID.includes('GANTI')) throw new Error("ID Database Capaian belum dikonfigurasi di Script.");

     const level = payload.level ? payload.level.toUpperCase() : 'X';
     const sheetName = `capaian_kelas_${level.toLowerCase()}`;
     
     const dbSS = SpreadsheetApp.openById(CAPAIAN_DB_ID);
     let dbSheet = dbSS.getSheetByName(sheetName);
     
     if (!dbSheet) {
        // Auto create jika belum ada (optional)
        dbSheet = dbSS.insertSheet(sheetName);
        dbSheet.appendRow(['Mata Pelajaran', 'Jurusan', 'Semester', 'Capaian Kompetensi']);
     }

     const data = dbSheet.getDataRange().getValues();
     let rowIndex = -1;

     // Cari baris yang cocok untuk diupdate
     for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]).toLowerCase() === String(payload.mapel).toLowerCase() &&
            String(data[i][1]).toLowerCase() === String(payload.jurusan).toLowerCase() &&
            String(data[i][2]).toLowerCase() === String(payload.semester).toLowerCase()) {
            rowIndex = i + 1; // 1-based index for getRange
            break;
        }
     }

     if (rowIndex > 0) {
        // Update existing
        dbSheet.getRange(rowIndex, 4).setValue(payload.deskripsi);
     } else {
        // Insert new
        dbSheet.appendRow([payload.mapel, payload.jurusan, payload.semester, payload.deskripsi]);
     }

     return responseJSON({status: 'success', message: 'Database Capaian berhasil diperbarui.'});

  } catch (e) {
     return responseJSON({status: 'error', message: "Gagal update DB Master: " + e.message});
  }
}

// --- EXISTING FUNCTIONS (LOGIN, LOAD, ETC) ---

function handleLogin(p) {
  const user = checkCredentials(p.username, p.password);
  if (!user) {
     return responseJSON({ status: 'error', message: 'Username atau Password salah!', serverVersion: APP_VERSION });
  }

  const response = { 
    status: 'success', 
    mode: p.login_mode, 
    role: user.role, 
    subjects: user.subjects, 
    classes: user.classes,
    serverVersion: APP_VERSION 
  };

  if (p.login_mode === 'create') {
     if (user.role !== 'Wali Kelas') {
        return responseJSON({ status: 'error', message: 'Akses Ditolak: Hanya Wali Kelas yang berhak membuat file rapor baru.' });
     }
    
    const safeStr = (val, def) => (val === undefined || val === null || val === '') ? def : String(val);
    const kelasStr = safeStr(p.kelas, "X");
    const jurusanStr = safeStr(p.jurusan, "UMUM");
    const nomorStr = safeStr(p.nomorKelas, "1");
    const semesterStr = safeStr(p.semester, "Ganjil");
    const usernameSafe = safeStr(p.username, "user").trim();
    let tahunStr = "2026-2027";
    if (p.tahun) { tahunStr = String(p.tahun).replace(/\\//g, '-'); }

    const fullClass = `${kelasStr} ${jurusanStr} ${nomorStr}`.trim();
    const fileName = `${usernameSafe}_${fullClass}_${semesterStr}_${tahunStr}`;
    
    let folder = DriveApp.getFolderById(FOLDER_ID);
    const files = folder.getFilesByName(fileName);
    
    if (files.hasNext()) {
      response.fileId = files.next().getId();
      response.isNew = false;
    } else {
      const tFile = DriveApp.getFileById(TEMPLATE_ID);
      const newFile = tFile.makeCopy(fileName, folder);
      const ss = SpreadsheetApp.openById(newFile.getId());
      cleanUpNewFile(ss, p, fullClass);
      response.fileId = newFile.getId();
      response.isNew = true;
    }
  }
  return responseJSON(response);
}

function checkCredentials(username, password) {
  const ss = SpreadsheetApp.openById(TEMPLATE_ID);
  const sheet = ss.getSheetByName('DB_user');
  const uInput = (username) ? String(username).toLowerCase().trim() : "";
  const pInput = (password) ? String(password).trim() : "";

  if (!sheet || sheet.getLastRow() <= 1) {
    return (uInput === 'admin' && pInput === '123456') ? { role: 'Admin', subjects: [], classes: [] } : null;
  }

  const data = sheet.getRange(2, 2, sheet.getLastRow() - 1, 7).getValues();
  const userRow = data.find(row => String(row[0]).toLowerCase().trim() === uInput && String(row[1]).trim() === pInput);

  if (!userRow) return null;
  
  return {
    role: userRow[4] || 'Wali Kelas',
    subjects: userRow[5] ? String(userRow[5]).split(',').map(s => s.trim()) : [],
    classes: userRow[6] ? String(userRow[6]).split(',').map(s => s.trim()) : [] 
  };
}

function cleanUpNewFile(ss, params, fullClass) {
  const sh = ss.getSheetByName('Data_Sekolah');
  if (sh) {
    const v = sh.getDataRange().getValues();
    for(let i=0; i<v.length; i++) {
      if(v[i][0] == 'Semester') sh.getRange(i+1, 2).setValue(params.semester || '');
      if(v[i][0] == 'Tahun Pelajaran') sh.getRange(i+1, 2).setValue(params.tahun || '');
      if(v[i][0] == 'Kelas') sh.getRange(i+1, 2).setValue(fullClass); 
    }
  }
  ['Data_Siswa', 'Leger_Gasal', 'Leger_Genap', 'JSON_DATA', 'DB_user'].forEach(name => {
    const s = ss.getSheetByName(name);
    if (name === 'DB_user' && s) { ss.deleteSheet(s); return; }
    if (s && s.getLastRow() > 1) s.deleteRows(2, s.getLastRow() - 1);
  });
}

function handleLoadData(fileId) {
  const ss = SpreadsheetApp.openById(fileId);
  const sh = ss.getSheetByName('Data_Sekolah');
  const v = sh ? sh.getDataRange().getValues() : [];
  const getValue = (k) => { const r = v.find(x => x[0] == k); return r ? r[1] : ""; };
  const school = {
    namaSekolah: getValue('Nama Sekolah'), npsn: getValue('NPSN'), alamat: getValue('Alamat'),
    kelurahan: getValue('Kelurahan'), kecamatan: getValue('Kecamatan'), kabupaten: getValue('Kabupaten'),
    provinsi: getValue('Provinsi'), website: getValue('Website'), email: getValue('Email'),
    kepalaSekolah: getValue('Kepala Sekolah'), nipKepalaSekolah: getValue('NIP Kepsek'),
    waliKelas: getValue('Nama Wali Kelas'), nipWaliKelas: getValue('NIP Wali Kelas'),
    tglRapor: getValue('Tanggal Rapor'), semester: getValue('Semester'), tahunAjaran: getValue('Tahun Pelajaran'),
    kelas: getValue('Kelas')
  };
  const sj = ss.getSheetByName('JSON_DATA');
  let students = [];
  if (sj && sj.getLastRow() > 1) {
    const rows = sj.getRange(2, 1, sj.getLastRow()-1, 1).getValues();
    students = rows.map(r => { try { return JSON.parse(r[0]) } catch(e){return null} }).filter(x=>x);
  }
  return responseJSON({ school, students, serverVersion: APP_VERSION });
}

function handleListHistory(username) {
  const userInfo = getUserInfo(username);
  if (!userInfo) return responseJSON({ status: 'success', files: [], serverVersion: APP_VERSION });

  let folder = DriveApp.getFolderById(FOLDER_ID);
  let files = folder.getFiles();
  let result = [];
  const prefix = String(username).trim() + "_";

  while (files.hasNext()) {
    let file = files.next();
    const fileName = file.getName();
    let shouldAdd = false;

    if (userInfo.role === 'Admin') {
      shouldAdd = true;
    } else if (userInfo.role === 'Wali Kelas') {
      if (fileName.startsWith(prefix)) {
        shouldAdd = true;
      }
    } else if (userInfo.role === 'Guru Mapel') {
      const assignedClasses = userInfo.classes;
      if (assignedClasses && assignedClasses.length > 0) {
        const parts = fileName.split('_');
        if (parts.length >= 2) {
             const fileClass = parts[1].trim().toLowerCase();
             if (assignedClasses.some(c => c.trim().toLowerCase() === fileClass)) {
                shouldAdd = true;
             }
        }
        if (!shouldAdd && assignedClasses.some(c => fileName.toLowerCase().includes(`_${c.trim().toLowerCase()}_`))) {
            shouldAdd = true;
        }
      }
    }
    
    if (shouldAdd) {
      result.push({ id: file.getId(), name: file.getName(), lastUpdated: file.getLastUpdated() });
    }
  }
  
  result.sort((a,b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
  return responseJSON({ status: 'success', files: result, serverVersion: APP_VERSION });
}

function mergeTeacherGrades(ss, newStudentsData, allowedSubjects) {
  const sj = ss.getSheetByName('JSON_DATA');
  let oldStudents = [];
  if (sj && sj.getLastRow() > 1) {
    const rows = sj.getRange(2, 1, sj.getLastRow() - 1, 1).getValues();
    oldStudents = rows.map(r => { try { return JSON.parse(r[0]); } catch (e) { return null; } }).filter(x => x);
  }
  if (oldStudents.length === 0) return newStudentsData; 
  const oldStudentsMap = new Map(oldStudents.map(s => [s.nisn, s]));
  return newStudentsData.map(newStudent => {
    const oldStudent = oldStudentsMap.get(newStudent.nisn);
    if (!oldStudent) return newStudent;
    const mergeSubjects = (oldSubs, newSubs) => {
      if (!newSubs) return oldSubs || [];
      const mergedMap = new Map((oldSubs || []).map(s => [s.name, s]));
      for (const newSub of newSubs) {
        if (allowedSubjects.includes(newSub.name)) {
          mergedMap.set(newSub.name, newSub);
        }
      }
      return Array.from(mergedMap.values());
    };
    oldStudent.subjectsA = mergeSubjects(oldStudent.subjectsA, newStudent.subjectsA);
    oldStudent.subjectsB = mergeSubjects(oldStudent.subjectsB, newStudent.subjectsB);
    return oldStudent;
  });
}

function saveSchoolData(ss, data) {
  const sh = ss.getSheetByName('Data_Sekolah');
  if(!sh) return;
  const v = sh.getDataRange().getValues();
  for(let i=0; i<v.length; i++) {
    const k = v[i][0];
    if(k=='Nama Sekolah') sh.getRange(i+1,2).setValue(data.namaSekolah);
    if(k=='Alamat') sh.getRange(i+1,2).setValue(data.alamat);
    if(k=='Kepala Sekolah') sh.getRange(i+1,2).setValue(data.kepalaSekolah);
    if(k=='NIP Kepsek') sh.getRange(i+1,2).setValue(data.nipKepalaSekolah);
    if(k=='Nama Wali Kelas') sh.getRange(i+1,2).setValue(data.waliKelas);
    if(k=='NIP Wali Kelas') sh.getRange(i+1,2).setValue(data.nipWaliKelas);
    if(k=='Tanggal Rapor') sh.getRange(i+1,2).setValue(data.tglRapor);
    if(k=='NPSN') sh.getRange(i+1,2).setValue(data.npsn);
    if(k=='Kelurahan') sh.getRange(i+1,2).setValue(data.kelurahan);
    if(k=='Kecamatan') sh.getRange(i+1,2).setValue(data.kecamatan);
    if(k=='Kabupaten') sh.getRange(i+1,2).setValue(data.kabupaten);
    if(k=='Provinsi') sh.getRange(i+1,2).setValue(data.provinsi);
    if(k=='Website') sh.getRange(i+1,2).setValue(data.website);
    if(k=='Email') sh.getRange(i+1,2).setValue(data.email);
  }
}

function saveStudentData(ss, students, semester) {
  if (!students || students.length === 0) return;
  let sj = ss.getSheetByName('JSON_DATA');
  if(!sj) sj=ss.insertSheet('JSON_DATA');
  sj.clear(); sj.appendRow(['DATA']);
  const jRows = students.map(s => [JSON.stringify(s)]);
  sj.getRange(2, 1, jRows.length, 1).setValues(jRows);

  let ssia = ss.getSheetByName('Data_Siswa');
  if(ssia) {
    const lastR = ssia.getLastRow();
    if(lastR > 1) ssia.deleteRows(2, lastR-1);
    const bioRows = students.map((s, i) => [
      i + 1, "'" + (s.nisn||""), s.name||"", (s.jenisKelamin === 'Laki-laki' ? 'L' : (s.jenisKelamin === 'Perempuan' ? 'P' : '')),
      s.tempatLahir||"", s.tanggalLahir||"", s.agama||"", s.statusKeluarga||"", s.anakKe||"", s.alamat||"", s.telp||"", s.sekolahAsal||"", s.diterimaKelas||"", s.diterimaTanggal||"",
      s.namaAyah||"", s.namaIbu||"", s.pekerjaanAyah||"", s.pekerjaanIbu||"", s.alamatOrangTua||"", s.telpOrangTua||"", s.namaWali||"", s.pekerjaanWali||"", s.alamatWali||"", s.telpWali||"",
      s.kelas||"", s.fase||"", s.jurusan||""
    ]);
    if(bioRows.length) ssia.getRange(2, 1, bioRows.length, bioRows[0].length).setValues(bioRows);
  }

  const targetSheetName = (semester && semester.toLowerCase().includes('genap')) ? 'Leger_Genap' : 'Leger_Gasal';
  let sLeger = ss.getSheetByName(targetSheetName);
  if (sLeger) {
    const lastR = sLeger.getLastRow();
    if(lastR > 1) sLeger.deleteRows(2, lastR-1);
    const legerRows = students.map((s, i) => {
      let row = [i + 1, "'" + (s.nisn||""), s.name||"", (s.jenisKelamin === 'Laki-laki' ? 'L' : (s.jenisKelamin === 'Perempuan' ? 'P' : ''))];
      const allSubjects = [...(s.subjectsA||[]), ...(s.subjectsB||[])];
      const scores = allSubjects.map(x => Number(x.score)||0);
      const avg = scores.length ? (scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(1) : "0";
      
      for(let m = 0; m < MAX_MAPEL; m++) {
        if(m < allSubjects.length) { 
            row.push(allSubjects[m].name||"", allSubjects[m].score||"", allSubjects[m].competency||""); 
        } else { 
            row.push("", "", ""); 
        }
      }
      row.push(avg, s.attendance?.sakit||'-', s.attendance?.izin||'-', s.attendance?.alpha||'-');
      for(let e = 0; e < MAX_EXTRA; e++) { const ex = s.extras?.[e] || {}; row.push(ex.name || '', ex.grade || ''); }
      for(let p = 0; p < MAX_PKL; p++) { const pk = s.pkl?.[p] || {}; row.push(pk.mitra || '', pk.lokasi || '', pk.lama || '', pk.keterangan || ''); }
      row.push(s.academicNote || '-'); 
      if(targetSheetName === 'Leger_Genap') row.push(s.note_naik || ''); 
      return row;
    });
    if(legerRows.length) sLeger.getRange(2, 1, legerRows.length, legerRows[0].length).setValues(legerRows);
  }
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
