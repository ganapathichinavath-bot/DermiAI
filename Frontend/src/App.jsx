import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from './Pages/Dashboard'
import Scan from './Pages/Scan'
import Processing from './Pages/Processing'
import Result from './Pages/Result'
import Explain from './Pages/Explain'
import History from './Pages/History'
import Login from './Pages/Login'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/processing" element={<Processing />} />
        <Route path="/result" element={<Result />} />
        <Route path="/explain" element={<Explain />} />
        <Route path="/history" element={<History />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
