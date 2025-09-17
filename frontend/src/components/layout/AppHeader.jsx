import React from "react";
import { Button } from "../ui/button";
import { Leaf, Download } from "lucide-react";

export const AppHeader = ({ showResults, onNewAssessment }) => {
  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                LifeCAT
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Life Cycle Assessment Tool for Metals with Circularity Focus
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {showResults && (
              <Button variant="outline" onClick={onNewAssessment}>
                New Assessment
              </Button>
            )}
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
