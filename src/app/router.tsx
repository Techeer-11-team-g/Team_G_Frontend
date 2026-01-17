import { createBrowserRouter } from 'react-router-dom';
import App from '@/App';
import { LandingPage } from '@/features/landing';
import { ProfilePage } from '@/features/profile';
import { CartPage } from '@/features/cart';
import { OrdersPage, OrderDetailPage } from '@/features/orders';
import { SignUpPage, LoginPage, OnboardingStep1, OnboardingStep2 } from '@/features/auth';
import { RootLayout, PageWrapper } from '@/components/layout';

// 페이지 래퍼 - 애니메이션 적용
const withPageTransition = (Component: React.ComponentType) => (
  <PageWrapper>
    <Component />
  </PageWrapper>
);

// 라우트 설정
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: withPageTransition(LandingPage),
      },
      {
        path: 'home',
        element: withPageTransition(App),
      },
      {
        path: 'signup',
        element: withPageTransition(SignUpPage),
      },
      {
        path: 'login',
        element: withPageTransition(LoginPage),
      },
      {
        path: 'onboarding/step1',
        element: withPageTransition(OnboardingStep1),
      },
      {
        path: 'onboarding/step2',
        element: withPageTransition(OnboardingStep2),
      },
      {
        path: 'profile',
        element: withPageTransition(ProfilePage),
      },
      {
        path: 'cart',
        element: withPageTransition(CartPage),
      },
      {
        path: 'orders',
        element: withPageTransition(OrdersPage),
      },
      {
        path: 'orders/:orderId',
        element: withPageTransition(OrderDetailPage),
      },
    ],
  },
]);
