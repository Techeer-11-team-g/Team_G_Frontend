import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout, PageWrapper } from '@/components/layout';

// Lazy load pages for code splitting
// Critical path - Landing page loads immediately
const LandingPage = lazy(() =>
  import('@/features/landing').then((m) => ({ default: m.LandingPage }))
);

// Home pages
const NewHomePage = lazy(() =>
  import('@/features/home').then((m) => ({ default: m.NewHomePage }))
);
const AgentHomePage = lazy(() =>
  import('@/features/home').then((m) => ({ default: m.AgentHomePage }))
);

// Auth pages
const SignUpPage = lazy(() =>
  import('@/features/auth').then((m) => ({ default: m.SignUpPage }))
);
const LoginPage = lazy(() =>
  import('@/features/auth').then((m) => ({ default: m.LoginPage }))
);
const OnboardingStep1 = lazy(() =>
  import('@/features/auth').then((m) => ({ default: m.OnboardingStep1 }))
);
const OnboardingStep2 = lazy(() =>
  import('@/features/auth').then((m) => ({ default: m.OnboardingStep2 }))
);
const OnboardingStep3 = lazy(() =>
  import('@/features/auth').then((m) => ({ default: m.OnboardingStep3 }))
);

// Profile page
const ProfilePage = lazy(() =>
  import('@/features/profile').then((m) => ({ default: m.ProfilePage }))
);

// Cart page
const CartPage = lazy(() =>
  import('@/features/cart').then((m) => ({ default: m.CartPage }))
);

// Orders pages
const OrdersPage = lazy(() =>
  import('@/features/orders').then((m) => ({ default: m.OrdersPage }))
);
const OrderDetailPage = lazy(() =>
  import('@/features/orders').then((m) => ({ default: m.OrderDetailPage }))
);

// Minimal loading fallback - prevents layout shift
const PageFallback = () => (
  <div className="min-h-screen bg-background" />
);

// 페이지 래퍼 - 애니메이션 및 Suspense 적용
const withPageTransition = (Component: React.LazyExoticComponent<React.ComponentType>) => (
  <Suspense fallback={<PageFallback />}>
    <PageWrapper>
      <Component />
    </PageWrapper>
  </Suspense>
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
        element: withPageTransition(NewHomePage),
      },
      {
        path: 'home/agent',
        element: withPageTransition(AgentHomePage),
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
        path: 'onboarding/step3',
        element: withPageTransition(OnboardingStep3),
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
