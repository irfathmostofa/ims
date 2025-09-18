"use client";

import { CheckCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  steps: string[];
  currentStep: number;
};

export default function ProgressStepper({ steps, currentStep }: Props) {
  return (
    <div className="flex justify-between items-center mb-8">
      {steps.map((step, index) => (
        <div key={index} className="flex flex-col items-center w-full">
          {index < currentStep ? (
            <CheckCircle className="w-6 h-6 text-green-500" />
          ) : index === currentStep ? (
            <Circle className="w-6 h-6 text-blue-600" />
          ) : (
            <Circle className="w-6 h-6 text-gray-300" />
          )}
          <p
            className={cn(
              "text-xs mt-1",
              index === currentStep
                ? "text-blue-600 font-semibold"
                : index < currentStep
                ? "text-green-500"
                : "text-gray-400"
            )}
          >
            {step}
          </p>
          {index < steps.length - 1 && (
            <div className="h-0.5 bg-gray-200 flex-1 mx-2 w-full" />
          )}
        </div>
      ))}
    </div>
  );
}
