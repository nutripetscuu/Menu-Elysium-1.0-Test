"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface LivePreviewContextType {
  refreshKey: number;
  refreshPreview: () => void;
}

const LivePreviewContext = createContext<LivePreviewContextType | undefined>(undefined);

export function LivePreviewProvider({ children }: { children: ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshPreview = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <LivePreviewContext.Provider value={{ refreshKey, refreshPreview }}>
      {children}
    </LivePreviewContext.Provider>
  );
}

export function useLivePreview() {
  const context = useContext(LivePreviewContext);
  if (context === undefined) {
    throw new Error('useLivePreview must be used within a LivePreviewProvider');
  }
  return context;
}
