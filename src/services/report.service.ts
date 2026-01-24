
import { Injectable, signal, computed } from '@angular/core';
import { Student, SchoolData } from '../types';
import { MOCK_STUDENTS, EMPTY_STUDENT } from '../data/mock-students';

type UserRole = 'Wali Kelas' | 'Guru Mapel' | 'Admin' | null;

interface CompetencyEntry {
  mapel: string;
  jurusan: string;
  semester: string;
  deskripsi: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  // --- STATE ---
  private isLoggedInSignal = signal<boolean>(false);
  private currentUserSignal = signal<string>('');
  
  public isLoadingSignal = signal<boolean>(false);
  
  // RBAC State
  private userRoleSignal = signal<UserRole>(null);
  private userSubjectsSignal = signal<string[]>([]);
  private userClassesSignal = signal<string[]>([]); 
  
  // GAS Configuration
  private gasUrl = '';
  private currentFileIdSignal = signal<string>('');
  
  // Data
  private schoolDataSignal = signal<SchoolData>({
    namaSekolah: 'SMK NEGERI ...',
    npsn: '',
    alamat: '',
    kelurahan: '',
    kecamatan: '',
    kabupaten: '',
    provinsi: '',
    website: '',
    email: '',
    kepalaSekolah: '',
    nipKepalaSekolah: '',
    waliKelas: '',
    nipWaliKelas: '',
    tglRapor: '',
    semester: '',
    tahunAjaran: ''
  });

  private studentsSignal = signal<Student[]>([]);
  private selectedStudentIdSignal = signal<number>(0);

  // --- MASTER COMPETENCY DATABASE (CLIENT CACHE) ---
  private masterCompetenciesSignal = signal<CompetencyEntry[]>([]);
  public isMasterDataLoaded = computed(() => this.masterCompetenciesSignal().length > 0);

  // --- READONLY SIGNALS ---
  readonly isLoggedIn = this.isLoggedInSignal.asReadonly();
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly currentFileId = this.currentFileIdSignal.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();
  readonly schoolData = this.schoolDataSignal.asReadonly();
  readonly students = this.studentsSignal.asReadonly();
  readonly masterCompetencies = this.masterCompetenciesSignal.asReadonly();

  readonly userRole = this.userRoleSignal.asReadonly();
  readonly userSubjects = this.userSubjectsSignal.asReadonly();
  readonly userClasses = this.userClassesSignal.asReadonly();
  
  readonly selectedStudent = computed(() => {
    return this.studentsSignal().find(s => s.id === this.selectedStudentIdSignal()) || this.studentsSignal()[0] || MOCK_STUDENTS[0];
  });

  // --- CONFIG ---
  setGasUrl(url: string) {
    this.gasUrl = url.trim(); 
  }

  // --- ACTIONS ---

