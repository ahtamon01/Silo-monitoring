import React from 'react';
import { SiloCellData } from '@/lib/types';
import { PRODUCTS_CONFIG, formatNumber } from '@/lib/siloCalculations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  BarChart2, 
  Download,
  Clock,
  MapPin,
  Package,
  Trash2
} from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  Filler
} from 'chart.js';
import { exportCellHistory } from '@/lib/exportData';
import { format } from 'date-fns';
import ChartConfigMenu from './ChartConfigMenu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

interface SiloCellProps {
  cell: SiloCellData;
  onOpenSettings: (id: number) => void;
  onDelete: (id: number) => void;
}

const SiloCell: React.FC<SiloCellProps> = ({ cell, onOpenSettings, onDelete }) => {
  const { id, parameters, results, history, chartType, lastLoadingTime, lastUnloadingTime } = cell;
  const productConfig = PRODUCTS_CONFIG[parameters.product];
  
  const chartData = {
    labels: history.map(point => {
      const date = new Date(point.timestamp);
      return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    }),
    datasets: [
      {
        label: 'Masă (tone)',
        data: history.map(point => point.mass),
        borderColor: productConfig.color,
        backgroundColor: `${productConfig.color}20`,
        fill: chartType === 'area',
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };
  
  const chartOptions: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          font: {
            size: 10,
          },
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        ticks: {
          font: {
            size: 10,
          },
        },
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#000',
        bodyColor: '#000',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 10,
        boxPadding: 5,
        usePointStyle: true,
        titleFont: {
          size: 12,
          weight: 'bold',
        },
        bodyFont: {
          size: 12,
        },
        callbacks: {
          label: function(context) {
            return `${formatNumber(context.parsed.y)} tone`;
          }
        }
      },
    },
  };
  
  const getTrendIcon = () => {
    switch (results.trend) {
      case 'loading':
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'unloading':
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getTrendText = () => {
    switch (results.trend) {
      case 'loading':
        return 'Încărcare';
      case 'unloading':
        return 'Descărcare';
      default:
        return 'Stabil';
    }
  };
  
  const getTrendColor = () => {
    switch (results.trend) {
      case 'loading':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'unloading':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const getQualityBadge = () => {
    switch (parameters.quality) {
      case 'Premium':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">Premium</Badge>;
      case 'Standard':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">Standard</Badge>;
      case 'Basic':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">Basic</Badge>;
      default:
        return null;
    }
  };
  
  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    return format(date, 'dd.MM.yyyy HH:mm');
  };
  
  const fillHeight = `${Math.min(100, results.fillPercent)}%`;

  const handleExport = () => {
    exportCellHistory(cell);
  };

  const handleDelete = () => {
    onDelete(id);
  };

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return <Bar data={chartData} options={chartOptions} />;
      case 'line':
      case 'area':
      default:
        return <Line data={chartData} options={chartOptions} />;
    }
  };

  return (
    <Card className="glass-card overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-medium">Celula {id}</CardTitle>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className={`text-xs ${getTrendColor()}`}>
            <span className="flex items-center gap-1">
              {getTrendIcon()}
              {getTrendText()}
            </span>
          </Badge>
          <ChartConfigMenu cellId={id} chartType={chartType} />
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-gray-500 hover:text-primary"
            onClick={handleExport}
            title="Exportă istoric"
          >
            <Download className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-gray-500 hover:text-red-500"
                title="Șterge celula"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmare ștergere</AlertDialogTitle>
                <AlertDialogDescription>
                  Sunteți sigur că doriți să ștergeți Celula {id}? Această acțiune nu poate fi anulată.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Anulează</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                  Șterge
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-gray-500 hover:text-primary"
            onClick={() => onOpenSettings(id)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1 flex flex-col items-center justify-center">
            <div className="silo-3d mb-2">
              <div 
                className="silo-fill"
                style={{ 
                  height: fillHeight, 
                  backgroundColor: productConfig.color,
                  transition: 'height 1s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            </div>
            
            <div className="text-xs font-medium text-center">
              {formatNumber(results.fillPercent)}%
            </div>
          </div>
          
          <div className="col-span-2 space-y-1.5">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <div className="tag bg-gray-100 border border-gray-200 flex items-center gap-1">
                {productConfig.label}
                <div 
                  className="w-3 h-3 rounded-full ml-1" 
                  style={{ backgroundColor: productConfig.color }}
                />
              </div>
              
              <div className="tag bg-gray-100 border border-gray-200 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {parameters.location}
              </div>
              
              <div className="flex items-center gap-1">
                <Package className="h-3 w-3" />
                {getQualityBadge()}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
              <div className="text-gray-500">Nivel:</div>
              <div className="font-medium">{formatNumber(results.filledHeight)} m</div>
              
              <div className="text-gray-500">Spațiu gol:</div>
              <div className="font-medium">{formatNumber(results.emptySpaceTons)} t</div>
              
              <div className="text-gray-500">Volum:</div>
              <div className="font-medium">{formatNumber(results.filledVolume)} m³</div>
              
              <div className="text-gray-500">G. Hectolitrică:</div>
              <div className="font-medium">{formatNumber(parameters.hectoliterWeight)} kg/hl</div>
              
              <div className="text-gray-500">Masă:</div>
              <div className="font-medium text-lg text-primary">{formatNumber(results.mass)} t</div>
            </div>
            
            <div className="mt-1 text-xs text-gray-500 flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <div>
                <div>
                  <span className="text-green-600">Ultima încărcare:</span> {formatDate(lastLoadingTime)}
                </div>
                <div>
                  <span className="text-red-600">Ultima descărcare:</span> {formatDate(lastUnloadingTime)}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 h-[120px]">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs font-medium flex items-center gap-1">
              <BarChart2 className="h-3 w-3" />
              Istoric masă
            </div>
            <div className="text-xs text-gray-500">
              Ultimele {history.length} măsurători
            </div>
          </div>
          
          {renderChart()}
        </div>
      </CardContent>
    </Card>
  );
};

export default SiloCell;
