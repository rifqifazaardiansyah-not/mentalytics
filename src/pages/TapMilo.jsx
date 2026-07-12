import { Link } from 'react-router-dom'
import MiloCharacter from '../components/milo/MiloCharacter'
import MiloDialogBubble from '../components/milo/MiloDialogBubble'
import { Hand, Heart, BookOpen } from 'lucide-react'

export default function TapMilo() {
  const buttons = [
    {
      to: '/tentang-milo',
      label: 'Sapa Milo!',
      icon: Hand,
      color: 'bg-primary-600 hover:bg-primary-700',
    },
    {
      to: '/motivasi',
      label: 'Motivasi',
      icon: Heart,
      color: 'bg-primary-600 hover:bg-primary-700',
    },
    {
      to: '/kegiatan-belajar',
      label: 'Kegiatan Belajar',
      icon: BookOpen,
      color: 'bg-primary-600 hover:bg-primary-700',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Milo Character */}
        <MiloCharacter pose="wave" />

        {/* Dialog Bubble */}
        <MiloDialogBubble className="max-w-2xl mx-auto" tailPosition="top">
          <p className="text-lg text-center">
            Hai! Aku Milo, teman belajarmu hari ini! 🌟
            <br />
            Aku akan menemanimu memahami data dan perasaan. 
            Yuk, pilih salah satu untuk mulai!
          </p>
        </MiloDialogBubble>

        {/* Navigation Buttons */}
        <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {buttons.map((button) => (
            <Link
              key={button.to}
              to={button.to}
              className={`${button.color} text-white rounded-xl p-6 shadow-md transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col items-center gap-3`}
            >
              <button.icon className="w-12 h-12" />
              <span className="font-poppins font-semibold text-lg">
                {button.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
