
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppSettings, ChartType, LocationType } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  isSettingsModalOpen: boolean;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
}

const defaultSettings: AppSettings = {
  displayMode: 'all',
  defaultChartType: 'line',
  cellCount: 9
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('silosAppSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('silosAppSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      
      toast({
        title: "Setări actualizate",
        description: "Setările aplicației au fost actualizate cu succes.",
        duration: 3000,
      });
      
      return updated;
    });
  };

  const openSettingsModal = () => setIsSettingsModalOpen(true);
  const closeSettingsModal = () => setIsSettingsModalOpen(false);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        isSettingsModalOpen,
        openSettingsModal,
        closeSettingsModal
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
