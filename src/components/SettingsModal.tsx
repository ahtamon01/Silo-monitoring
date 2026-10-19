
import React from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { LocationType, ChartType } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart2, LineChart, AreaChart } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useSettings();
  
  const [localSettings, setLocalSettings] = React.useState({
    displayMode: settings.displayMode,
    selectedLocation: settings.selectedLocation,
    defaultChartType: settings.defaultChartType,
    cellCount: settings.cellCount
  });

  React.useEffect(() => {
    if (isOpen) {
      setLocalSettings({
        displayMode: settings.displayMode,
        selectedLocation: settings.selectedLocation,
        defaultChartType: settings.defaultChartType,
        cellCount: settings.cellCount
      });
    }
  }, [isOpen, settings]);

  const handleSave = () => {
    updateSettings(localSettings);
    onClose();
  };

  const getChartIcon = (type: ChartType) => {
    switch (type) {
      case 'line':
        return <LineChart className="h-4 w-4" />;
      case 'bar':
        return <BarChart2 className="h-4 w-4" />;
      case 'area':
        return <AreaChart className="h-4 w-4" />;
      default:
        return <LineChart className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Setări aplicație</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="displayMode" className="text-right">
              Mod afișare
            </Label>
            <Select
              value={localSettings.displayMode}
              onValueChange={(value: 'all' | 'location') => 
                setLocalSettings({ ...localSettings, displayMode: value })
              }
            >
              <SelectTrigger id="displayMode" className="col-span-3">
                <SelectValue placeholder="Toate celulele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate celulele</SelectItem>
                <SelectItem value="location">Filtrare după locație</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {localSettings.displayMode === 'location' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Locație
              </Label>
              <Select
                value={localSettings.selectedLocation}
                onValueChange={(value: LocationType) => 
                  setLocalSettings({ ...localSettings, selectedLocation: value })
                }
              >
                <SelectTrigger id="location" className="col-span-3">
                  <SelectValue placeholder="Selectează locația" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baza1">Baza 1</SelectItem>
                  <SelectItem value="Baza2">Baza 2</SelectItem>
                  <SelectItem value="Baza3">Baza 3</SelectItem>
                  <SelectItem value="Extern">Extern</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="chartType" className="text-right">
              Tip grafic implicit
            </Label>
            <Select
              value={localSettings.defaultChartType}
              onValueChange={(value: ChartType) => 
                setLocalSettings({ ...localSettings, defaultChartType: value })
              }
            >
              <SelectTrigger id="chartType" className="col-span-3">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    {getChartIcon(localSettings.defaultChartType)}
                    {localSettings.defaultChartType === 'line' ? 'Linie' : 
                     localSettings.defaultChartType === 'bar' ? 'Bară' : 'Zonă'}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">
                  <div className="flex items-center gap-2">
                    <LineChart className="h-4 w-4" />
                    Linie
                  </div>
                </SelectItem>
                <SelectItem value="bar">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="h-4 w-4" />
                    Bară
                  </div>
                </SelectItem>
                <SelectItem value="area">
                  <div className="flex items-center gap-2">
                    <AreaChart className="h-4 w-4" />
                    Zonă
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cellCount" className="text-right">
              Număr celule
            </Label>
            <Input
              id="cellCount"
              type="number"
              value={localSettings.cellCount}
              onChange={(e) => 
                setLocalSettings({ 
                  ...localSettings, 
                  cellCount: Math.max(1, Math.min(24, parseInt(e.target.value) || 9)) 
                })
              }
              min="1"
              max="24"
              className="col-span-3"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="submit" onClick={handleSave}>
            Salvează setările
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
