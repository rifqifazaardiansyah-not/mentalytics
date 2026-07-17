import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import ProtectedRoute from './components/ProtectedRoute'

// Pages - Will be created progressively
import ClassEntry from './pages/ClassEntry'
import Home from './pages/Home'
import Panduan from './pages/Panduan'
import AboutUs from './pages/AboutUs'
import TapMilo from './pages/TapMilo'
import TentangMilo from './pages/TentangMilo'
import Motivasi from './pages/Motivasi'

// Learning pages
import KegiatanBelajar from './pages/belajar/KegiatanBelajar'
import CP from './pages/belajar/CP'
import TP from './pages/belajar/TP'
import BigIdeaEQ from './pages/belajar/BigIdeaEQ'
import ForumDiskusi from './pages/belajar/ForumDiskusi'
import TheChallenge from './pages/belajar/TheChallenge'
import GuidingResource from './pages/belajar/GuidingResource'
import TransisiAktivitas from './pages/belajar/TransisiAktivitas'
import GuidingActivity from './pages/belajar/GuidingActivity'
import HasilGuidingActivities from './pages/belajar/HasilGuidingActivities'
import EksplorasiDiagramPencar from './pages/belajar/EksplorasiDiagramPencar'
import GuidingQuestion from './pages/belajar/GuidingQuestion'
import Solution from './pages/belajar/Solution'
import Reflection from './pages/belajar/Reflection'
import PresentationView from './pages/belajar/PresentationView'
import HasilTes from './pages/belajar/HasilTes'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'panduan', element: <Panduan /> },
      { path: 'about', element: <AboutUs /> },
      { path: 'kelas', element: <ClassEntry /> },
      
      // Protected routes - require class membership
      { path: 'tap-milo', element: <ProtectedRoute><TapMilo /></ProtectedRoute> },
      { path: 'tentang-milo', element: <ProtectedRoute><TentangMilo /></ProtectedRoute> },
      { path: 'motivasi', element: <ProtectedRoute><Motivasi /></ProtectedRoute> },
      
      // Learning flow - All protected
      { path: 'kegiatan-belajar', element: <ProtectedRoute><KegiatanBelajar /></ProtectedRoute> },
      { path: 'kegiatan-belajar/cp', element: <ProtectedRoute><CP /></ProtectedRoute> },
      { path: 'kegiatan-belajar/tp', element: <ProtectedRoute><TP /></ProtectedRoute> },
      { path: 'kegiatan-belajar/big-idea', element: <ProtectedRoute><BigIdeaEQ /></ProtectedRoute> },
      { path: 'kegiatan-belajar/big-idea/forum-diskusi', element: <ProtectedRoute><ForumDiskusi /></ProtectedRoute> },
      { path: 'kegiatan-belajar/the-challenge', element: <ProtectedRoute><TheChallenge /></ProtectedRoute> },
      { path: 'kegiatan-belajar/the-challenge/guiding-resource', element: <ProtectedRoute><GuidingResource /></ProtectedRoute> },
      { path: 'kegiatan-belajar/the-challenge/transisi-aktivitas', element: <ProtectedRoute><TransisiAktivitas /></ProtectedRoute> },
      { path: 'kegiatan-belajar/the-challenge/guiding-activities', element: <ProtectedRoute><GuidingActivity /></ProtectedRoute> },
      { path: 'kegiatan-belajar/the-challenge/hasil-guiding-activities', element: <ProtectedRoute><HasilGuidingActivities /></ProtectedRoute> },
      { path: 'kegiatan-belajar/the-challenge/eksplorasi-diagram', element: <ProtectedRoute><EksplorasiDiagramPencar /></ProtectedRoute> },
      { path: 'kegiatan-belajar/the-challenge/guiding-question', element: <ProtectedRoute><GuidingQuestion /></ProtectedRoute> },
      { path: 'kegiatan-belajar/the-challenge/solution', element: <ProtectedRoute><Solution /></ProtectedRoute> },
      { path: 'kegiatan-belajar/the-challenge/reflection', element: <ProtectedRoute><Reflection /></ProtectedRoute> },
      { path: 'kegiatan-belajar/the-challenge/presentation', element: <ProtectedRoute><PresentationView /></ProtectedRoute> },
      { path: 'kegiatan-belajar/the-challenge/hasil-tes', element: <ProtectedRoute><HasilTes /></ProtectedRoute> },
    ],
  },
])

export default router
