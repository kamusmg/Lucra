
import React, { Suspense } from 'react';
import { DataProvider } from './contexts/DataContext.tsx';
import { LanguageProvider } from './contexts/LanguageContext.tsx';
import { apiClient } from './services/api/bootstrap.ts';
import LoadingSpinner from './components/LoadingSpinner.tsx';
import AppContent from './AppContent.tsx'; 

const App: React.FC = () => {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <LanguageProvider>
                <DataProvider apiClient={apiClient}>
                    <AppContent />
                </DataProvider>
            </LanguageProvider>
        </Suspense>
    );
};

export default App;