/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { store, RootState } from './store';
import { SocketProvider } from './SocketContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Routine from './pages/Routine';
import Tasks from './pages/Tasks';
import Settings from './pages/Settings';
import FocusRoom from './pages/FocusRoom';

import { Toaster } from 'sonner';

function AppContent() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  return (
    <SocketProvider>
      <Toaster position="bottom-right" richColors theme="light" />
      <Routes>
        {isAuthenticated ? (
          <Route path="/" element={<Layout />}>
            <Route index element={user?.role === 'Admin' ? <AdminDashboard /> : <UserDashboard />} />
            <Route path="routine" element={<Routine />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="focus" element={<FocusRoom />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        ) : (
          <>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </SocketProvider>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}
