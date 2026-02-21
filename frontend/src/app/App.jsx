import { Navigate, Route, Routes } from 'react-router-dom'
import '../styles/App.css'
import LoginPage from '../pages/LoginPage.jsx'
import DashboardPage from '../pages/DashboardPage.jsx'
import StudentsPage from '../pages/StudentsPage.jsx'
import IEPListPage from '../pages/IEPListPage.jsx'
import PrivacyPage from '../pages/PrivacyPage.jsx'
import MeetingPage from '../pages/MeetingPage.jsx'
function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path = '/students' element = {<StudentsPage/>}/>
      <Route path = '/students/new' element = {<StudentsPage/>} />
      <Route path = '/meeting' element = {<MeetingPage/>}/>
      <Route path = '/ieps' element = {<IEPListPage/>}/>
      <Route path = '/ieps/new' element = {<Navigate to="/meeting?openAddEvent=1" replace />} />
      <Route path = '/privacy' element = {<PrivacyPage/>}/>
    </Routes>
  )
}

export default App
