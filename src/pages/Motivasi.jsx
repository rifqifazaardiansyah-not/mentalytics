import { Sparkles, Undo2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import MiloCharacter from '../components/milo/MiloCharacter'

export default function Motivasi() {
  const motivations = [
    {
      quote: "Pendidikan adalah senjata paling ampuh yang bisa Anda gunakan untuk mengubah dunia",
      author: "Nelson Mandela"
    },
    {
      quote: "Jangan pernah menganggap belajar sebagai tugas, tetapi anggaplah sebagai kesempatan berharga untuk mempelajari sesuatu.",
      author: "Albert Einstein"
    },
    {
      quote: "Belajar tanpa berpikir itu sia-sia, berpikir tanpa belajar itu berbahaya.",
      author: "Ki Hajar Dewantara"
    },
    {
      quote: "Pendidikan adalah paspor menuju masa depan, karena hari esok adalah milik mereka yang mempersiapkannya hari ini.",
      author: "Malcolm X"
    }
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        to="/tap-milo"
        className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-white hover:bg-primary-50 border-2 border-primary-600 text-primary-700 rounded-xl font-medium transition-all hover:gap-3 shadow-sm hover:shadow-md group"
      >
        <Undo2 className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Kembali ke Tap Milo
      </Link>

      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-ink-900" />
          </div>
          <h1 className="text-3xl md:text-4xl font-poppins font-semibold text-ink-900 mb-2">
            Motivasi dari Milo
          </h1>
          <p className="text-lg text-ink-600">
            Semangat untuk perjalanan belajarmu hari ini! 💚
          </p>
        </div>

        {/* Milo Character */}
        <MiloCharacter pose="happy" />

        {/* Motivations Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {motivations.map((motivation, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100"
            >
              <div className="mb-4">
                <svg className="w-8 h-8 text-primary-600 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
              </div>
              <p className="text-lg text-ink-900 leading-relaxed mb-4 italic">
                "{motivation.quote}"
              </p>
              <p className="text-sm text-primary-700 font-semibold">
                — {motivation.author}
              </p>
            </div>
          ))}
        </div>

        {/* Footer Message */}
        <div className="bg-primary-500 rounded-xl p-6 text-center">
          <p className="text-lg font-poppins font-semibold text-ink-900">
            Ingat: Kamu istimewa dan kemampuanmu terus berkembang setiap hari! 🌟
          </p>
        </div>
      </div>
    </div>
  )
}
