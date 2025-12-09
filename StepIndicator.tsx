import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex items-center justify-center space-x-2 mb-8">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isActive = index + 1 === currentStep;
        const isCompleted = index + 1 < currentStep;
        
        return (
          <div key={index} className="flex items-center">
             <div
              className={`h-2 rounded-full transition-all duration-500 ease-in-out ${
                isActive ? 'w-8 bg-brand-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]' : 
                isCompleted ? 'w-2 bg-brand-600/50' : 'w-2 bg-slate-700'
              }`}
            />
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;