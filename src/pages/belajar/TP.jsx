import { Link } from 'react-router-dom'
import { CheckCircle, ArrowRight } from 'lucide-react'

export default function TP() {
  const objectives = [
    'Memahami konsep variabel independen dan variabel dependen dalam data bivariat',
    'Membuat dan menginterpretasi diagram pencar (scatter plot) dari data yang dikumpulkan',
    'Mengidentifikasi pola hubungan (korelasi positif, negatif, atau tidak ada) antara dua variabel',
    'Menghitung dan memahami koefisien korelasi sederhana',
    'Menganalisis data kesehatan mental (bullying dan anxiety) secara objektif',
    'Merumuskan rekomendasi berbasis data untuk mengatasi masalah bullying di sekolah',
    'Mengembangkan empati dan kesadaran terhadap isu kesehatan mental teman sebaya',
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-ink-900" />
          </div>
          <h1 className="text-3xl md:text-4xl font-poppins font-semibold text-ink-900 mb-2">
            Tujuan Pembelajaran (TP)
          </h1>
        </div>

        {/* Explanation */}
        <div className="bg-primary-100 rounded-xl p-6">
          <h2 className="text-xl font-poppins font-semibold text-ink-900 mb-3">
            Apa itu Tujuan Pembelajaran?
          </h2>
          <p className="text-ink-600 leading-relaxed">
            Tujuan Pembelajaran (TP) adalah langkah-langkah spesifik yang akan membantu 
            kamu mencapai Capaian Pembelajaran. Setiap TP menggambarkan kemampuan konkret 
            yang akan kamu kuasai dalam pembelajaran ini.
          </p>
        </div>

        {/* TP List */}
        <div className="bg-surface rounded-xl p-8 shadow-md">
          <h3 className="text-lg font-poppins font-semibold text-ink-900 mb-6">
            Setelah menyelesaikan pembelajaran ini, kamu akan mampu:
          </h3>
          <ul className="space-y-4">
            {objectives.map((objective, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                <span className="text-ink-600 leading-relaxed">{objective}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-center">
          <Link
            to="/kegiatan-belajar/big-idea"
            className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            Lanjut ke Big Idea & Essential Question
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
