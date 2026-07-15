"use client";

type Props = {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
};

export default function ProgressStepper({
  steps,
  currentStep,
  onStepClick,
}: Props) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center flex-1 last:flex-none">
          <button
            onClick={() => onStepClick?.(index)}
            disabled={index > currentStep}
            className={`flex items-center gap-2 ${
              index <= currentStep
                ? "cursor-pointer"
                : "cursor-not-allowed opacity-50"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                index < currentStep
                  ? "bg-green-500 text-white"
                  : index === currentStep
                    ? "bw-primary text-white"
                    : "bg-gray-200 text-gray-500"
              }`}
            >
              {index < currentStep ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            <span
              className={`text-xs font-medium hidden sm:inline ${
                index <= currentStep ? "text-gray-700" : "text-gray-400"
              }`}
            >
              {step}
            </span>
          </button>
          {index < steps.length - 1 && (
            <div
              className={`h-0.5 flex-1 mx-2 ${
                index < currentStep ? "bg-green-500" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
