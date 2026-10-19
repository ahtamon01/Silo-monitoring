
import React from 'react';
import { useSilo, SiloProvider } from '@/contexts/SiloContext';
import { SettingsProvider, useSettings } from '@/contexts/SettingsContext';
import SiloCell from '@/components/SiloCell';
import ParametersModal from '@/components/ParametersModal';
import SettingsModal from '@/components/SettingsModal';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Settings, 
  Filter, 
  Plus,
  BarChart2,
  LineChart,
  AreaChart,
  Trash2
} from 'lucide-react';
import { exportAllCellsHistory } from '@/lib/exportData';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LocationType } from '@/lib/types';

const Dashboard = () => {
  const { 
    filteredCells, 
    openModal, 
    isModalOpen, 
    closeModal,
    addNewCell,
    deleteCell
  } = useSilo();
  
  const {
    settings,
    updateSettings,
    isSettingsModalOpen,
    openSettingsModal,
    closeSettingsModal
  } = useSettings();

  const handleExportAll = () => {
    exportAllCellsHistory(filteredCells);
  };

  const handleLocationFilter = (location: LocationType) => {
    updateSettings({
      displayMode: 'location',
      selectedLocation: location
    });
  };

  const clearFilter = () => {
    updateSettings({
      displayMode: 'all'
    });
  };

  const getFilterStatusText = () => {
    if (settings.displayMode === 'all') {
      return 'Toate celulele';
    }
    return `Filtrat: ${settings.selectedLocation}`;
  };

  const getChartTypeIcon = () => {
    switch (settings.defaultChartType) {
      case 'line':
        return <LineChart className="h-4 w-4 mr-2" />;
      case 'bar':
        return <BarChart2 className="h-4 w-4 mr-2" />;
      case 'area':
        return <AreaChart className="h-4 w-4 mr-2" />;
      default:
        return <LineChart className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/50">
      <ParametersModal isOpen={isModalOpen} onClose={closeModal} />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={closeSettingsModal} />
      
      <div className="container px-4 py-8 mx-auto">
        <header className="mb-8">
          <div className="flex justify-center items-center mb-4">
            <motion.img 
              src="/lovable-uploads/0e1e2bb2-a5fc-4db3-a032-31c818faf6de.png" 
              alt="ADM Logo" 
              className="h-16 mr-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <motion.h1 
            className="text-3xl font-semibold text-center text-foreground mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            ADM Logistics - Monitorizare Siloz Cereale
          </motion.h1>
          <motion.p 
            className="text-muted-foreground text-center max-w-2xl mx-auto mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Sistem de monitorizare și gestionare în timp real pentru celulele silozului
          </motion.p>
          
          <motion.div 
            className="flex flex-wrap justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button 
              onClick={handleExportAll}
              className="flex items-center gap-2"
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4" />
              Exportă datele
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  {getFilterStatusText()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Filtrare după locație</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={clearFilter}>
                  Toate celulele
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLocationFilter('Baza1')}>
                  Baza 1
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLocationFilter('Baza2')}>
                  Baza 2
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLocationFilter('Baza3')}>
                  Baza 3
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLocationFilter('Extern')}>
                  Extern
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              onClick={addNewCell}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Adaugă celulă
            </Button>
            
            <Button 
              onClick={openSettingsModal}
              className="flex items-center gap-2"
              variant="outline"
              size="sm"
            >
              <Settings className="h-4 w-4" />
              Setări
            </Button>
          </motion.div>

          <motion.div 
            className="flex justify-center items-center mt-4 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center text-sm text-muted-foreground">
              <span>Tip grafic implicit:</span>
              <span className="flex items-center ml-2 font-medium">
                {getChartTypeIcon()}
                {settings.defaultChartType === 'line' ? 'Linie' : 
                 settings.defaultChartType === 'bar' ? 'Bară' : 'Zonă'}
              </span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <span>Celule afișate: </span>
              <span className="font-medium">{filteredCells.length}</span>
            </div>
          </motion.div>
        </header>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {filteredCells.map(cell => (
            <motion.div
              key={cell.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
              }}
              transition={{ duration: 0.3 }}
            >
              <SiloCell cell={cell} onOpenSettings={openModal} onDelete={deleteCell} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <SettingsProvider>
      <SiloProvider>
        <Dashboard />
      </SiloProvider>
    </SettingsProvider>
  );
};

export default Index;
