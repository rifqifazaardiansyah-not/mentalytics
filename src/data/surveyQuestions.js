// Survey Questions Data
// Angket Pengalaman Bullying (OBVQ-R) dan Angket Kecemasan (HARS)

export const bullyingQuestions = [
  { no: 1, text: "Aku pernah dipermalukan di depan umum (misalnya: di depan teman-teman lainnya)" },
  { no: 2, text: "Aku dipanggil dengan nama julukan yang tidak aku senangi" },
  { no: 3, text: "Aku pernah digosipkan tentang sesuatu yang buruk" },
  { no: 4, text: "Aku ditolak masuk ke dalam kelompok mereka" },
  { no: 5, text: "Aku pernah diejek (Misalnya: tentang penampilanku, keluargaku, kesalahanku)" },
  { no: 6, text: "Aku pernah dipukul" },
  { no: 7, text: "Aku pernah dimintai uang secara paksa" },
  { no: 8, text: "Aku pernah dipaksa melakukan hal yang tidak aku inginkan (misalnya: membuatkan PR/tugas, dipaksa memberikan contekan, dipaksa memberikan makanan)" },
  { no: 9, text: "Aku pernah dikucilkan" },
  { no: 10, text: "Aku dikomentari tentang ras, suku, warna kulitku, bentuk rambut, bentuk fisik" },
  { no: 11, text: "Aku pernah dibentak" },
  { no: 12, text: "Aku pernah dipandang sinis" },
  { no: 13, text: "Kalau aku salah menjawab pertanyaan guru maka teman-teman menyorakiku" },
  { no: 14, text: "Aku pernah didiamkan temanku" },
  { no: 15, text: "Aku pernah didorong" },
  { no: 16, text: "Teman-teman menggodaku untuk membuatku marah" },
  { no: 17, text: "Aku pernah ditendang" },
  { no: 18, text: "Aku pernah diganggu melalui SMS/facebook" },
  { no: 19, text: "Aku pernah diminta mentraktir teman-temanku dengan paksa" },
  { no: 20, text: "Aku pernah diolok-olok (misalkan: mengenai fisikku)" },
  { no: 21, text: "Barang milikku diambil paksa (misalkan: buku, bulpoin, sepatu, tas)" },
  { no: 22, text: "Aku pernah dicubit" }
]

export const bullyingScaleOptions = [
  { value: 0, label: "Tidak pernah" },
  { value: 1, label: "1-2 kali" },
  { value: 2, label: "3-4 kali" },
  { value: 3, label: "5-6 kali" },
  { value: 4, label: "7 kali atau lebih" }
]

