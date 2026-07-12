import { BookOpen, Users, BarChart3, MessageSquare, Lightbulb, CheckCircle2, ArrowRight, Sparkles, Brain, Heart, Target, AlertCircle, Play, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import MiloCharacter from '../components/milo/MiloCharacter'
import MiloDialogBubble from '../components/milo/MiloDialogBubble'

export default function Panduan() {
  const learningFlow = [
    {
      phase: 'Fase 1',
      title: 'Persiapan & Orientasi',
      color: 'bg-primary-200',
      steps: [
        {
          number: '01',
          title: 'Berkenalan dengan Milo',
          description: 'Mulai dengan menyapa Milo, teman belajar virtualmu. Baca tentang asal-usul nama MILO dan pahami perannya sebagai pembimbingmu.',
          icon: Users,
          duration: '5 menit',
        },
        {
          number: '02',
          title: 'Baca Motivasi',
          description: 'Dapatkan semangat dari Milo! Kumpulan kalimat motivasi yang akan membuatmu percaya diri untuk memulai pembelajaran.',
          icon: Sparkles,
          duration: '3 menit',
        },
        {
          number: '03',
          title: 'Pahami CP & TP',
          description: 'Pelajari Capaian Pembelajaran dan Tujuan Pembelajaran. Kamu akan tahu skill apa saja yang akan kamu kuasai setelah pembelajaran ini.',
          icon: Target,
          duration: '10 menit',
        },
      ],
    },
    {
      phase: 'Fase 2',
      title: 'Eksplorasi & Diskusi',
      color: 'bg-primary-300',
      steps: [
        {
          number: '04',
          title: 'Tonton Video & Essential Question',
          description: 'Tonton video tentang bullying dan dampaknya. Kemudian jawab Essential Question untuk memulai refleksi kritis tentang topik ini.',
          icon: Play,
          duration: '15 menit',
        },
        {
          number: '05',
          title: 'Forum Diskusi Real-time',
          description: 'Lihat jawaban teman-teman sekelasmu secara real-time! Diskusikan berbagai perspektif tentang bullying dan kesehatan mental.',
          icon: MessageSquare,
          duration: '10 menit',
        },
        {
          number: '06',
          title: 'Pahami "The Challenge"',
          description: 'Baca instruksi tantangan kelompok. Kamu akan mengumpulkan data kelas, menganalisisnya, dan membuat rekomendasi untuk sekolah.',
          icon: AlertCircle,
          duration: '5 menit',
        },
      ],
    },
    {
      phase: 'Fase 3',
      title: 'Pengumpulan Data',
      color: 'bg-primary-400',
      steps: [
        {
          number: '07',
          title: 'Guiding Resource',
          description: 'Pelajari konsep diagram pencar dengan contoh interaktif. Tanya AI jika ada yang belum dipahami tentang variabel dan korelasi data.',
          icon: Brain,
          duration: '15 menit',
          aiEnabled: true,
        },
        {
          number: '08',
          title: 'Isi Survei (Guiding Activity)',
          description: 'Jawab 2 set pertanyaan tentang bullying dan anxiety dengan skala Likert emote. Survei anonim dengan timer 15-20 menit.',
          icon: Heart,
          duration: '15-20 menit',
          important: true,
        },
        {
          number: '09',
          title: 'Lihat Hasil Kelas',
          description: 'Setelah survei selesai, lihat tabel hasil seluruh kelas. Data milikmu akan di-highlight. Ini adalah data yang akan kamu analisis!',
          icon: BarChart3,
          duration: '5 menit',
        },
      ],
    },
    {
      phase: 'Fase 4',
      title: 'Analisis & Rekomendasi',
      color: 'bg-primary-500',
      steps: [
        {
          number: '10',
          title: 'Eksplorasi Diagram Pencar',
          description: 'Input data dari tabel hasil survei ke diagram pencar interaktif. Gambar garis regresi dan analisis korelasi secara visual.',
          icon: BarChart3,
          duration: '20 menit',
        },
        {
          number: '11',
          title: 'Buat Solution & Presentasi',
          description: 'Tulis rekomendasi solusi dan langkah aksi konkret berdasarkan analisis diagram. Lihat halaman presentasi untuk sharing ke kelompok lain. AI siap membantu!',
          icon: Lightbulb,
          duration: '25 menit',
          aiEnabled: true,
        },
        {
          number: '12',
          title: 'Review Hasil Tes & Rekomendasi AI',
          description: 'AI akan membuat rekomendasi final berdasarkan analisis data kelas. Kamu bisa bertanya lebih dalam tentang hasilnya.',
          icon: Sparkles,
          duration: '15 menit',
          aiEnabled: true,
        },
      ],
    },
  ]

  const features = [
    {
      icon: Users,
      title: 'Karakter Milo',
      description: 'Milo adalah AI Coach yang membimbingmu dengan Socratic method. Dia tidak akan memberi jawaban langsung, tapi akan mengajukan pertanyaan yang membuatmu berpikir kritis.',
      color: 'from-primary-200 to-primary-300',
    },
    {
      icon: MessageSquare,
      title: 'Forum Diskusi Real-time',
      description: 'Teknologi Supabase Realtime memungkinkan kamu melihat jawaban teman sekelas muncul secara langsung tanpa perlu refresh halaman.',
      color: 'from-primary-300 to-primary-400',
    },
    {
      icon: BarChart3,
      title: 'Analisis Data Interaktif',
      description: 'Visualisasi scatter plot dengan Recharts. Kamu bisa hover titik data untuk lihat detail, drag untuk explore, dan memahami pola korelasi secara visual.',
      color: 'from-primary-400 to-primary-500',
    },
    {
      icon: Lightbulb,
      title: 'AI Assistant (Claude)',
      description: 'AI hadir di 3 titik pembelajaran: memahami konsep, feedback rekomendasi, dan review akhir. Semuanya dengan konteks yang disesuaikan dengan posisimu di pembelajaran.',
      color: 'from-primary-500 to-primary-600',
    },
  ]

  const tips = [
    {
      title: 'Jangan Terburu-buru',
      description: 'Ambil waktu untuk membaca setiap instruksi. Pembelajaran ini dirancang untuk membuatmu berpikir, bukan cuma menyelesaikan task.',
    },
    {
      title: 'Manfaatkan AI dengan Bijak',
      description: 'AI tidak akan memberi jawaban langsung. Gunakan untuk bertanya "mengapa" dan "bagaimana", bukan "apa jawabannya".',
    },
    {
      title: 'Berkolaborasi dengan Teman',
      description: 'Diskusikan temuanmu dengan teman sekelompok. Data yang kamu analisis adalah data bersama, jadi insight bersama akan lebih kaya.',
    },
    {
      title: 'Jujur Saat Isi Survei',
      description: 'Survei bersifat anonim. Jawab dengan jujur agar data yang terkumpul akurat dan analisismu bermakna.',
    },
  ]

  return (
    <div className="min-h-screen bg-bg">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-100 via-primary-200 to-primary-300 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/50 backdrop-blur-sm rounded-full mb-6">
              <BookOpen className="w-10 h-10 text-primary-700" />
            </div>
            <h1 className="text-4xl md:text-5xl font-poppins font-semibold text-ink-900 mb-4">
              Panduan Penggunaan
            </h1>
            <p className="text-xl text-ink-600 max-w-2xl mx-auto">
              Ikuti langkah-langkah berikut untuk pengalaman belajar yang optimal
            </p>
          </motion.div>

          {/* Milo Guide */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            <div className="flex items-start gap-6 bg-white/50 backdrop-blur-sm rounded-2xl p-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-24">
                  <img
                    src="/assets/milo/milo-explain.png"
                    alt="Milo"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Ctext x="50" y="50" font-size="60" text-anchor="middle" dominant-baseline="middle"%3E🤖%3C/text%3E%3C/svg%3E'
                    }}
                  />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-milo text-ink-900 leading-relaxed">
                  Hai! Aku Milo, pembimbingmu hari ini. Panduan ini akan membantumu memahami seluruh alur pembelajaran dari awal sampai akhir. 
                  Ada <span className="font-semibold text-primary-700">12 langkah</span> yang dibagi menjadi <span className="font-semibold text-primary-700">4 fase</span>. 
                  Estimasi waktu total: <span className="font-semibold text-primary-700">~2-3 jam</span>. Let's go! 
                  <Sparkles className="w-5 h-5 inline-block ml-1 text-primary-600" />
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Learning Flow */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-poppins font-semibold text-ink-900 mb-12 text-center flex items-center justify-center gap-3">
            Alur Pembelajaran Lengkap 
            <BookOpen className="w-8 h-8 text-primary-600" />
          </h2>

          <div className="space-y-12">
            {learningFlow.map((phase, phaseIndex) => (
              <motion.div
                key={phaseIndex}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: phaseIndex * 0.1 }}
              >
                {/* Phase Header */}
                <div className={`${phase.color} rounded-2xl p-6 mb-6`}>
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-bold text-ink-900 bg-white/50 px-3 py-1 rounded-full">
                      {phase.phase}
                    </div>
                    <h3 className="text-2xl font-poppins font-semibold text-ink-900">
                      {phase.title}
                    </h3>
                  </div>
                </div>

                {/* Phase Steps */}
                <div className="grid md:grid-cols-3 gap-6">
                  {phase.steps.map((step, stepIndex) => (
                    <div
                      key={stepIndex}
                      className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all"
                    >
                      {/* Step Number & Icon */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                            <step.icon className="w-6 h-6 text-primary-700" />
                          </div>
                          <span className="text-2xl font-bold text-primary-600">{step.number}</span>
                        </div>
                        {step.aiEnabled && (
                          <div className="bg-info/20 px-2 py-1 rounded text-xs font-semibold text-info flex items-center gap-1">
                            AI <Brain className="w-3 h-3" />
                          </div>
                        )}
                        {step.important && (
                          <div className="bg-warning/20 px-2 py-1 rounded text-xs font-semibold text-warning flex items-center gap-1">
                            Penting <Clock className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      {/* Step Content */}
                      <h4 className="text-lg font-poppins font-semibold text-ink-900 mb-3">
                        {step.title}
                      </h4>
                      <p className="text-sm text-ink-600 leading-relaxed mb-4">
                        {step.description}
                      </p>
                      
                      {/* Duration */}
                      <div className="flex items-center gap-2 text-sm text-primary-700 font-medium">
                        <div className="w-1.5 h-1.5 bg-primary-700 rounded-full"></div>
                        {step.duration}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Detail */}
      <section className="py-16 bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-poppins font-semibold text-ink-900 mb-4 flex items-center justify-center gap-3">
              Fitur Unggulan 
              <Sparkles className="w-8 h-8 text-primary-600" />
            </h2>
            <p className="text-lg text-ink-600 max-w-2xl mx-auto">
              Teknologi dan pendekatan yang membuat pembelajaran lebih efektif
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div className={`bg-gradient-to-br ${feature.color} rounded-2xl p-8 shadow-md hover:shadow-xl transition-all`}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-white/50 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <feature.icon className="w-7 h-7 text-ink-900" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-poppins font-semibold text-ink-900 mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-ink-900/80 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-poppins font-semibold text-ink-900 mb-4 flex items-center justify-center gap-3">
              Tips Sukses 
              <Lightbulb className="w-8 h-8 text-primary-600" />
            </h2>
            <p className="text-lg text-ink-600">
              Maksimalkan pengalaman belajarmu dengan tips berikut
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {tips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-md border-l-4 border-primary-600"
              >
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-poppins font-semibold text-ink-900 mb-2">
                      {tip.title}
                    </h3>
                    <p className="text-ink-600 leading-relaxed">
                      {tip.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary-700 to-primary-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-poppins font-semibold text-white mb-4 flex items-center justify-center gap-3">
              Siap Memulai Pembelajaran? 
              <Target className="w-8 h-8 text-white" />
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Sudah paham alur lengkapnya? Yuk, mulai perjalanan belajarmu bersama Milo!
            </p>
            <a
              href="/tap-milo"
              className="inline-flex items-center gap-3 px-10 py-5 bg-white hover:bg-primary-50 text-primary-700 rounded-xl font-poppins font-bold text-lg transition-all shadow-lg hover:shadow-2xl hover:-translate-y-1"
            >
              Mulai Sekarang
              <ArrowRight className="w-6 h-6" />
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
