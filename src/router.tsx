import { Navigate, createBrowserRouter } from 'react-router-dom'

import { AppLayout } from './components/AppLayout'
import { CelebrationScreen } from './screens/CelebrationScreen'
import { HomeScreen } from './screens/HomeScreen'
import { NameSetupScreen } from './screens/NameSetupScreen'
import { SplashScreen } from './screens/SplashScreen'
import { TracingScreen } from './screens/TracingScreen'
import { VideoRewardScreen } from './screens/VideoRewardScreen'
import { VoiceScreen } from './screens/VoiceScreen'
import { useAppStore } from './store/useStore'

const ProtectedRoute = () => {
  const childName = useAppStore((state) => state.childName)

  if (!childName.trim()) {
    return <Navigate to="/setup" replace />
  }

  return <AppLayout />
}

const SetupRoute = () => {
  const childName = useAppStore((state) => state.childName)

  if (childName.trim()) {
    return <Navigate to="/home" replace />
  }

  return <NameSetupScreen />
}

const SplashRoute = () => {
  const childName = useAppStore((state) => state.childName)

  if (childName.trim()) {
    return <Navigate to="/home" replace />
  }

  return <SplashScreen />
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <SplashRoute />,
  },
  {
    path: '/setup',
    element: <SetupRoute />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/home',
        element: <HomeScreen />,
      },
      {
        path: '/tracing/:number',
        element: <TracingScreen />,
      },
      {
        path: '/voice/:number',
        element: <VoiceScreen />,
      },
      {
        path: '/celebration/:number',
        element: <CelebrationScreen />,
      },
      {
        path: '/video/:milestone',
        element: <VideoRewardScreen />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
