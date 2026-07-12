import { Users, Heart, Target, Sparkles, Award, GraduationCap } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AboutUs() {
  const advisor = {
    name: 'Dr. Nuriana Rachmani Dewi (Nino Adhi), M.Pd.',
    role: 'Dosen Pembimbing',
    program: 'Pendidikan Matematika',
    photo: '/assets/team/advisor.jpg',
    description: 'Dosen pembimbing yang membimbing tim dalam mengembangkan platform pembelajaran inovatif ini dengan pendekatan Challenge Based Learning.',
  }

  const teamMembers = [
    {
      name: 'Najwa Qoirun Nisa',
      program: 'Pendidikan Matematika',
      photo: '/assets/team/najwa.jpg',
      role: 'Researcher',
    },
    {
      name: 'Rifqi Faza Ardiansyah',
      program: 'Sistem Informasi',
      photo: '/assets/team/rifqi.jpg',
      role: 'Developer & System Analyst',
    },
    {
      name: 'Nada Syifa Salsabila',
      program: 'Pendidikan Biologi',
      photo: '/assets/team/nada.jpg',
      role: 'Content Developer',
    },
    {
      name: 'Dewi Amalia Khasani',
      program: 'Pendidikan Biologi',
      photo: '/assets/team/dewi.jpg',
      role: 'Content Developer',
    },
  ]

  const values = [
    {
      icon: Target,
      title: 'Inovasi Pembelajaran',
      description: 'Menggabungkan teknologi dengan pedagogik untuk menciptakan pengalaman belajar yang bermakna',
      color: 'bg-primary-200',
    },
    {
      icon: Heart,
      title: 'Kepedulian Mental',
      description: 'Memberikan ruang aman untuk membahas isu kesehatan mental dengan pendekatan berbasis data',
      color: 'bg-primary-300',
    },
    {
      icon: Sparkles,
      title: 'Kolaborasi & Empati',
      description: 'Mendorong siswa untuk berkolaborasi dan mengembangkan empati melalui data nyata',
      color: 'bg-primary-400',
    },
    {
      icon: GraduationCap,
      title: 'Literasi Data',
      description: 'Meningkatkan kemampuan siswa dalam menganalisis data dan membuat keputusan berbasis bukti',
      color: 'bg-primary-500',
    },
  ]

  const stats = [
    { number: '4', label: 'Anggota Tim' },
    { number: '3', label: 'Program Studi' },
    { number: '1', label: 'Dosen Pembimbing' },
    { number: '100%', label: 'Dedikasi' },
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
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/50 backdrop-blur-sm rounded-full mb-6">
              <Users className="w-10 h-10 text-primary-700" />
            </div>
            <h1 className="text-4xl md:text-5xl font-poppins font-semibold text-ink-900 mb-4">
              Tentang Kami
            </h1>
            <p className="text-xl text-ink-600 max-w-3xl mx-auto leading-relaxed">
              Tim mahasiswa lintas program studi yang bersemangat mengembangkan platform pembelajaran 
              inovatif untuk kesehatan mental dan literasi data
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-primary-700 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-poppins font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-sm md:text-base text-white/90">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Mentalytics */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-10 h-10 text-primary-600" />
                <h2 className="text-3xl font-poppins font-semibold text-ink-900">
                  Mentalytics
                </h2>
              </div>
              <div className="space-y-4 text-lg text-ink-600 leading-relaxed">
                <p>
                  <span className="font-semibold text-primary-700">Mentalytics</span> adalah platform pembelajaran interaktif 
                  berbasis <span className="font-semibold">Challenge Based Learning (CBL)</span> yang dirancang khusus untuk 
                  siswa SMA Fase E. Kami menggabungkan pembelajaran statistika dengan isu kesehatan mental dan anti-bullying.
                </p>
                <p>
                  Platform ini menggunakan pendekatan berbasis data, di mana siswa mengumpulkan data kelas mereka sendiri 
                  melalui survei anonim tentang <span className="font-semibold">bullying dan anxiety</span>, lalu menganalisis 
                  data tersebut menggunakan diagram pencar untuk merumuskan rekomendasi solusi.
                </p>
                <p>
                  Dengan bantuan <span className="font-semibold">AI sebagai mitra berpikir</span> (bukan pemberi jawaban instan), 
                  siswa dibimbing untuk mengembangkan kemampuan berpikir kritis, literasi data, dan empati terhadap isu kesehatan mental.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Mission & Values */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-poppins font-semibold text-ink-900 mb-8 text-center flex items-center justify-center gap-3">
              Nilai & Tujuan Kami 
              <Target className="w-8 h-8 text-primary-600" />
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all"
                >
                  <div className={`inline-flex p-4 ${value.color} rounded-xl mb-4 group-hover:scale-110 transition-transform`}>
                    <value.icon className="w-8 h-8 text-ink-900" />
                  </div>
                  <h3 className="text-xl font-poppins font-semibold text-ink-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-ink-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Advisor Section - HIGHLIGHTED */}
      <section className="py-16 bg-gradient-to-br from-primary-700 to-primary-700">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <Award className="w-5 h-5 text-white" />
                <span className="text-sm font-semibold text-white">Dosen Pembimbing</span>
              </div>
              <h2 className="text-3xl font-poppins font-semibold text-white mb-2">
                Dibimbing Oleh
              </h2>
            </div>

            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Photo */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full blur-2xl opacity-30"></div>
                    <img
                      src={advisor.photo}
                      alt={advisor.name}
                      className="relative w-48 h-48 rounded-full object-cover border-4 border-white shadow-xl"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Ccircle cx="100" cy="100" r="90" fill="%237fd9a8"/%3E%3Ctext x="100" y="115" font-size="80" text-anchor="middle" fill="white"%3E👩‍🏫%3C/text%3E%3C/svg%3E'
                      }}
                    />
                    <div className="absolute -bottom-2 -right-2 bg-primary-600 rounded-full p-3 shadow-lg">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl md:text-3xl font-poppins font-bold text-ink-900 mb-2">
                    {advisor.name}
                  </h3>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                    <span className="inline-flex items-center gap-2 bg-primary-100 px-4 py-2 rounded-full text-sm font-semibold text-primary-700">
                      <GraduationCap className="w-4 h-4" />
                      {advisor.program}
                    </span>
                    <span className="inline-flex items-center gap-2 bg-primary-600 px-4 py-2 rounded-full text-sm font-semibold text-white">
                      {advisor.role}
                    </span>
                  </div>
                  <p className="text-lg text-ink-600 leading-relaxed mb-6">
                    {advisor.description}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Team Members */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-poppins font-semibold text-ink-900 mb-4 flex items-center justify-center gap-3">
              Tim Pengembang 
              <Users className="w-8 h-8 text-primary-600" />
            </h2>
            <p className="text-lg text-ink-600 max-w-2xl mx-auto">
              Mahasiswa lintas program studi yang berkolaborasi mengembangkan Mentalytics
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-2">
                  {/* Photo */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-300 to-primary-500 rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="relative w-32 h-32 mx-auto rounded-full object-cover border-4 border-primary-100 group-hover:border-primary-400 transition-colors shadow-lg"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Ccircle cx="75" cy="75" r="70" fill="%23bef4d5"/%3E%3Ctext x="75" y="90" font-size="60" text-anchor="middle" fill="%231f2d28"%3E👤%3C/text%3E%3C/svg%3E'
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="text-center">
                    <h3 className="text-lg font-poppins font-semibold text-ink-900 mb-2">
                      {member.name}
                    </h3>
                    <p className="text-sm text-primary-700 font-medium mb-2">
                      {member.program}
                    </p>
                    <p className="text-xs text-ink-600 bg-primary-50 px-3 py-1 rounded-full inline-block">
                      {member.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Message */}
      <section className="py-16 bg-gradient-to-r from-primary-100 to-primary-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Sparkles className="w-12 h-12 text-primary-700 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-poppins font-semibold text-ink-900 mb-4 flex items-center justify-center gap-3">
              Mentalytics — Prototype untuk Masa Depan 
              <Sparkles className="w-8 h-8 text-primary-600" />
            </h2>
            <p className="text-lg text-ink-600 leading-relaxed max-w-2xl mx-auto">
              Dikembangkan sebagai prototype pembelajaran interaktif untuk mendukung 
              pendidikan kesehatan mental dan literasi data di sekolah. 
              Kami berharap platform ini dapat memberikan kontribusi positif untuk dunia pendidikan.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
