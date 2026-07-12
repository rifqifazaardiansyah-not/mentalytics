import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { StudentProvider } from './context/StudentContext'
import { ChallengeProvider } from './context/ChallengeContext'
import { ProgressProvider } from './context/ProgressContext'
import router from './router'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StudentProvider>
      <ProgressProvider>
        <ChallengeProvider>
          <RouterProvider router={router} />
        </ChallengeProvider>
      </ProgressProvider>
    </StudentProvider>
  </React.StrictMode>
)
