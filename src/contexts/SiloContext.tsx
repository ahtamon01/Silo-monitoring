import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  SiloCellData, 
  SiloParameters, 
  ProductType,
  LocationType,
  QualityLevel,
  ChartType,
  HistoricalDataPoint 
} from '@/lib/types';
import { 
  calculateVolumeAndMass, 
  PRODUCTS_CONFIG,
  simulateEmptySpaceChange,
  fetchESP8266Data,
  updateSiloParametersFromESP
} from '@/lib/siloCalculations';
import { toast } from '@/components/ui/use-toast';
import { useSettings } from './SettingsContext';

interface SiloContextType {
  cells: SiloCellData[];
  updateCellParameters: (id: number, parameters: SiloParameters) => void;
  updateCellChartType: (id: number, chartType: ChartType) => void;
  selectedCellId: number | null;
  setSelectedCellId: (id: number | null) => void;
  isModalOpen: boolean;
  openModal: (id: number) => void;
  closeModal: () => void;
  filteredCells: SiloCellData[];
  addNewCell: () => void;
  deleteCell: (id: number) => void;
  espConnectionStatus: 'connected' | 'disconnected' | 'pending';
  lastEspUpdate: Date | null;
}

const defaultParameters: SiloParameters = {
  radius: 11.17,
  heightCylinder: 16.40,
  angleTaluz: 32,
  product: 'grau',
  weight: PRODUCTS_CONFIG.grau.density,
  hectoliterWeight: PRODUCTS_CONFIG.grau.hectoliterWeight,
  emptySpace: 5,
  location: 'Baza1',
  quality: 'Standard'
};

const SiloContext = createContext<SiloContextType | undefined>(undefined);

