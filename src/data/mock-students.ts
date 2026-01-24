
import { Student, SubjectScore } from '../types';

const FIRST_NAMES = ['Ahmad', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fajar', 'Gita', 'Hadi', 'Indah', 'Joko'];
const LAST_NAMES = ['Santoso', 'Pratama', 'Wijaya', 'Saputra', 'Hidayat', 'Nugroho', 'Kusuma'];

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- STANDARD SUBJECTS CONFIGURATION ---
// DIKOSONGKAN TOTAL: Agar sistem tidak memaksa mapel tertentu muncul
export const STANDARD_SUBJECTS_A: SubjectScore[] = [];
export const STANDARD_SUBJECTS_B: SubjectScore[] = [];

export const EMPTY_STUDENT: Student = {
    id: 0,
    name: '',
    nisn: '',
    tempatLahir: '',
    tanggalLahir: '',
    jenisKelamin: '',
    agama: '',
    statusKeluarga: '',
    anakKe: '',
    alamat: '',
    telp: '',
    sekolahAsal: '',
    diterimaKelas: '',
    diterimaTanggal: '',
    namaAyah: '',
    namaIbu: '',
    alamatOrangTua: '',
    telpOrangTua: '',
    pekerjaanAyah: '',
    pekerjaanIbu: '',
    namaWali: '',
    alamatWali: '',
    telpWali: '',
    pekerjaanWali: '',
    kelas: '',
    fase: '',
    jurusan: '',
    semester: '',
    tahunAjaran: '',
    // Start with empty arrays so teacher inputs manually
    subjectsA: [],
    subjectsB: [],
    pkl: [],
    extras: [],
    attendance: { sakit: 0, izin: 0, alpha: 0 },
    academicNote: '',
    note_naik: '',
    teacherName: '',
    teacherNip: '',
    parentName: '',
    date: ''
};

// Data Mock tetap diisi manual untuk keperluan Demo
const ABDUL_AZIZ_RANTISI: Student = {
    id: 1,
    name: 'ABDUL AZIZ RANTISI',
    nisn: '0012345678',
    tempatLahir: 'Sragen',
    tanggalLahir: '12 Januari 2008',
    jenisKelamin: 'Laki-laki',
    agama: 'Islam',
    statusKeluarga: 'Anak Kandung',
    anakKe: '2',
    alamat: 'Jl. Raya Mondokan, Sragen',
    telp: '081234567890',
    sekolahAsal: 'SMP Negeri 1 Mondokan',
    diterimaKelas: 'X',
    diterimaTanggal: '10 Juli 2024',
    
    namaAyah: 'Slamet Rantisi',
    namaIbu: 'Siti Aminah',
    alamatOrangTua: 'Jl. Raya Mondokan, Sragen',
    telpOrangTua: '081234567891',
    pekerjaanAyah: 'Wiraswasta',
    pekerjaanIbu: 'Ibu Rumah Tangga',
    
    namaWali: '-',
    alamatWali: '-',
    telpWali: '-',
    pekerjaanWali: '-',

    kelas: 'X TJKT 1',
    fase: 'E',
    jurusan: 'Teknik Jaringan Komputer & Tel.',
    semester: 'Gasal',
    tahunAjaran: '2026/2027',
    
    subjectsA: [
      { name: 'Pendidikan Agama dan Budi Pekerti', score: 88, competency: 'Menunjukkan penguasaan yang baik dalam memahami rukun iman.' },
      { name: 'Pendidikan Pancasila', score: 90, competency: 'Mampu menerapkan nilai-nilai pancasila dalam kehidupan sehari-hari.' },
      { name: 'Bahasa Indonesia', score: 85, competency: 'Terampil dalam menyusun teks laporan hasil observasi.' },
      { name: 'Pendidikan Jasmani, Olahraga dan Kesehatan', score: 92, competency: 'Sangat baik dalam mempraktikkan teknik dasar permainan bola besar.' },
      { name: 'Sejarah', score: 87, competency: 'Memahami konsep dasar sejarah dan perkembangannya.' },
      { name: 'Seni Budaya', score: 86, competency: 'Mampu mengapresiasi karya seni rupa dua dimensi.' },
      { name: 'Bahasa Jawa', score: 84, competency: 'Memahami unggah-ungguh basa Jawa dengan baik.' },
    ],
    subjectsB: [
      { name: 'Matematika', score: 80, competency: 'Mampu menyelesaikan masalah yang berkaitan dengan barisan dan deret.' },
      { name: 'Bahasa Inggris', score: 89, competency: 'Good at expressing opinions and thoughts.' },
      { name: 'Informatika', score: 91, competency: 'Mampu menggunakan aplikasi perkantoran dengan efektif.' },
      { name: 'Projek Ilmu Pengetahuan Alam dan Sosial', score: 83, competency: 'Memahami interaksi antara makhluk hidup dan lingkungannya.' },
      { name: 'Dasar-dasar Program Keahlian', score: 90, competency: 'Memahami proses bisnis di bidang teknik jaringan komputer.' },
    ],
    pkl: [
      { mitra: '-', lokasi: '-', lama: '-', keterangan: '' },
      { mitra: '', lokasi: '', lama: '', keterangan: '' },
      { mitra: '', lokasi: '', lama: '', keterangan: '' },
    ],
    extras: [
      { name: 'PRAMUKA', grade: 'B', description: 'Ananda Abdul Aziz Rantisi memiliki kedisiplinan yang baik dalam mengikuti kegiatan kepramukaan.' },
      { name: 'PKS', grade: 'B', description: 'Ananda Abdul Aziz Rantisi Sangat berperan aktif dalam kegiatan Ekstrakurikuler Patroli Keamanan.' },
      { name: 'ROHIS', grade: 'B', description: 'Ananda Sangat berperan aktif dalam kegiatan ROHIS di SMK Negeri 1 Mondokan.' },
    ],
    attendance: {
      sakit: '10',
      izin: '-',
      alpha: '-'
    },
    academicNote: '',
    note_naik: '',
    teacherName: 'Siti Azar Marfuah, S.Pd.',
    teacherNip: '199207022023212020',
    parentName: '',
    date: '10 Januari 2026'
};


export const MOCK_STUDENTS: Student[] = [
  ABDUL_AZIZ_RANTISI, 
  ...Array.from({ length: 35 }, (_, i) => {
    const firstName = getRandomItem(FIRST_NAMES);
    const lastName = getRandomItem(LAST_NAMES);
    
    return {
      ...ABDUL_AZIZ_RANTISI, // Copy defaults
      id: i + 2,
      name: `${firstName} ${lastName}`,
      nisn: `00${getRandomInt(10000000, 99999999)}`,
      // Subjects will implicitly copy structure from ABDUL_AZIZ_RANTISI, just randomizing scores
      subjectsA: ABDUL_AZIZ_RANTISI.subjectsA.map(s => ({...s, score: getRandomInt(75, 95)})),
      subjectsB: ABDUL_AZIZ_RANTISI.subjectsB.map(s => ({...s, score: getRandomInt(70, 98)})),
      attendance: {
        sakit: getRandomInt(0, 3).toString(),
        izin: getRandomInt(0, 2).toString(),
        alpha: getRandomInt(0, 1).toString()
      }
    };
  })
];
