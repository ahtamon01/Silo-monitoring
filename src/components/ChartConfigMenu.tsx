
import React from 'react';
import { ChartType } from '@/lib/types';
import { useSilo } from '@/contexts/SiloContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  BarChart2, 
  LineChart, 
  AreaChart,
  Settings
} from 'lucide-react';

interface ChartConfigMenuProps {
  cellId: number;
  chartType: ChartType;
}

const ChartConfigMenu: React.FC<ChartConfigMenuProps> = ({ cellId, chartType }) => {
  const { updateCellChartType } = useSilo();

  const handleChartTypeChange = (type: ChartType) => {
    updateCellChartType(cellId, type);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-gray-500 hover:text-primary"
          title="Configurare grafic"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Tip grafic</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => handleChartTypeChange('line')}
          className={chartType === 'line' ? 'bg-accent text-accent-foreground' : ''}
        >
          <LineChart className="h-4 w-4 mr-2" />
          <span>Linie</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleChartTypeChange('bar')}
          className={chartType === 'bar' ? 'bg-accent text-accent-foreground' : ''}
        >
          <BarChart2 className="h-4 w-4 mr-2" />
          <span>Bară</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleChartTypeChange('area')}
          className={chartType === 'area' ? 'bg-accent text-accent-foreground' : ''}
        >
          <AreaChart className="h-4 w-4 mr-2" />
          <span>Zonă</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ChartConfigMenu;
