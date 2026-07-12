import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Target, Users, FileText, ArrowRight, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import MiloCharacter from '../../components/milo/MiloCharacter'
import MiloDialogBubble from '../../components/milo/MiloDialogBubble'
import { useChallenge } from '../../context/ChallengeContext'

export default function TheChallenge() {
  const { setChallengeText } = useChallenge()

  // Set challenge text when component mounts
  useEffect(() => {
    const challengeDescription = `THE CHALLENGE

Setiap sekolah punya tanggung jawab memastikan muridnya merasa aman dan nyaman saat belajar. Namun, tidak semua murid mengalaminya. Sebagian pernah mengalami perlakuan tidak menyenangkan dari teman yang lama-kelamaan dapat menimbulkan rasa cemas dan mengganggu proses belajar.

BAGAIMANA DENGAN DI SEKOLAHMU?

Untuk mengetahuinya, kita akan menggunakan data dari kelasmu sendiri. Setiap murid akan mengisi survei singkat dan anonim tentang bullying dan kecemasan yang dirasakan.

Hasilnya akan diolah menjadi diagram pencar, lalu kita selidiki bersama:

• Benarkah ada hubungan antara bullying dan kecemasan di sekolahmu?
• Apa yang bisa dilakukan sekolah agar skor kecemasan murid bisa turun?

INSTRUKSI:
1. Buatlah kelompok yang beranggotakan 3-4 orang murid
2. Simak tantangan berikut lalu kerjakan secara berkelompok`

    console.log('TheChallenge - Setting challenge text')
    setChallengeText(challengeDescription)
    
    // DON'T CLEAR on unmount - let it persist for learning flow
  }, [setChallengeText])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full mb-4">
            <Target className="w-8 h-8 text-ink-900" />
          </div>
          <h1 className="text-3xl md:text-4xl font-poppins font-semibold text-ink-900 mb-2">
            The Challenge
          </h1>
          <p className="text-lg text-ink-600 max-w-2xl mx-auto">
            Saatnya menerapkan pemahamanmu dalam tantangan nyata!
          </p>
        </motion.div>

        {/* Milo Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-100 to-primary-200 rounded-2xl p-6"
        >
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0 -mt-14">
              <div className="w-24 h-24">
                <MiloCharacter pose="thinking" />
              </div>
            </div>
            <MiloDialogBubble tailPosition="" className="flex-1">
              <p className="text-base font-medium text-primary-900">
                Setelah kalian menjawab Essential Question di atas, selesaikan challenge berikut yang akan dipublikasikan! 🎯
              </p>
              <p className="text-sm text-ink-700 mt-2">
                Untuk dapat menyelesaikan Challenge, murid dapat mengikuti <span className="font-semibold">Guiding Resource</span>, <span className="font-semibold">Guiding Question</span>, dan <span className="font-semibold">Guiding Activities</span> berikut.
              </p>
            </MiloDialogBubble>
          </div>
        </motion.div>

        {/* Challenge Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-8 shadow-lg"
        >
          <h2 className="text-2xl font-poppins font-semibold text-ink-900 mb-6 flex items-center gap-3">
            <FileText className="w-7 h-7 text-primary-600" />
            Instruksi Challenge
          </h2>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-ink-900 mb-2 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-600" />
                  Bentuk Kelompok
                </h3>
                <p className="text-ink-700 leading-relaxed">
                  Buatlah kelompok yang beranggotakan <span className="font-semibold text-primary-700">3-4 orang murid</span>!
                </p>
              </div>
            </div>

            <div className="h-px bg-primary-200"></div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-ink-900 mb-2 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary-600" />
                  Simak Tantangan
                </h3>
                <p className="text-ink-700 leading-relaxed">
                  Simak tantangan berikut lalu kerjakan secara berkelompok!
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Context & Background */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-8 shadow-lg border-l-4 border-primary-600"
        >
          <h2 className="text-2xl font-poppins font-semibold text-ink-900 mb-6">
            Tantangan 🏫
          </h2>

          <div className="space-y-4 text-ink-700 leading-relaxed">
            <p>
              Setiap sekolah punya tanggung jawab memastikan <span className="font-semibold text-primary-700">muridnya merasa aman dan nyaman</span> saat belajar. Namun, tidak semua murid mengalaminya. Sebagian pernah mengalami perlakuan tidak menyenangkan dari teman yang lama-kelamaan dapat menimbulkan rasa cemas dan mengganggu proses belajar.
            </p>

            <div className="bg-primary-50 rounded-xl p-6 my-4">
              <p className="font-semibold text-primary-900 text-lg mb-3">
                🤔 Bagaimana dengan di sekolahmu?
              </p>
              <p className="text-ink-700 mb-3">
                Untuk mengetahuinya, kita akan menggunakan data dari kelasmu sendiri. Setiap murid akan mengisi <span className="font-semibold">survei singkat dan anonim</span> tentang bullying dan kecemasan yang dirasakan.
              </p>
              <p className="text-ink-700">
                Hasilnya akan diolah menjadi <span className="font-semibold text-primary-700">diagram pencar</span>, lalu kita selidiki bersama:
              </p>
            </div>

            <ul className="space-y-2 ml-6">
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold text-xl leading-none">•</span>
                <span>Benarkah ada hubungan antara bullying dan kecemasan di sekolahmu?</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold text-xl leading-none">•</span>
                <span>Apa yang bisa dilakukan sekolah agar skor kecemasan murid bisa turun?</span>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* What You'll Do */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-2xl p-8"
        >
          <h2 className="text-2xl font-poppins font-semibold text-ink-900 mb-6 flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-primary-600" />
            Apa yang Akan Kamu Lakukan?
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="font-semibold text-ink-900 mb-2">Guiding Resource</h3>
              <p className="text-sm text-ink-600">
                Pelajari materi tentang korelasi, diagram pencar, dan analisis data
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="font-semibold text-ink-900 mb-2">Guiding Activities</h3>
              <p className="text-sm text-ink-600">
                Isi survei anonim tentang pengalaman bullying dan tingkat kecemasan
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🤔</span>
              </div>
              <h3 className="font-semibold text-ink-900 mb-2">Guiding Question</h3>
              <p className="text-sm text-ink-600">
                Analisis data kelas dan temukan pola hubungan yang tersembunyi
              </p>
            </div>
          </div>
        </motion.div>

        {/* Ready Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-primary-700 rounded-2xl p-8 text-white text-center"
        >
          <h3 className="text-2xl font-poppins font-bold mb-3">
            Siap untuk Memulai? 🚀
          </h3>
          <p className="text-primary-50 mb-6 max-w-2xl mx-auto">
            Ikuti setiap langkah dengan seksama. Jika ada yang tidak jelas, jangan ragu untuk bertanya kepada guru atau teman kelompokmu!
          </p>

          <Link
            to="/kegiatan-belajar/the-challenge/guiding-resource"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-green-700 rounded-lg font-poppins font-semibold text-lg transition-all hover:shadow-xl hover:scale-105"
          >
            Lanjut ke Guiding Resource
            <ArrowRight className="w-6 h-6" />
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
