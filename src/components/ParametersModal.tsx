
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSilo } from '@/contexts/SiloContext';
import { PRODUCTS_CONFIG, calculateConeHeight } from '@/lib/siloCalculations';
import { SiloParameters, ProductType, LocationType, QualityLevel } from '@/lib/types';
import { motion } from 'framer-motion';
import { ChevronDown, Info } from 'lucide-react';

interface ParametersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ParametersModal: React.FC<ParametersModalProps> = ({ isOpen, onClose }) => {
  const { cells, selectedCellId, updateCellParameters } = useSilo();
  const [parameters, setParameters] = useState<SiloParameters>({
    radius: 11.17,
    heightCylinder: 16.40,
    angleTaluz: 32,
    product: 'grau' as ProductType,
    weight: PRODUCTS_CONFIG.grau.density,
    hectoliterWeight: PRODUCTS_CONFIG.grau.hectoliterWeight,
    emptySpace: 0,
    location: 'Baza1' as LocationType,
    quality: 'Standard' as QualityLevel
  });
  
  const [coneHeight, setConeHeight] = useState(0);
  const [totalVolume, setTotalVolume] = useState(0);

  // Actualizați formularul când se deschide modalul cu un ID de celulă selectat
  useEffect(() => {
    if (selectedCellId && cells.length > 0) {
      const cell = cells.find(c => c.id === selectedCellId);
      if (cell) {
        setParameters(cell.parameters);
      }
    }
  }, [selectedCellId, cells, isOpen]);

  // Calculele pentru înălțimea conului și volumul total
  useEffect(() => {
    if (parameters.radius && parameters.angleTaluz) {
      const heightCone = calculateConeHeight(parameters.radius, parameters.angleTaluz);
      setConeHeight(heightCone);
      
      // Calculul volumului total
      const cylinderVolume = Math.PI * Math.pow(parameters.radius, 2) * parameters.heightCylinder;
      const coneVolume = (1/3) * Math.PI * Math.pow(parameters.radius, 2) * heightCone;
      setTotalVolume(cylinderVolume + coneVolume);
    }
  }, [parameters.radius, parameters.heightCylinder, parameters.angleTaluz]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParameters(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const handleProductChange = (value: string) => {
    const productKey = value as ProductType;
    setParameters(prev => ({ 
      ...prev, 
      product: productKey,
      weight: PRODUCTS_CONFIG[productKey].density,
      hectoliterWeight: PRODUCTS_CONFIG[productKey].hectoliterWeight
    }));
  };

  const handleLocationChange = (value: string) => {
    setParameters(prev => ({ 
      ...prev, 
      location: value as LocationType
    }));
  };

  const handleQualityChange = (value: string) => {
    setParameters(prev => ({ 
      ...prev, 
      quality: value as QualityLevel
    }));
  };

  const handleSubmit = () => {
    if (selectedCellId) {
      updateCellParameters(selectedCellId, parameters);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="glass-modal max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium text-center">
            Setare Parametri Celula {selectedCellId}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="radius" className="text-sm font-medium">
                Raza cilindrului (m)
              </Label>
              <Input
                id="radius"
                name="radius"
                type="number"
                step="0.01"
                min="0"
                value={parameters.radius}
                onChange={handleInputChange}
                className="parameter-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="heightCylinder" className="text-sm font-medium">
                Înălțimea cilindrului (m)
              </Label>
              <Input
                id="heightCylinder"
                name="heightCylinder"
                type="number"
                step="0.01"
                min="0"
                value={parameters.heightCylinder}
                onChange={handleInputChange}
                className="parameter-input"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="angleTaluz" className="text-sm font-medium">
                Unghi taluz (grade)
              </Label>
              <Input
                id="angleTaluz"
                name="angleTaluz"
                type="number"
                step="0.1"
                min="0"
                max="90"
                value={parameters.angleTaluz}
                onChange={handleInputChange}
                className="parameter-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="emptySpace" className="text-sm font-medium">
                Spațiu gol măsurat (m)
              </Label>
              <Input
                id="emptySpace"
                name="emptySpace"
                type="number"
                step="0.01"
                min="0"
                value={parameters.emptySpace}
                onChange={handleInputChange}
                className="parameter-input"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="product" className="text-sm font-medium">
              Produs
            </Label>
            <Select 
              value={parameters.product} 
              onValueChange={handleProductChange}
            >
              <SelectTrigger className="parameter-input">
                <SelectValue placeholder="Selectează produsul" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PRODUCTS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: config.color }}
                      ></div>
                      {config.label} ({config.density} kg/m³)
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">
                Locație
              </Label>
              <Select 
                value={parameters.location} 
                onValueChange={handleLocationChange}
              >
                <SelectTrigger className="parameter-input">
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
            
            <div className="space-y-2">
              <Label htmlFor="quality" className="text-sm font-medium">
                Calitate
              </Label>
              <Select 
                value={parameters.quality} 
                onValueChange={handleQualityChange}
              >
                <SelectTrigger className="parameter-input">
                  <SelectValue placeholder="Selectează calitatea" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Premium">Premium</SelectItem>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Basic">Basic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-sm font-medium">
                Greutate volumetrică (kg/m³)
              </Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                step="1"
                min="0"
                value={parameters.weight}
                onChange={handleInputChange}
                className="parameter-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hectoliterWeight" className="text-sm font-medium">
                Greutate hectolitrică (kg/hl)
              </Label>
              <Input
                id="hectoliterWeight"
                name="hectoliterWeight"
                type="number"
                step="0.1"
                min="0"
                value={parameters.hectoliterWeight}
                onChange={handleInputChange}
                className="parameter-input"
              />
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-secondary/50 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Info size={16} className="text-primary" />
              Calculații automate
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Înălțimea conului:</div>
              <div className="font-medium">{coneHeight.toFixed(2)} m</div>
              
              <div>Volum total siloz:</div>
              <div className="font-medium">{totalVolume.toFixed(2)} m³</div>
              
              <div>Capacitate maximă:</div>
              <div className="font-medium">
                {parameters.product === 'grau' && parameters.heightCylinder === 16.40 ? 
                  "5400.00 tone" : 
                  ((totalVolume * parameters.weight) / 1000).toFixed(2) + " tone"}
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="flex-1 hover:bg-destructive/10 border border-destructive/30 hover:border-destructive/50 text-destructive"
          >
            Anulează
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            Confirmă
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ParametersModal;
