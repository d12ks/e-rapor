
export interface SubjectScore {
  name: string;
  score: number;
  competency: string;
}

export interface Attendance {
  sakit: number | string;
  izin: number | string;
  alpha: number | string;
}

export interface Extracurricular {
  name:string;
  grade: string;
  description: string;
}

export interface PKL {
  mitra: string;
  lokasi: string;
  lama: string;
  keterangan: string;
}

export interface SchoolData {
  namaSekolah: string;
  npsn: string;
  alamat: string;
  kelurahan: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  website: string;
  email: string;
  kepalaSekolah: string;
  nipKepalaSekolah: string;
  // NEW FIELDS FOR WALI KELAS
  waliKelas: string;
  nipWaliKelas: string;
  
  tglRapor: string;
  semester: string;
  tahunAjaran: string;
  kelas?: string; // String lengkap dari Sheet (misal: XII TJKT 4)
}

export interface Student {
  id: number;
  // Identitas Siswa
  name: string;
  nisn: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: string;
  agama: string;
  statusKeluarga: string;
  anakKe: string;
  alamat: string;
  telp: string;
  sekolahAsal: string;
  diterimaKelas: string;
  diterimaTanggal: string;

  // Akademik
  kelas: string;
  fase: string;
  jurusan: string; 
  semester: string;
  tahunAjaran: string;
  
  // Orang Tua
  namaAyah: string;
  namaIbu: string;
  alamatOrangTua: string;
  telpOrangTua: string;
  pekerjaanAyah: string;
  pekerjaanIbu: string;
  
  // Wali
  namaWali: string;
  alamatWali: string;
  telpWali: string;
  pekerjaanWali: string;

  // Nilai
  subjectsA: SubjectScore[];
  subjectsB: SubjectScore[];
  pkl: PKL[];
  extras: Extracurricular[];
  attendance: Attendance;
  academicNote: string; // Catatan Wali Kelas
  note_naik: string;    // Keputusan Naik/Tidak
  
  // Tanda Tangan Rapor (Diambil dari SchoolData, tapi disimpan di sini untuk compatibilitas)
  teacherName: string;
  teacherNip: string;
  parentName: string;
  date: string;
}
