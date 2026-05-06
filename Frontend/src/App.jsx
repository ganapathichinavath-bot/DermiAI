import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

// Existing pages
import Login from './Pages/Login'
import Dashboard from './Pages/Dashboard'
import Scan from './Pages/Scan'
import Processing from './Pages/Processing'
import Result from './Pages/Result'
import Explain from './Pages/Explain'
import History from './Pages/History'

// New pages
import Landing from './Pages/Landing'
import Camera from './Pages/Camera'
import CameraCapture from './Pages/CameraCapture'
import Loading from './Pages/Loading'
import Navbar from './components/Navbar'

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Navbar />
      <div className="pt-16"> {/* Offset for fixed Navbar */}
        <Routes>
          {/* ── Public landing ── */}
          <Route path="/" element={<Landing />} />

          {/* ── Auth ── */}
          <Route path="/login" element={<Login />} />

          {/* ── Dashboard (post-login home) ── */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* ── Camera flow ── */}
          <Route path="/camera-info" element={<Camera />} />
          <Route path="/camera-capture" element={<CameraCapture />} />

          {/* ── Upload & processing flow ── */}
          <Route path="/scan" element={<Scan />} />
          <Route path="/processing" element={<Processing />} />
          <Route path="/loading" element={<Loading />} />

          {/* ── Results ── */}
          <Route path="/result" element={<Result />} />
          <Route path="/explain" element={<Explain />} />
          <Route path="/history" element={<History />} />

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
