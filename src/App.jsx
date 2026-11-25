import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute, { PublicRoute } from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Applications from './pages/Applications';
import Interviews from './pages/Interviews';
import Saved from './pages/Saved';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import ManageJobs from './pages/admin/ManageJobs';
import ManageUsers from './pages/admin/ManageUsers';
import AllApplications from './pages/admin/AllApplications';
import { ROLES } from './utils/constants';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <DataProvider>
            <BrowserRouter>
              <Routes>
                {/* Public */}
                <Route element={<PublicRoute />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                </Route>

                {/* Any signed-in user */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />

                    {/* Candidate module */}
                    <Route element={<ProtectedRoute roles={[ROLES.USER]} />}>
                      <Route path="/jobs" element={<Jobs />} />
                      <Route path="/applications" element={<Applications />} />
                      <Route path="/interviews" element={<Interviews />} />
                      <Route path="/saved" element={<Saved />} />
                    </Route>

                    {/* Admin module */}
                    <Route element={<ProtectedRoute roles={[ROLES.ADMIN]} />}>
                      <Route path="/admin/jobs" element={<ManageJobs />} />
                      <Route path="/admin/applications" element={<AllApplications />} />
                      <Route path="/admin/users" element={<ManageUsers />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Route>

                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </BrowserRouter>
          </DataProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
