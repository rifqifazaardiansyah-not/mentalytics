import { Link } from 'react-router-dom'
import MiloCharacter from '../components/milo/MiloCharacter'
import { ArrowRight, Brain, BarChart3, Users, Sparkles, Heart, Target, BookOpen, FileText, Lightbulb } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Home() {
  const features = [
    {
      icon: Brain,
      title: 'Belajar Statistika',
      description: 'Pahami diagram pencar dan data bivariat dengan cara yang fun!',
      blurColor: 'from-blue-200/60 to-cyan-200/60',
      shadowColor: 'shadow-[0_8px_30px_-12px_rgba(59,130,246,0.4)]',
      hoverShadow: 'hover:shadow-[0_20px_50px_-12px_rgba(59,130,246,0.5)]',
    },
    {
      icon: Heart,
      title: 'Kesehatan Mental',
      description: 'Eksplorasi isu bullying dan anxiety dengan pendekatan berbasis data',
      blurColor: 'from-pink-200/60 to-rose-200/60',
      shadowColor: 'shadow-[0_8px_30px_-12px_rgba(236,72,153,0.4)]',
      hoverShadow: 'hover:shadow-[0_20px_50px_-12px_rgba(236,72,153,0.5)]',
    },
    {
      icon: Users,
      title: 'Kolaborasi Kelas',
      description: 'Kumpulkan data bersama teman dan analisis hasilnya secara realtime',
      blurColor: 'from-primary-200/60 to-primary-300/60',
      shadowColor: 'shadow-[0_8px_30px_-12px_rgba(127,217,168,0.4)]',
      hoverShadow: 'hover:shadow-[0_20px_50px_-12px_rgba(127,217,168,0.5)]',
    },
    {
      icon: Sparkles,
      title: 'AI Assistant',
      description: 'Milo AI siap membimbingmu dengan pertanyaan yang memicu pemikiran kritis',
      blurColor: 'from-purple-200/60 to-indigo-200/60',
      shadowColor: 'shadow-[0_8px_30px_-12px_rgba(168,85,247,0.4)]',
      hoverShadow: 'hover:shadow-[0_20px_50px_-12px_rgba(168,85,247,0.5)]',
    },
  ]

  const stats = [
    { number: '100%', label: 'Data Kelas Kamu' },
    { number: 'Real-time', label: 'Diskusi Forum' },
    { number: 'AI', label: 'Powered Guidance' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        {/* Colorful blurs in background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-green-300/60 rounded-full blur-3xl"></div>
          <div className="absolute top-1/4 -right-24 w-96 h-96 bg-blue-300/60 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-200/70 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-primary-200">
                <Target className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-ink-900">Platform Pembelajaran CBDL</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-poppins font-bold text-ink-900 leading-tight">
                Mental<span className="text-primary-600">ytics</span>
              </h1>
              
              <p className="text-2xl md:text-3xl font-poppins font-medium flex items-center justify-center md:justify-start gap-2">
                Find your <span className="text-blue-600">feelings</span> with <span className="text-primary-600">Statistic</span> 
                <Heart className="w-7 h-7 text-primary-600 inline-block" fill="currentColor" />
              </p>

              <p className="text-lg text-ink-600 leading-relaxed">
                Platform pembelajaran interaktif yang menggabungkan <span className="font-semibold text-primary-600">statistika</span> dengan 
                <span className="font-semibold text-pink-600"> kesehatan mental</span>. Belajar menganalisis data sambil memahami perasaan!
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  to="/tap-milo"
                  className="group px-8 py-4 bg-gradient-to-r from-primary-700 to-primary-700 hover:from-primary-700 hover:to-primary-700 text-white rounded-xl font-poppins font-semibold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  Mulai Belajar Sekarang
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/panduan"
                  className="px-8 py-4 bg-white hover:bg-gray-50 text-ink-900 border-2 border-gray-200 rounded-xl font-medium transition-all hover:border-primary-600 flex items-center justify-center gap-2"
                >
                  Lihat Panduan
                  <BarChart3 className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>

            {/* Right Content - Milo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: [0, -10, 0], // Floating animation: up and down
              }}
              transition={{ 
                opacity: { duration: 0.8, delay: 0.2 },
                scale: { duration: 0.8, delay: 0.2 },
                y: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
              className="relative"
            >
              {/* Colorful blur behind Milo */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-300/50 via-blue-200/40 to-purple-200/50 rounded-3xl blur-2xl"></div>
              
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-[0_20px_60px_-15px_rgba(127,217,168,0.4)] border border-gray-100 overflow-hidden">
                {/* Inner decorative blurs */}
                <div className="absolute top-1 right-2 w-32 h-64 bg-blue-300/60 rounded-full blur-2xl"></div>
                <div className="absolute buttom-1/2 left-2 w-32 h-64 bg-pink-300/60 rounded-full blur-2xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-purple-100/40 rounded-full blur-3xl"></div>
                
                <div className="relative z-10">
                  <MiloCharacter pose="wave" />
                </div>
              </div>
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-lg border border-gray-100 z-20">
                  <p className="text-sm font-poppins font-semibold text-ink-900">
                    Hai! Aku <span className="text-primary-600">Milo</span> 
                  </p>
                </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-primary-700 to-primary-700 relative overflow-hidden">
        {/* Decorative blurs */}
        <div className="absolute inset-0">
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary-800/50 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-poppins font-bold text-white mb-2">
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

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-poppins font-bold text-ink-900 mb-4 flex items-center justify-center gap-3">
              Kenapa <span className="text-primary-600">Mentalytics</span>? 
              <Target className="w-10 h-10 text-primary-600" />
            </h2>
            <p className="text-lg text-ink-600 max-w-2xl mx-auto">
              Pembelajaran berbasis tantangan yang menggabungkan <span className="text-blue-600 font-medium">teori</span> dengan <span className="text-purple-600 font-medium">praktik nyata</span>
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
                className="group relative"
              >
                {/* Colorful blur effect in corner */}
                <div className={`absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br ${feature.blurColor} rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                <div className={`relative bg-white rounded-2xl p-8 ${feature.shadowColor} ${feature.hoverShadow} transition-all hover:-translate-y-2 h-full border border-gray-100`}>
                  <div className="inline-flex p-4 bg-gray-50 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-poppins font-semibold text-ink-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-ink-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-primary-50 relative overflow-hidden">
        {/* Subtle background blurs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-300/60 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-poppins font-bold text-ink-900 mb-4 flex items-center justify-center gap-3">
              Cara <span className="text-primary-600">Kerjanya</span> 
              <BookOpen className="w-10 h-10 text-primary-600" />
            </h2>
            <p className="text-lg text-ink-600 max-w-2xl mx-auto">
              Proses pembelajaran yang <span className="text-blue-600 font-medium">simpel</span> dan <span className="text-purple-600 font-medium">terstruktur</span>
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Isi Survei',
                description: 'Jawab pertanyaan tentang bullying dan anxiety secara anonim',
                icon: <FileText className="w-12 h-12 text-blue-600" />,
                color: 'text-blue-600',
              },
              {
                step: '02',
                title: 'Analisis Data',
                description: 'Buat diagram pencar dari data kelas dan temukan polanya',
                icon: <BarChart3 className="w-12 h-12 text-primary-600" />,
                color: 'text-primary-600',
              },
              {
                step: '03',
                title: 'Buat Rekomendasi',
                description: 'Rumuskan solusi berbasis data dengan bantuan AI',
                icon: <Lightbulb className="w-12 h-12 text-purple-600" />,
                color: 'text-purple-600',
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                <div className="relative bg-white rounded-2xl p-8 shadow-[0_8px_30px_-12px_rgba(127,217,168,0.3)] hover:shadow-[0_20px_50px_-12px_rgba(127,217,168,0.4)] transition-all hover:-translate-y-2 border border-gray-100">
                  <div className="mb-4">{step.icon}</div>
                  <div className={`text-sm font-bold ${step.color} mb-2`}>STEP {step.step}</div>
                  <h3 className="text-xl font-poppins font-semibold text-ink-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-ink-600">
                    {step.description}
                  </p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform translate-x-1/2 -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-primary-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-700 to-primary-700 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-15 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-primary-800/50 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-4xl md:text-5xl font-poppins font-bold text-white mb-4 flex items-center justify-center gap-3">
              Siap Memulai Perjalanan Belajarmu? 
              <Sparkles className="w-10 h-10 text-white" />
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Bergabunglah dengan <span className="font-semibold">Milo</span> dan temukan hubungan antara <span className="font-semibold">data</span> dan <span className="font-semibold">perasaan</span>!
            </p>
            <Link
              to="/tap-milo"
              className="inline-flex items-center gap-3 px-10 py-5 bg-white hover:bg-gray-50 text-primary-700 rounded-xl font-poppins font-bold text-lg transition-all shadow-lg hover:shadow-2xl hover:-translate-y-1 mt-6"
            >
              <Sparkles className="w-6 h-6" />
              Mulai Sekarang
              <ArrowRight className="w-6 h-6" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
