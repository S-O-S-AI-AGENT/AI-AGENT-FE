"use client";

import { Icons } from "./Icons";
import { cn } from "@/lib/utils";

interface StepperProps {
  currentStep: string;
  steps: { id: string; name: string }[];
  className?: string;
}

export function Stepper({ currentStep, steps, className }: StepperProps) {
  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <nav aria-label="Progress" className={cn("w-full", className)}>
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li
            key={step.name}
            className={cn("relative flex-1", {
              "pr-8 sm:pr-20": stepIdx !== steps.length - 1,
            })}
          >
            {stepIdx < currentStepIndex ? (
              <>
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="h-0.5 w-full bg-indigo-600" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-900">
                  <Icons.CheckCircle className="h-5 w-5 text-white" />
                </div>
              </>
            ) : stepIdx === currentStepIndex ? (
              <>
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="h-0.5 w-full bg-gray-200 dark:bg-gray-700" />
                </div>
                <div
                  className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-indigo-600 bg-white dark:bg-gray-900"
                  aria-current="step"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
                </div>
              </>
            ) : (
              <>
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="h-0.5 w-full bg-gray-200 dark:bg-gray-700" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">
                  <div className="h-2 w-2 rounded-full bg-gray-500 dark:bg-gray-400" />
                </div>
              </>
            )}
            <div className="absolute top-10 w-max text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {step.name}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