  async login(
    loginMode: 'open' | 'create',
    username: string, 
    password: string, 
    kelas?: string, 
    jurusan?: string, 
    nomorKelas?: string, 
    semester?: string, 
    tahunAjaran?: string
  ) {
    this.isLoadingSignal.set(true);

    try {
      const params = new URLSearchParams({
        action: 'login',
        username: username.trim(),
        password: password.trim(), 
        login_mode: loginMode
      });

      if (loginMode === 'create') {
          params.append('kelas', kelas || '');
          params.append('jurusan', jurusan || '');
          params.append('nomorKelas', nomorKelas || '');
          params.append('semester', semester || '');
          params.append('tahun', tahunAjaran || '');

          if (semester && tahunAjaran) {
            this.schoolDataSignal.update(s => ({
              ...s,
              semester: semester,
              tahunAjaran: tahunAjaran,
            }));
          }
      }

      const loginRes = await fetch(`${this.gasUrl}?${params.toString()}`, {
        method: 'GET',
        redirect: 'follow'
      });
      
      if (!loginRes.ok) {
         if (loginRes.status === 405) {
            throw new Error('Method Not Allowed: Pastikan deployment script diatur sebagai "Web App" dan akses "Anyone".');
         }
         throw new Error(`HTTP Error: ${loginRes.status}`);
      }
      
      const contentType = loginRes.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
         throw new Error("Respon Server Tidak Valid. Kemungkinan URL salah atau Script Error (Cek Deployment).");
      }

      const loginData = await loginRes.json();
      if (loginData.status === 'error') throw new Error(loginData.message);

      this.currentUserSignal.set(username);
      this.userRoleSignal.set(loginData.role || 'Wali Kelas');
      this.userSubjectsSignal.set(loginData.subjects || []);
      
      this.userClassesSignal.set(loginData.classes || []);

      if (loginMode === 'create') {
        if (loginData.fileId) {
          this.currentFileIdSignal.set(loginData.fileId);
          await this.loadData(loginData.fileId);
          
          if (semester && tahunAjaran) {
            this.schoolDataSignal.update(s => ({
              ...s,
              semester: s.semester || semester,
              tahunAjaran: s.tahunAjaran || tahunAjaran
            }));
          }
        } else {
          throw new Error('Server GAS tidak mengembalikan File ID setelah mencoba membuat file baru. Proses dibatalkan.');
        }
      } else {
          this.currentFileIdSignal.set(''); 
      }

      this.isLoggedInSignal.set(true);
    } catch (e: any) {
      console.error(e);
      let msg = e.message;
      if (e.name === 'TypeError' && e.message === 'Failed to fetch') {
        msg = 'Gagal terhubung. Cek koneksi internet atau URL Script. Pastikan Deployment diatur ke "Anyone" (Siapa Saja).';
      }
      throw new Error(msg); 
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  private async loadData(fileId: string) {
    const params = new URLSearchParams({
      action: 'load',
      fileId: fileId
    });

    const res = await fetch(`${this.gasUrl}?${params.toString()}`, {
      method: 'GET',
      redirect: 'follow'
    });
    
    const data = await res.json();
    
    if (data.status === 'error') throw new Error(data.message);

    if (data.school) {
      this.schoolDataSignal.update(curr => ({ ...curr, ...data.school }));
    }

    if (data.students && Array.isArray(data.students) && data.students.length > 0) {
      this.studentsSignal.set(data.students);
    } else {
      console.log('Data siswa kosong, memuat template kosong.');
      const templateSiswa = structuredClone(EMPTY_STUDENT);
      templateSiswa.id = 1;
      templateSiswa.name = "Siswa Baru"; 
      templateSiswa.nisn = "";
      this.studentsSignal.set([templateSiswa]);
    }
    
    if (this.studentsSignal().length > 0) {
      this.selectedStudentIdSignal.set(this.studentsSignal()[0].id);
    }

    // --- TRIGGER AUTO FETCH MASTER DATA ---
    this.reloadMasterCompetencies();
  }

  // --- SMART LOGIC: FETCH MASTER COMPETENCIES ---
  // Public wrapper so components can trigger retry
  public reloadMasterCompetencies() {
    this.fetchMasterCompetencies();
  }
  
  public clearMasterCache() {
      // Clear cache local first
      this.masterCompetenciesSignal.set([]);
      // Then reload
      this.reloadMasterCompetencies();
  }

  private async fetchMasterCompetencies() {
    try {
        const school = this.schoolDataSignal();
        // Determine Level (X, XI, XII)
        let level = 'X';
        const kelas = (school.kelas || '').toUpperCase();
        if (kelas.includes('XII')) level = 'XII';
        else if (kelas.includes('XI')) level = 'XI';
        
        console.log(`Auto-Fill: Fetching for Level ${level}...`);

        const params = new URLSearchParams({
            action: 'get_competency_master',
            level: level
        });

        const res = await fetch(`${this.gasUrl}?${params.toString()}`, {
            method: 'GET',
            redirect: 'follow'
        });
        
        const data = await res.json();
        
        if (data.status === 'success' && Array.isArray(data.data)) {
            const cleanData: CompetencyEntry[] = data.data.map((row: string[]) => ({
                mapel: String(row[0]).trim().toLowerCase(),
                jurusan: String(row[1]).trim().toLowerCase(),
                semester: String(row[2]).trim().toLowerCase(),
                deskripsi: String(row[3]).trim()
            }));

            this.masterCompetenciesSignal.set(cleanData);
            console.log('Auto-Fill: Master Competencies Loaded:', cleanData.length, 'entries');
        } else {
            console.warn('Auto-Fill: API returned no data or error.', data);
        }
    } catch (e) {
        console.warn('Auto-Fill: Failed to load master competencies:', e);
    }
  }

  // --- SMART LOGIC: GET COMPETENCY FOR SUBJECT ---
  getCompetencyForSubject(subjectName: string): string | null {
     if (!subjectName) return null;
     
     const master = this.masterCompetenciesSignal();
     if (master.length === 0) {
        // Fallback: If empty, maybe try loading again if not already trying?
        // But avoid infinite loop. Just return null for now.
        return null; 
     }

     const school = this.schoolDataSignal();
     
     // NORMALIZE SEMESTER: "Ganjil" == "Gasal"
     let currentSemester = (school.semester || 'Gasal').toLowerCase().trim();
     if (currentSemester === 'ganjil') currentSemester = 'gasal';
     
     // EXTRACT JURUSAN CONTEXT
     let jurusanContext = 'semua';
     if (school.kelas) {
        const parts = school.kelas.trim().split(' ');
        if (parts.length >= 2) {
             // Example: "XII TJKT 1" -> "TJKT" is usually at index 1
             jurusanContext = parts[1].toLowerCase().trim();
        }
     }

     const targetMapel = subjectName.trim().toLowerCase();

     // STRATEGY:
     // 1. Exact Match: Mapel + Jurusan + Semester
     // 2. Fallback Jurusan: Mapel + 'semua' + Semester
     // 3. Fallback Semester (Relaxed): Mapel + Jurusan
     // 4. Fallback All: Mapel only (if unique enough)

     // Helper to match mapel name loosely (contains)
     const isMapelMatch = (dbMapel: string) => {
         return dbMapel === targetMapel || targetMapel.includes(dbMapel) || dbMapel.includes(targetMapel);
     };

     // 1. Specific Jurusan & Semester
     let match = master.find(m => 
         m.mapel === targetMapel && 
         m.jurusan === jurusanContext && 
         m.semester === currentSemester
     );

     // 2. 'SEMUA' Jurusan & Semester
     if (!match) {
         match = master.find(m => 
             m.mapel === targetMapel && 
             m.jurusan === 'semua' && 
             m.semester === currentSemester
         );
     }
     
     // 3. Loose Mapel Match + Correct Context (in case of typos like "Matematika (Wajib)")
     if (!match) {
        match = master.find(m => 
             targetMapel.includes(m.mapel) && 
             (m.jurusan === jurusanContext || m.jurusan === 'semua') &&
             m.semester === currentSemester
         );
     }

     if (match) {
         console.log(`Auto-Fill: Matched "${subjectName}" -> "${match.deskripsi.substring(0, 20)}..."`);
         return match.deskripsi;
     }

     return null;
  }

  canEditSubject(subjectName: string): boolean {
    const role = this.userRole();
    if (role === 'Admin' || role === 'Wali Kelas') {
      return true;
    }
    if (role === 'Guru Mapel') {
      return this.userSubjects().includes(subjectName);
    }
    return false;
  }
  
  async getHistoryFiles() {
    const params = new URLSearchParams({
        action: 'history',
        username: this.currentUserSignal()
    });

    const res = await fetch(`${this.gasUrl}?${params.toString()}`, {
        method: 'GET',
        redirect: 'follow'
    });

    const data = await res.json();
    if (data.status === 'error') throw new Error(data.message);
    
    return data.files || [];
  }

  async loadHistoryFile(fileId: string) {
    this.isLoadingSignal.set(true);
    try {
        this.currentFileIdSignal.set(fileId);
        await this.loadData(fileId);
    } finally {
        this.isLoadingSignal.set(false);
    }
  }

  logout() {
    this.isLoggedInSignal.set(false);
    this.currentUserSignal.set('');
    this.currentFileIdSignal.set('');
    this.studentsSignal.set([]);
    this.userRoleSignal.set(null);
    this.userSubjectsSignal.set([]);
    this.userClassesSignal.set([]);
    this.masterCompetenciesSignal.set([]);
  }

  updateSchoolData(data: SchoolData) {
    this.schoolDataSignal.set(data);
  }

  selectStudent(id: number) {
    this.selectedStudentIdSignal.set(id);
  }

  updateStudent(updatedStudent: Student) {
    this.studentsSignal.update(students => 
      students.map(s => s.id === updatedStudent.id ? updatedStudent : s)
    );
  }

  syncSubjectsToAllStudents(sourceId: number) {
    const currentStudents = this.studentsSignal();
    const sourceStudent = currentStudents.find(s => s.id === sourceId);
    
    if (!sourceStudent) {
      console.error("Source student not found");
      return;
    }

    const templateSubjectsA = (sourceStudent.subjectsA || []).map(s => ({
       name: s.name,
       score: 0,
       competency: s.competency || '' // Preserve if exists in template
    }));
    
    const templateSubjectsB = (sourceStudent.subjectsB || []).map(s => ({
       name: s.name,
       score: 0,
       competency: s.competency || ''
    }));

    const updatedList = currentStudents.map(student => {
      if (student.id === sourceId) {
        return student;
      }
      return {
        ...student,
        subjectsA: templateSubjectsA.map(t => ({...t})),
        subjectsB: templateSubjectsB.map(t => ({...t}))
      };
    });
    
    this.studentsSignal.set(updatedList);
  }

  deleteStudent(id: number) {
    const currentList = this.studentsSignal();
    const newList = currentList.filter(s => s.id !== id);
    
    this.studentsSignal.set(newList);

    if (this.selectedStudentIdSignal() === id) {
      if (newList.length > 0) {
        this.selectedStudentIdSignal.set(newList[0].id);
      } else {
        this.selectedStudentIdSignal.set(0); 
      }
    }
  }

  createNewStudent() {
    this.studentsSignal.update(currentStudents => {
       const maxId = currentStudents.reduce((max, s) => Math.max(max, s.id), 0);
       const newStudent = structuredClone(EMPTY_STUDENT); 
       newStudent.id = maxId + 1;
       newStudent.name = "SISWA BARU";
       
       return [...currentStudents, newStudent];
    });
    return Math.max(...this.studentsSignal().map(s => s.id));
  }

  addStudents(newStudents: Partial<Student>[]) {
    this.studentsSignal.update(currentStudents => {
      const isPlaceholder = currentStudents.length === 1 && (currentStudents[0].name === 'Siswa Baru' || !currentStudents[0].nisn);
      const baseList = isPlaceholder ? [] : currentStudents;
      
      const existingNisns = new Set(baseList.map(s => s.nisn));
      const studentsToAdd = newStudents.filter(s => s.nisn && !existingNisns.has(s.nisn));

      if (studentsToAdd.length === 0) {
        alert('Tidak ada siswa baru yang ditambahkan. Semua NISN dari file import sudah ada di data saat ini.');
        return currentStudents;
      }

      let lastId = baseList.reduce((max, s) => Math.max(max, s.id), 0);
      
      const fullStudentData = studentsToAdd.map((partialStudent) => {
        const defaultStudentData = structuredClone(EMPTY_STUDENT);
        
        const merged = {
          ...defaultStudentData,
          ...partialStudent,
          id: ++lastId,
          subjectsA: partialStudent.subjectsA || defaultStudentData.subjectsA,
          subjectsB: partialStudent.subjectsB || defaultStudentData.subjectsB,
          pkl: partialStudent.pkl || [],
          extras: partialStudent.extras || [],
          attendance: partialStudent.attendance || {sakit: 0, izin: 0, alpha: 0},
        } as Student;

        return merged;
      });

      alert(`${fullStudentData.length} siswa baru berhasil ditambahkan. Template kosong dihapus (jika ada). Jangan lupa klik SIMPAN DATA.`);
      return [...baseList, ...fullStudentData];
    });

    if (this.studentsSignal().length > 0) {
       this.selectedStudentIdSignal.set(this.studentsSignal()[0].id);
    }
  }

  async saveData() {
    if (!this.currentFileIdSignal()) {
      alert('Kesalahan: Tidak ada file rapor aktif yang dipilih. Silakan kembali ke menu utama, lalu buka file dari Riwayat atau Buat File Baru.');
      return;
    }

    this.isLoadingSignal.set(true); 
      
    const cleanStudents = this.studentsSignal().map(s => ({
       ...s,
       subjectsA: s.subjectsA || [],
       subjectsB: s.subjectsB || [],
       pkl: s.pkl || [],
       extras: s.extras || [],
       attendance: s.attendance || {sakit:0, izin:0, alpha:0}
    }));

    const payload = {
      fileId: this.currentFileIdSignal(),
      username: this.currentUserSignal(),
      payload: {
        school: this.schoolDataSignal(),
        students: cleanStudents
      }
    };

    try {
      const res = await fetch(this.gasUrl, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'text/plain' 
        },
        redirect: 'follow'
      });

      const json = await res.json();
      if (json.status === 'error') throw new Error(json.message);
      
      await new Promise(r => setTimeout(r, 500));
      
      alert('Data Berhasil Disimpan ke Google Spreadsheet!');
    } catch (e: any) {
      console.error(e);
      let msg = e.message;
      if (e.name === 'TypeError' && e.message === 'Failed to fetch') {
         msg = 'Network Error: Gagal menyimpan. Cek koneksi atau izin script (Deployment must be "Anyone").';
      }
      alert('Gagal menyimpan: ' + msg);
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  getGasCode(): string {
    return 'Code is available in Panduan.md';
  }
}
