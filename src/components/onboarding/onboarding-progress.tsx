'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  number: number;
  title: string;
  description: string;
}

const steps: Step[] = [
  { number: 1, title: 'Account', description: 'Create your account' },
  { number: 2, title: 'Restaurant', description: 'Restaurant details' },
  { number: 3, title: 'Domain', description: 'Choose subdomain' },
  { number: 4, title: 'Plan', description: 'Select your plan' },
  { number: 5, title: 'Complete', description: 'All done!' },
];

interface OnboardingProgressProps {
  currentStep: number;
}

export function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
  return (
    <div className="w-full py-8">
      <div className="mx-auto max-w-4xl px-4">
        {/* Desktop: Horizontal stepper */}
        <div className="hidden md:block">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isCompleted = currentStep > step.number;
              const isCurrent = currentStep === step.number;
              const isUpcoming = currentStep < step.number;

              return (
                <div key={step.number} className="flex items-center flex-1">
                  {/* Step circle */}
                  <div className="flex flex-col items-center relative">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all',
                        isCompleted &&
                          'bg-primary text-primary-foreground',
                        isCurrent &&
                          'bg-primary text-primary-foreground ring-4 ring-primary/20',
                        isUpcoming &&
                          'bg-muted text-muted-foreground border-2 border-border'
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-6 w-6" />
                      ) : (
                        <span>{step.number}</span>
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <div
                        className={cn(
                          'text-sm font-medium',
                          (isCompleted || isCurrent) && 'text-foreground',
                          isUpcoming && 'text-muted-foreground'
                        )}
                      >
                        {step.title}
                      </div>
                      <div className="text-xs text-muted-foreground hidden lg:block">
                        {step.description}
                      </div>
                    </div>
                  </div>

                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        'h-1 flex-1 mx-4 rounded-full transition-all',
                        currentStep > step.number
                          ? 'bg-primary'
                          : 'bg-muted'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile: Compact progress bar */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-medium">
                Step {currentStep} of {steps.length}
              </div>
              <div className="text-xs text-muted-foreground">
                {steps[currentStep - 1]?.description}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {Math.round((currentStep / steps.length) * 100)}%
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
