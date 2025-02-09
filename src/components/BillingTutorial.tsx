'use client';

import { useState } from 'react';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

function Tooltip({ children, content, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-10 ${positionClasses[position]}`}>
          <div className="bg-gray-900 text-white text-sm rounded px-2 py-1 min-w-[200px] shadow-lg">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}

export function BillingTutorial() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const steps = [
    {
      title: 'Welcome to Hourly Billing',
      content: 'This guide will show you how to manage your hourly billing for video editing services.'
    },
    {
      title: 'Adding Hours',
      content: 'Enter the number of hours worked in the input field. You can add hours as you complete work throughout the month.'
    },
    {
      title: 'Viewing Usage',
      content: 'Below the input, you\'ll see your usage history showing hours reported for each period and the total cost.'
    },
    {
      title: 'Billing Cycle',
      content: 'Hours are automatically summed up at the end of each billing period. You\'ll only be charged for the actual hours reported.'
    }
  ];

  return (
    <div className="mb-8 bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">How to Use Hourly Billing</h2>
        <div className="text-sm text-gray-500">
          Step {currentStep} of {totalSteps}
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">
            {steps[currentStep - 1].title}
          </h3>
          <p className="text-blue-800">
            {steps[currentStep - 1].content}
          </p>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index + 1 === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
            disabled={currentStep === totalSteps}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === totalSteps ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>

      <div className="mt-8 p-4 border rounded-lg">
        <h3 className="font-medium mb-4">Example Usage</h3>
        <div className="space-y-4">
          <Tooltip content="Enter the number of hours you've worked here">
            <div className="flex items-center space-x-4 border p-3 rounded bg-gray-50">
              <label htmlFor="demo-hours" className="text-sm font-medium">Hours:</label>
              <input
                id="demo-hours"
                type="number"
                min="1"
                value="2"
                readOnly
                className="w-24 px-3 py-2 border rounded-md bg-white"
              />
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md opacity-50">
                Add Hours
              </button>
            </div>
          </Tooltip>

          <Tooltip content="View your usage history and costs here" position="bottom">
            <div className="border p-3 rounded bg-gray-50">
              <div className="flex justify-between text-sm mb-2">
                <span>Current Period Usage:</span>
                <span className="font-medium">5 hours</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Total Cost:</span>
                <span>$250.00</span>
              </div>
            </div>
          </Tooltip>
        </div>
      </div>
    </div>
  );
} 