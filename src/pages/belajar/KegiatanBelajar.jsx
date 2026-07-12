import { Link } from 'react-router-dom'
import MiloCharacter from '../../components/milo/MiloCharacter'
import MiloDialogBubble from '../../components/milo/MiloDialogBubble'
import { ArrowRight, Undo2 } from 'lucide-react'

export default function KegiatanBelajar() {
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
        <h1 className="text-3xl md:text-4xl font-poppins font-semibold text-ink-900 text-center">
          Kegiatan Belajar
        </h1>

        <MiloCharacter pose="wave" />

        <MiloDialogBubble className="max-w-2xl mx-auto" tailPosition="top">
          <p className="text-lg text-center">
            Hari ini kita akan belajar tentang data dan perasaan! 🎯
            <br /><br />
            Kita akan mengeksplorasi bagaimana statistika bisa membantu kita memahami 
            isu bullying dan anxiety di sekolah. Siap untuk memulai petualangan belajar?
          </p>
        </MiloDialogBubble>

        <div className="flex justify-center">
          <Link
            to="/kegiatan-belajar/cp"
            className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-poppins font-semibold text-lg transition-colors flex items-center gap-3 shadow-lg hover:shadow-xl"
          >
            Tap MILO to start learning!
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </div>
    </div>
  )
}