export const anxietyCategories = [
  {
    no: 1,
    category: "Perasaan cemas",
    symptoms: [
      "Firasat buruk",
      "Mudah tersinggung",
      "Takut akan pikiran sendiri"
    ]
  },
  {
    no: 2,
    category: "Ketegangan",
    symptoms: [
      "Merasa tegang",
      "Lesu",
      "Mudah terkejut",
      "Tidak dapat istirahat dengan tenang",
      "Mudah menangis",
      "Gemetar",
      "Gelisah"
    ]
  },
  {
    no: 3,
    category: "Ketakutan",
    symptoms: [
      "Pada gelap",
      "Ditinggal sendiri",
      "Pada orang asing",
      "Pada kerumunan banyak orang",
      "Pada keramaian lalu lintas",
      "Pada binatang besar"
    ]
  },
  {
    no: 4,
    category: "Gangguan tidur",
    symptoms: [
      "Sukar memulai tidur",
      "Terbangun malam hari",
      "Mimpi buruk",
      "Tidur tidak nyenyak",
      "Bangun dengan lesu",
      "Banyak bermimpi",
      "Mimpi menakutkan"
    ]
  },
  {
    no: 5,
    category: "Gangguan kecerdasan",
    symptoms: [
      "Daya ingat buruk",
      "Sulit berkonsentrasi",
      "Daya ingat menurun"
    ]
  },
  {
    no: 6,
    category: "Perasaan depresi",
    symptoms: [
      "Kehilangan minat",
      "Sedih",
      "Berkurangnya kesukaan pada hobi",
      "Perasaan berubah-ubah",
      "Bangun dini hari"
    ]
  },
  {
    no: 7,
    category: "Gejala somatik (otot-otot)",
    symptoms: [
      "Nyeri otot",
      "Kaku",
      "Kedutan otot",
      "Gigi gemertak",
      "Suara tak stabil"
    ]
  },
  {
    no: 8,
    category: "Gejala sensorik",
    symptoms: [
      "Telinga berdengung",
      "Penglihatan kabur",
      "Muka merah dan pucat",
      "Merasa lemah",
      "Perasaan ditusuk-tusuk"
    ]
  },
  {
    no: 9,
    category: "Gejala kardiovaskular",
    symptoms: [
      "Denyut nadi cepat",
      "Berdebar-debar",
      "Nyeri dada",
      "Rasa lemah seperti mau pingsan",
      "Denyut nadi mengeras",
      "Detak jantung menghilang (berhenti sekejap)"
    ]
  },
  {
    no: 10,
    category: "Gejala pernapasan",
    symptoms: [
      "Rasa tertekan di dada",
      "Perasaan tercekik",
      "Merasa napas pendek/sesak",
      "Sering menarik napas panjang"
    ]
  },
  {
    no: 11,
    category: "Gejala gastrointestinal",
    symptoms: [
      "Sulit menelan",
      "Mual",
      "Muntah",
      "Perut terasa penuh dan kembung",
      "Nyeri lambung sebelum makan dan sesudah",
      "Perut melilit",
      "Gangguan pencernaan",
      "Perasaan terbakar di perut",
      "Buang air besar lembek",
      "Konstipasi",
      "Kehilangan berat badan"
    ]
  },
  {
    no: 12,
    category: "Gejala urogenitalia (perkemihan dan kelamin)",
    symptoms: [
      "Sering kencing",
      "Tidak dapat menahan kencing",
      "Tidak datang bulan",
      "Darah haid berlebihan",
      "Darah haid amat sedikit",
      "Masa haid berkepanjangan",
      "Masa haid amat pendek",
      "Haid beberapa kali dalam sebulan",
      "Menjadi dingin (frigid)",
      "Ejakulasi dini",
      "Ereksi lemah",
      "Ereksi hilang",
      "Impotensi"
    ]
  },
  {
    no: 13,
    category: "Gejala otonom",
    symptoms: [
      "Mulut kering",
      "Muka merah",
      "Mudah berkeringat",
      "Sakit kepala",
      "Bulu roma berdiri",
      "Kepala terasa berat",
      "Kepala terasa sakit"
    ]
  },
  {
    no: 14,
    category: "Tingkah laku (sikap) pada wawancara",
    symptoms: [
      "Gelisah",
      "Tidak tenang",
      "Mengerutkan dahi",
      "Muka tegang",
      "Nafas pendek dan cepat",
      "Muka merah",
      "Jari gemetar",
      "Otot tegang/mengeras"
    ]
  }
]

export const anxietyEmoticons = [
  { value: 0, emoji: "😊", label: "Sangat Jarang / Tidak Pernah" },
  { value: 1, emoji: "🙂", label: "Jarang" },
  { value: 2, emoji: "😐", label: "Kadang-kadang" },
  { value: 3, emoji: "🙁", label: "Sering" },
  { value: 4, emoji: "😣", label: "Sangat Sering" }
]

// Scoring guides
export const scoringGuides = {
  bullying: {
    threshold: 22,
    categories: [
      { min: 22, max: 88, label: "Terindikasi sebagai korban bullying" },
      { min: 0, max: 21, label: "Tidak terindikasi sebagai korban bullying" }
    ]
  },
  anxiety: {
    categories: [
      { min: 0, max: 13, label: "Tidak terdapat kecemasan", color: "primary" },
      { min: 14, max: 20, label: "Kecemasan ringan", color: "info" },
      { min: 21, max: 27, label: "Kecemasan sedang", color: "warning" },
      { min: 28, max: 41, label: "Kecemasan berat", color: "danger" },
      { min: 42, max: 56, label: "Kecemasan panik", color: "danger" }
    ]
  }
}

export default {
  bullyingQuestions,
  bullyingScaleOptions,
  anxietyCategories,
  anxietyEmoticons,
  scoringGuides
}
