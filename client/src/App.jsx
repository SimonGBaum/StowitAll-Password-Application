import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { WalkingTransition } from './components/WalkingTransition/WalkingTransition';
import { Toast } from './components/Toast/Toast';
import { TorchTransitionProvider } from './context/TorchTransitionContext';
import { TorchTransition } from './components/TorchTransition/TorchTransition';
import { LoginSignUp } from './pages/LoginSignUp/LoginSignUp';
import { Home } from './pages/Home/Home';
import { PasswordCreationRoom } from './pages/PasswordCreationRoom/PasswordCreationRoom';
import { Vault } from './pages/Vault/Vault';
import { Profile } from './pages/Profile/Profile';
import { ContactUs } from './pages/ContactUs/ContactUs';
import { ErrorPage } from './pages/ErrorPage/ErrorPage';

function RootRedirect() {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  if (user) return <Navigate to="/home" replace />;
  return <LoginSignUp />;
}

function RootLayout() {
  return (
    <TorchTransitionProvider>
      <TorchTransition />
      <Outlet />
    </TorchTransitionProvider>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <RootRedirect /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/home',    element: <Home /> },
          { path: '/create',  element: <PasswordCreationRoom /> },
          { path: '/vault',   element: <Vault /> },
          { path: '/profile', element: <Profile /> },
          { path: '/contact', element: <ContactUs /> },
        ],
      },
      { path: '*', element: <ErrorPage /> },
    ],
  },
]);

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <WalkingTransition />
      <Toast />
    </>
  );
}
