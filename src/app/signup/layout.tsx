'use client';

import { OnboardingProvider } from '@/contexts/onboarding-context';

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OnboardingProvider>{children}</OnboardingProvider>;
}
