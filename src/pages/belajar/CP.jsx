import { Link } from 'react-router-dom'
import { Target, ArrowRight } from 'lucide-react'

export default function CP() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full mb-4">
            <Target className="w-8 h-8 text-ink-900" />
          </div>
          <h1 className="text-3xl md:text-4xl font-poppins font-semibold text-ink-900 mb-2">
            Capaian Pembelajaran (CP)
          </h1>
        </div>

        {/* Explanation */}
        <div className="bg-primary-100 rounded-xl p-6">
          <h2 className="text-xl font-poppins font-semibold text-ink-900 mb-3">
            Apa itu Capaian Pembelajaran?
          </h2>
          <p className="text-ink-600 leading-relaxed">
            Capaian Pembelajaran (CP) adalah kompetensi yang diharapkan dapat dicapai 
            oleh peserta didik pada akhir pembelajaran. CP menggambarkan kemampuan 
            yang harus dimiliki setelah menyelesaikan rangkaian kegiatan belajar.
          </p>
        </div>

        {/* CP Content */}
        <div className="bg-surface rounded-xl p-8 shadow-md border-l-4 border-primary-600">
          <h3 className="text-lg font-poppins font-semibold text-ink-900 mb-4">
            Capaian Pembelajaran — Fase E
          </h3>
          <div className="space-y-4 text-ink-600 leading-relaxed">
            <p>
              Peserta didik dapat <span className="font-semibold text-primary-700">
              menganalisis dan menginterpretasi data bivariat</span> untuk memahami 
              hubungan antara dua variabel yang berbeda.
            </p>
            <p>
              Peserta didik mampu <span className="font-semibold text-primary-700">
              membuat diagram pencar (scatter plot)</span> dan menentukan pola hubungan 
              (positif, negatif, atau tidak ada hubungan) antara variabel independen 
              dan variabel dependen.
            </p>
            <p>
              Peserta didik dapat <span className="font-semibold text-primary-700">
              menggunakan data untuk membuat keputusan</span> dan merumuskan rekomendasi 
              berbasis bukti dalam konteks kehidupan nyata.
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center">
          <Link
            to="/kegiatan-belajar/tp"
            className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            Lanjut ke Tujuan Pembelajaran
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
