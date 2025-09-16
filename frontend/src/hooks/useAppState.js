import { useState } from 'react';

export const useAppState = () => {
  const [activeTab, setActiveTab] = useState('assessment');
  const [assessments, setAssessments] = useState([]); // Changed to an array
  const [showResults, setShowResults] = useState(false);

  const handleCalculateResults = (formData) => {
    setAssessments([formData]); // Add single assessment to the array
    setShowResults(true);
    setActiveTab('results');
  };

  const handleBatchCalculateResults = (batchResults) => {
    setAssessments(batchResults);
    setShowResults(true);
    setActiveTab('results');
  };

  const handleNewAssessment = () => {
    setAssessments([]); // Clear all assessments
    setShowResults(false);
    setActiveTab('assessment');
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  return {
    activeTab,
    assessments, // Changed from assessmentData
    showResults,
    handleCalculateResults,
    handleBatchCalculateResults, // New function
    handleNewAssessment,
    handleTabChange,
  };
};