export const SiloProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cells, setCells] = useState<SiloCellData[]>([]);
  const [selectedCellId, setSelectedCellId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [espConnectionStatus, setEspConnectionStatus] = useState<'connected' | 'disconnected' | 'pending'>('pending');
  const [lastEspUpdate, setLastEspUpdate] = useState<Date | null>(null);
  const { settings } = useSettings();

  useEffect(() => {
    const initialCells: SiloCellData[] = [];
    
    const savedData = localStorage.getItem('silosCellsData');
    const parsedData = savedData ? JSON.parse(savedData) : null;
    
    const cellCount = parsedData?.length || settings.cellCount || 9;
    
    for (let i = 1; i <= cellCount; i++) {
      const savedCell = parsedData?.[i-1];
      
      const parameters: SiloParameters = savedCell?.parameters || {
        ...defaultParameters,
        emptySpace: 5 + Math.random() * 10,
        location: ['Baza1', 'Baza2', 'Baza3', 'Extern'][Math.floor(Math.random() * 4)] as LocationType,
        quality: ['Premium', 'Standard', 'Basic'][Math.floor(Math.random() * 3)] as QualityLevel
      };
      
      let history: HistoricalDataPoint[] = [];
      if (savedCell?.history) {
        history = savedCell.history.map((item: any) => ({
          timestamp: new Date(item.timestamp),
          mass: item.mass,
          level: item.level || (defaultParameters.heightCylinder + 
                 calculateVolumeAndMass(parameters, []).heightCone - item.emptySpace)
        }));
      }
      
      const results = calculateVolumeAndMass(parameters, history);
      
      initialCells.push({
        id: i,
        parameters,
        results,
        history,
        chartType: savedCell?.chartType || settings.defaultChartType || 'line',
        lastLoadingTime: savedCell?.lastLoadingTime ? new Date(savedCell.lastLoadingTime) : undefined,
        lastUnloadingTime: savedCell?.lastUnloadingTime ? new Date(savedCell.lastUnloadingTime) : undefined
      });
    }
    
    setCells(initialCells);
  }, [settings.cellCount, settings.defaultChartType]);

  useEffect(() => {
    if (cells.length > 0) {
      localStorage.setItem('silosCellsData', JSON.stringify(cells));
    }
  }, [cells]);

  const updateCellParameters = useCallback((id: number, parameters: SiloParameters) => {
    setCells(prevCells => 
      prevCells.map(cell => {
        if (cell.id === id) {
          const currentTime = new Date();
          
          // Calculate current level
          const totalHeight = parameters.heightCylinder + calculateVolumeAndMass(parameters, []).heightCone;
          const currentLevel = totalHeight - parameters.emptySpace;
          
          // Determine previous level (if it exists)
          const previousLevel = cell.history.length > 0 ? 
            cell.history[cell.history.length - 1].level : currentLevel;
          
          // Calculate results with updated parameters
          const latestResults = calculateVolumeAndMass(parameters, cell.history);
          
          // Update history
          const updatedHistory = [...cell.history, {
            timestamp: currentTime,
            mass: latestResults.mass,
            level: currentLevel
          }];
          
          if (updatedHistory.length > 10) {
            updatedHistory.shift();
          }
          
          // Recalculate results with updated history
          const results = calculateVolumeAndMass(parameters, updatedHistory);
          
          // Determine trend based on level change
          const levelChange = currentLevel - previousLevel;
          let trend: 'stable' | 'loading' | 'unloading' = 'stable';
          
          if (Math.abs(levelChange) > 0.05) { // threshold to avoid minor fluctuations
            trend = levelChange > 0 ? 'loading' : 'unloading';
          }
          
          results.levelChange = levelChange;
          results.trend = trend;
          
          return {
            ...cell,
            parameters,
            history: updatedHistory,
            results
          };
        }
        return cell;
      })
    );
    
    toast({
      title: "Parametri actualizați",
      description: `Celula ${id} a fost actualizată cu succes.`,
      duration: 3000,
    });
  }, []);

  const updateCellChartType = useCallback((id: number, chartType: ChartType) => {
    setCells(prevCells => 
      prevCells.map(cell => {
        if (cell.id === id) {
          return { ...cell, chartType };
        }
        return cell;
      })
    );
    
    toast({
      title: "Tip grafic actualizat",
      description: `Celula ${id} folosește acum grafic de tip ${chartType}.`,
      duration: 3000,
    });
  }, []);

  const addNewCell = useCallback(() => {
    setCells(prevCells => {
      const newId = prevCells.length > 0 ? Math.max(...prevCells.map(cell => cell.id)) + 1 : 1;
      
      const parameters: SiloParameters = {
        ...defaultParameters,
        emptySpace: 5 + Math.random() * 10,
        location: ['Baza1', 'Baza2', 'Baza3', 'Extern'][Math.floor(Math.random() * 4)] as LocationType,
        quality: ['Premium', 'Standard', 'Basic'][Math.floor(Math.random() * 3)] as QualityLevel
      };
      
      const results = calculateVolumeAndMass(parameters, []);
      
      const newCell: SiloCellData = {
        id: newId,
        parameters,
        results,
        history: [],
        chartType: settings.defaultChartType || 'line'
      };
      
      toast({
        title: "Celulă nouă adăugată",
        description: `Celula ${newId} a fost adăugată cu succes.`,
        duration: 3000,
      });
      
      return [...prevCells, newCell];
    });
  }, [settings.defaultChartType]);

  const deleteCell = useCallback((id: number) => {
    setCells(prevCells => {
      const filteredCells = prevCells.filter(cell => cell.id !== id);
      
      toast({
        title: "Celulă eliminată",
        description: `Celula ${id} a fost eliminată cu succes.`,
        duration: 3000,
      });
      
      return filteredCells;
    });
  }, []);

  const openModal = useCallback((id: number) => {
    setSelectedCellId(id);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedCellId(null);
  }, []);

  useEffect(() => {
    const updateFromESP = async () => {
      try {
        const espData = await fetchESP8266Data();
        
        if (espData) {
          console.log("Successfully received ESP data:", espData);
          
          setCells(prevCells => 
            prevCells.map(cell => {
              // Update parameters with ESP8266 data - using registers 1-9
              const updatedParameters = updateSiloParametersFromESP(cell.id, cell.parameters, espData);
              
              const currentTime = new Date();
              setLastEspUpdate(currentTime);
              setEspConnectionStatus('connected');
              
              // Calculate current level
              const totalHeight = updatedParameters.heightCylinder + 
                                calculateVolumeAndMass(updatedParameters, []).heightCone;
              const currentLevel = totalHeight - updatedParameters.emptySpace;
              
              // Determine previous level
              const previousLevel = cell.history.length > 0 ? 
                cell.history[cell.history.length - 1].level : currentLevel;
              
              // Calculate current results
              const latestResults = calculateVolumeAndMass(updatedParameters, cell.history);
              
              // Update history
              const updatedHistory = [...cell.history, {
                timestamp: currentTime,
                mass: latestResults.mass,
                level: currentLevel
              }];
              
              if (updatedHistory.length > 10) {
                updatedHistory.shift();
              }
              
              // Recalculate results with updated history
              const results = calculateVolumeAndMass(updatedParameters, updatedHistory);
              
              // Determine trend based on level change
              const levelChange = currentLevel - previousLevel;
              let trend: 'stable' | 'loading' | 'unloading' = 'stable';
              
              if (Math.abs(levelChange) > 0.05) { // threshold to avoid minor fluctuations
                trend = levelChange > 0 ? 'loading' : 'unloading';
              }
              
              results.levelChange = levelChange;
              results.trend = trend;
              
              // Update last loading/unloading times based on trend
              let lastLoadingTime = cell.lastLoadingTime;
              let lastUnloadingTime = cell.lastUnloadingTime;
              
              if (trend === 'loading' && 
                  (!lastLoadingTime || Math.abs(currentTime.getTime() - lastLoadingTime.getTime()) > 30000)) {
                lastLoadingTime = currentTime;
              } else if (trend === 'unloading' && 
                        (!lastUnloadingTime || Math.abs(currentTime.getTime() - lastUnloadingTime.getTime()) > 30000)) {
                lastUnloadingTime = currentTime;
              }
              
              return {
                ...cell,
                parameters: updatedParameters,
                history: updatedHistory,
                results,
                lastLoadingTime,
                lastUnloadingTime
              };
            })
          );
        } else {
          // Fallback to simulation if ESP data fetching fails
          console.log("ESP connection failed, setting silos to full (emptySpace = 0)");
          setEspConnectionStatus('disconnected');
          
          setCells(prevCells => 
            prevCells.map(cell => {
              // When ESP connection fails, set all silos to full (emptySpace = 0)
              const updatedParameters = { ...cell.parameters, emptySpace: 0 };
              
              const currentTime = new Date();
              
              // Calculate current level with empty space = 0
              const totalHeight = updatedParameters.heightCylinder + 
                                calculateVolumeAndMass(updatedParameters, []).heightCone;
              const currentLevel = totalHeight; // No empty space, so level = total height
              
              // Determine previous level
              const previousLevel = cell.history.length > 0 ? 
                cell.history[cell.history.length - 1].level : currentLevel;
              
              // Calculate current results
              const latestResults = calculateVolumeAndMass(updatedParameters, cell.history);
              
              // Update history
              const updatedHistory = [...cell.history, {
                timestamp: currentTime,
                mass: latestResults.mass,
                level: currentLevel
              }];
              
              if (updatedHistory.length > 10) {
                updatedHistory.shift();
              }
              
              // Recalculate results with updated history
              const results = calculateVolumeAndMass(updatedParameters, updatedHistory);
              
              // When ESP is disconnected, we set trend to stable
              results.levelChange = 0;
              results.trend = 'stable';
              
              return {
                ...cell,
                parameters: updatedParameters,
                history: updatedHistory,
                results,
                lastLoadingTime: cell.lastLoadingTime,
                lastUnloadingTime: cell.lastUnloadingTime
              };
            })
          );
        }
      } catch (error) {
        console.error('Error updating from ESP:', error);
        setEspConnectionStatus('disconnected');
      }
    };
    
    // Initial update
    updateFromESP();
    
    // Set interval for regular updates
    const interval = setInterval(updateFromESP, 2000); // Match ESP update interval
    
    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, []);

  const filteredCells = settings.displayMode === 'location' && settings.selectedLocation
    ? cells.filter(cell => cell.parameters.location === settings.selectedLocation)
    : cells;

  return (
    <SiloContext.Provider
      value={{
        cells,
        filteredCells,
        updateCellParameters,
        updateCellChartType,
        selectedCellId,
        setSelectedCellId,
        isModalOpen,
        openModal,
        closeModal,
        addNewCell,
        deleteCell,
        espConnectionStatus,
        lastEspUpdate
      }}
    >
      {children}
    </SiloContext.Provider>
  );
};

export const useSilo = () => {
  const context = useContext(SiloContext);
  if (context === undefined) {
    throw new Error('useSilo must be used within a SiloProvider');
  }
  return context;
};
