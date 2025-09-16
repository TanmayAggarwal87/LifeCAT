import React from 'react';
import { Tabs } from './components/ui/tabs';
import { Layout } from './components/layout/Layout';
import { AppHeader } from './components/layout/AppHeader';
import { AppNavigation } from './components/layout/AppNavigation';
import { AppContent } from './components/layout/AppContent';
import { AppFooter } from './components/layout/AppFooter';
import { useAppState } from './hooks/useAppState';

export default function App() {
  const {
    activeTab,
    assessments,
    showResults,
    handleCalculateResults,
    handleBatchCalculateResults,
    handleNewAssessment,
    handleTabChange,
  } = useAppState();

  return (
    <Layout>
      <AppHeader 
        showResults={showResults} 
        onNewAssessment={handleNewAssessment} 
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <AppNavigation 
            activeTab={activeTab}
            onTabChange={handleTabChange}
            showResults={showResults}
          />
          
          <AppContent 
            assessments={assessments}
            onCalculateResults={handleCalculateResults}
            onBatchCalculateResults={handleBatchCalculateResults}
          />
        </Tabs>
      </main>

      <AppFooter />
    </Layout>
  );
}