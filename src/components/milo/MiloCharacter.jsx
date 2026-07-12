export default function MiloCharacter({ pose = 'wave', className = '' }) {
  const poseMap = {
    wave: '/assets/milo/milo-wave.png',
    happy: '/assets/milo/milo-happy.png',
    thinking: '/assets/milo/milo-thinking.png',
    explain: '/assets/milo/milo-explain.png',
  }

  return (
    <div className={`flex justify-center ${className}`}>
      <img
        src={poseMap[pose] || poseMap.wave}
        alt="Milo character"
        className="w-48 h-48 md:w-64 md:h-64 object-contain"
        onError={(e) => {
          // Fallback if image not found
          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Ccircle cx="100" cy="100" r="80" fill="%237fd9a8"/%3E%3Ctext x="100" y="115" font-size="80" text-anchor="middle" fill="white"%3E🤖%3C/text%3E%3C/svg%3E'
        }}
      />
    </div>
  )
}
