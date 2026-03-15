import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Members from './pages/Members';
import ProjectNew from './pages/ProjectNew';
import ProjectRecommendations from './pages/ProjectRecommendations';
import ProjectKickoff from './pages/ProjectKickoff';
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';

function ProtectedRoute({ children, roleRequired }: { children: React.ReactNode, roleRequired?: string[] }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  if (roleRequired && !roleRequired.includes(user.role)) {
    return <Navigate to="/403" />;
  }

  return <>{children}</>;
}

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-text-primary font-sans">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/members" element={<ProtectedRoute><Members /></ProtectedRoute>} />
          
          <Route path="/projects/new" element={<ProtectedRoute><ProjectNew /></ProtectedRoute>} />
          <Route path="/projects/:id/recommendations" element={<ProtectedRoute><ProjectRecommendations /></ProtectedRoute>} />
          <Route path="/projects/:id/kickoff" element={<ProtectedRoute><ProjectKickoff /></ProtectedRoute>} />
          
          <Route path="/admin" element={<ProtectedRoute roleRequired={['admin']}><Admin /></ProtectedRoute>} />
          
          <Route path="/403" element={<div className="p-8 text-center text-red-500">403 Forbidden: You do not have access to this page.</div>} />
          <Route path="*" element={<div className="p-8 text-center text-text-secondary">404 Not Found</div>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
