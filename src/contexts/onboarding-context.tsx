'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types for onboarding form data
export interface SignupData {
  email: string;
  password: string;
  phone: string;
  agreeToTerms: boolean;
}

export interface RestaurantData {
  restaurantName: string;
  businessName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  cuisineType: string[];
  operatingHours: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
  logoUrl: string | null;
}

export interface SubdomainData {
  subdomain: string;
  isAvailable: boolean;
}

export interface PlanData {
  tier: 'trial' | 'basic' | 'professional' | 'enterprise';
  billingCycle: 'monthly' | 'annual';
  promoCode: string;
}

interface OnboardingContextValue {
  // Form data
  signupData: SignupData;
  restaurantData: RestaurantData;
  subdomainData: SubdomainData;
  planData: PlanData;

  // Current step (1-5)
  currentStep: number;

  // Setters
  setSignupData: (data: Partial<SignupData>) => void;
  setRestaurantData: (data: Partial<RestaurantData>) => void;
  setSubdomainData: (data: Partial<SubdomainData>) => void;
  setPlanData: (data: Partial<PlanData>) => void;
  setCurrentStep: (step: number) => void;

  // Navigation
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;

  // Reset
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

// Default operating hours
const defaultOperatingHours = {
  monday: { open: '09:00', close: '22:00', closed: false },
  tuesday: { open: '09:00', close: '22:00', closed: false },
  wednesday: { open: '09:00', close: '22:00', closed: false },
  thursday: { open: '09:00', close: '22:00', closed: false },
  friday: { open: '09:00', close: '23:00', closed: false },
  saturday: { open: '09:00', close: '23:00', closed: false },
  sunday: { open: '10:00', close: '21:00', closed: false },
};

export function OnboardingProvider({ children }: { children: ReactNode }) {
  // Helper functions for sessionStorage
  const getStoredData = <T,>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading ${key} from sessionStorage:`, error);
      return defaultValue;
    }
  };

  const setStoredData = <T,>(key: string, value: T) => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing ${key} to sessionStorage:`, error);
    }
  };

  const [currentStep, setCurrentStep] = useState(() => getStoredData('onboarding_step', 1));

  const [signupData, setSignupDataState] = useState<SignupData>(() =>
    getStoredData('onboarding_signup', {
      email: '',
      password: '',
      phone: '',
      agreeToTerms: false,
    })
  );

  const [restaurantData, setRestaurantDataState] = useState<RestaurantData>(() =>
    getStoredData('onboarding_restaurant', {
      restaurantName: '',
      businessName: '',
      phone: '',
      email: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
      cuisineType: [],
      operatingHours: defaultOperatingHours,
      logoUrl: null,
    })
  );

  const [subdomainData, setSubdomainDataState] = useState<SubdomainData>(() =>
    getStoredData('onboarding_subdomain', {
      subdomain: '',
      isAvailable: false,
    })
  );

  const [planData, setPlanDataState] = useState<PlanData>(() =>
    getStoredData('onboarding_plan', {
      tier: 'professional',
      billingCycle: 'monthly',
      promoCode: '',
    })
  );

  // Persist to sessionStorage whenever data changes
  useEffect(() => {
    setStoredData('onboarding_step', currentStep);
  }, [currentStep]);

  useEffect(() => {
    setStoredData('onboarding_signup', signupData);
  }, [signupData]);

  useEffect(() => {
    setStoredData('onboarding_restaurant', restaurantData);
  }, [restaurantData]);

  useEffect(() => {
    setStoredData('onboarding_subdomain', subdomainData);
  }, [subdomainData]);

  useEffect(() => {
    setStoredData('onboarding_plan', planData);
  }, [planData]);

  const setSignupData = (data: Partial<SignupData>) => {
    setSignupDataState((prev) => ({ ...prev, ...data }));
  };

  const setRestaurantData = (data: Partial<RestaurantData>) => {
    setRestaurantDataState((prev) => ({ ...prev, ...data }));
  };

  const setSubdomainData = (data: Partial<SubdomainData>) => {
    setSubdomainDataState((prev) => ({ ...prev, ...data }));
  };

  const setPlanData = (data: Partial<PlanData>) => {
    setPlanDataState((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const previousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const goToStep = (step: number) => {
    setCurrentStep(Math.max(1, Math.min(step, 5)));
  };

  const resetOnboarding = () => {
    // Clear sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('onboarding_step');
      sessionStorage.removeItem('onboarding_signup');
      sessionStorage.removeItem('onboarding_restaurant');
      sessionStorage.removeItem('onboarding_subdomain');
      sessionStorage.removeItem('onboarding_plan');
    }

    // Reset state
    setCurrentStep(1);
    setSignupDataState({
      email: '',
      password: '',
      phone: '',
      agreeToTerms: false,
    });
    setRestaurantDataState({
      restaurantName: '',
      businessName: '',
      phone: '',
      email: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
      cuisineType: [],
      operatingHours: defaultOperatingHours,
      logoUrl: null,
    });
    setSubdomainDataState({
      subdomain: '',
      isAvailable: false,
    });
    setPlanDataState({
      tier: 'professional',
      billingCycle: 'monthly',
      promoCode: '',
    });
  };

  const value: OnboardingContextValue = {
    signupData,
    restaurantData,
    subdomainData,
    planData,
    currentStep,
    setSignupData,
    setRestaurantData,
    setSubdomainData,
    setPlanData,
    setCurrentStep,
    nextStep,
    previousStep,
    goToStep,
    resetOnboarding,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}
