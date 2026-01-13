import { createBrowserRouter } from 'react-router-dom';
import App from '@/App';
import { LandingPage } from '@/features/landing';
import { ProfilePage } from '@/features/profile';
import { CartPage } from '@/features/cart';
import { OrdersPage } from '@/features/orders';
import { SignUpPage, LoginPage, OnboardingStep1, OnboardingStep2 } from '@/features/auth';

// 라우트 설정
export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/home',
    element: <App />,
  },
  {
    path: '/signup',
    element: <SignUpPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/onboarding/step1',
    element: <OnboardingStep1 />,
  },
  {
    path: '/onboarding/step2',
    element: <OnboardingStep2 />,
  },
  {
    path: '/profile',
    element: <ProfilePage />,
  },
  {
    path: '/cart',
    element: <CartPage />,
  },
  {
    path: '/orders',
    element: <OrdersPage />,
  },
]);

