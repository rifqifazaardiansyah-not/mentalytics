import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { StudentProvider } from './context/StudentContext'
import { TeacherProvider } from './context/TeacherContext'
import { ChallengeProvider } from './context/ChallengeContext'
import { ProgressProvider } from './context/ProgressContext'
import { ToastProvider } from './components/ui/Toast'
import { ConfirmDialogProvider } from './components/ui/ConfirmDialog'
import router from './router'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <ConfirmDialogProvider>
        <TeacherProvider>
          <StudentProvider>
            <ProgressProvider>
              <ChallengeProvider>
                <RouterProvider router={router} />
              </ChallengeProvider>
            </ProgressProvider>
          </StudentProvider>
        </TeacherProvider>
      </ConfirmDialogProvider>
    </ToastProvider>
  </React.StrictMode>
)
