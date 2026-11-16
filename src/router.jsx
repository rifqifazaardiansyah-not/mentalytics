import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import ProtectedRoute from './components/ProtectedRoute'
import ProtectedTeacherRoute from './components/ProtectedTeacherRoute'

// Pages - Will be created progressively
import ClassEntry from './pages/ClassEntry'
import Home from './pages/Home'
import Panduan from './pages/Panduan'
import AboutUs from './pages/AboutUs'
import TapMilo from './pages/TapMilo'
import TentangMilo from './pages/TentangMilo'
import Motivasi from './pages/Motivasi'

// Teacher pages
import TeacherLogin from './pages/teacher/TeacherLogin'
import TeacherRegister from './pages/teacher/TeacherRegister'
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import GoogleCallback from './pages/teacher/GoogleCallback'
import DataSiswa from './pages/teacher/DataSiswa'
import HasilSurvei from './pages/teacher/HasilSurvei'
import StatistikKelas from './pages/teacher/StatistikKelas'
import ProgressBelajar from './pages/teacher/ProgressBelajar'

// Learning pages
import KegiatanBelajar from './pages/belajar/KegiatanBelajar'
import CP from './pages/belajar/CP'
import TP from './pages/belajar/TP'
import BigIdeaEQ from './pages/belajar/BigIdeaEQ'
import ForumDiskusi from './pages/belajar/ForumDiskusi'
import TheChallenge from './pages/belajar/TheChallenge'
import GuidingResourceLevel1 from './pages/belajar/GuidingResourceLevel1'
import GuidingResourceLevel2 from './pages/belajar/GuidingResourceLevel2'
import GuidingResourceLevel3 from './pages/belajar/GuidingResourceLevel3'
import GuidingResourceLevel4 from './pages/belajar/GuidingResourceLevel4'
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
      
      // Teacher routes - public login/register
      { path: 'teacher/login', element: <TeacherLogin /> },
      { path: 'teacher/register', element: <TeacherRegister /> },
      { path: 'teacher/google-callback', element: <GoogleCallback /> },
      
      // Teacher dashboard - protected
      { path: 'dashboard-guru', element: <ProtectedTeacherRoute><TeacherDashboard /></ProtectedTeacherRoute> },
      { path: 'dashboard-guru/students', element: <ProtectedTeacherRoute><DataSiswa /></ProtectedTeacherRoute> },
      { path: 'dashboard-guru/surveys', element: <ProtectedTeacherRoute><HasilSurvei /></ProtectedTeacherRoute> },
      { path: 'dashboard-guru/statistics', element: <ProtectedTeacherRoute><StatistikKelas /></ProtectedTeacherRoute> },
      { path: 'dashboard-guru/progress', element: <ProtectedTeacherRoute><ProgressBelajar /></ProtectedTeacherRoute> },
      
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
      { path: 'kegiatan-belajar/the-challenge/guiding-resource-level-1', element: <ProtectedRoute><GuidingResourceLevel1 /></ProtectedRoute> },
      { path: 'kegiatan-belajar/the-challenge/guiding-resource-level-2', element: <ProtectedRoute><GuidingResourceLevel2 /></ProtectedRoute> },
      { path: 'kegiatan-belajar/the-challenge/guiding-resource-level-3', element: <ProtectedRoute><GuidingResourceLevel3 /></ProtectedRoute> },
      { path: 'kegiatan-belajar/the-challenge/guiding-resource-level-4', element: <ProtectedRoute><GuidingResourceLevel4 /></ProtectedRoute> },
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
