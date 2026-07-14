import { Link } from 'react-router-dom'
import { CheckCircle, ArrowRight } from 'lucide-react'

export default function TP() {

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
            Tujuan Pembelajaran
          </h3>
          <div className="space-y-4 text-ink-600 leading-relaxed">
            <p>
              Melalui pemanfaatan website <span className="font-semibold text-primary-700">Mentalytics</span> terintegrasi 
              <span className="font-semibold text-primary-700"> AI</span> dalam model <span className="font-semibold text-primary-700">Challenge Based on Deep Learning</span>
              yang mengangkat isu <span className="font-semibold text-primary-700">bullying dan anxiety (Condition)</span>, murid (Audience) diharapkan mampu <span className="font-semibold text-primary-700">memecahkan (C4) 
              permasalahan diagram pencar data bivariat (Behaviour)</span> dengan standar ketuntasan minimal <span className="font-semibold text-primary-700">75% (Degree)</span>.
            </p>
          </div>
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
