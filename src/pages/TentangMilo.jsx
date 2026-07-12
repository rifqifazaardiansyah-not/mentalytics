import { Link } from 'react-router-dom'
import MiloCharacter from '../components/milo/MiloCharacter'
import MiloDialogBubble from '../components/milo/MiloDialogBubble'
import { Undo2 } from 'lucide-react'

export default function TentangMilo() {
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
        {/* Milo Character */}
        <MiloCharacter pose="explain" />

        {/* Dialog Bubble dengan tail ke atas */}
        <MiloDialogBubble className="max-w-2xl mx-auto" tailPosition="top">
          <h2 className="text-2xl font-poppins font-semibold mb-4 text-center">
            Hai! Kenalan yuk! 👋
          </h2>
          <div className="space-y-4 text-base">
            <p>
              Namaku <span className="font-semibold text-primary-700">MILO</span>, singkatan dari:
            </p>
            <ul className="space-y-2 ml-4">
              <li>
                <span className="font-semibold text-primary-700">M</span>easure — Mengukur data
              </li>
              <li>
                <span className="font-semibold text-primary-700">I</span>nterpret — Menginterpretasi makna
              </li>
              <li>
                <span className="font-semibold text-primary-700">L</span>earn — Belajar bersama
              </li>
              <li>
                <span className="font-semibold text-primary-700">O</span>bserve — Mengobservasi pola
              </li>
            </ul>
            <p>
              Aku diciptakan untuk menemanimu dalam perjalanan memahami statistika dan kesehatan mental. 
              Aku percaya bahwa data bisa membantu kita memahami perasaan dan membuat keputusan yang lebih baik!
            </p>
            <p>
              Aku tidak akan memberikan jawaban langsung, tapi aku akan membimbingmu dengan pertanyaan-pertanyaan 
              yang membuatmu berpikir lebih dalam. Karena pembelajaran terbaik adalah ketika kamu menemukan 
              jawabannya sendiri! 💡
            </p>
            <p className="text-center font-semibold text-primary-700">
              Mari kita jelajahi dunia data dan perasaan bersama-sama!
            </p>
          </div>
        </MiloDialogBubble>
      </div>
    </div>
  )
}
