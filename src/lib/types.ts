
export type ProductType = 'grau' | 'porumb' | 'floareaSoarelui' | 'orz' | 'rapita' | 'mazareGalbena';

export type ProductInfo = {
  label: string;
  color: string;
  density: number; // kg/m³
  hectoliterWeight: number; // kg/hl
};

export type TrendType = 'stable' | 'loading' | 'unloading';

export type LocationType = 'Baza1' | 'Baza2' | 'Baza3' | 'Extern';

export type ChartType = 'line' | 'bar' | 'area';

export type QualityLevel = 'Premium' | 'Standard' | 'Basic';

export interface SiloParameters {
  radius: number; // metri
  heightCylinder: number; // metri
  angleTaluz: number; // grade
  product: ProductType;
  weight: number; // kg/m³
  hectoliterWeight: number; // kg/hl
  emptySpace: number; // metri
  location: LocationType;
  quality: QualityLevel;
}

export interface SiloCalculationResults {
  filledVolume: number; // m³
  totalVolume: number; // m³
  mass: number; // tone
  totalCapacity: number; // tone
  fillPercent: number; // %
  heightCone: number; // metri
  totalHeight: number; // metri - should be heightCylinder + heightCone
  trend: TrendType;
  levelChange: number; // schimbare în nivel (metri)
  emptySpaceTons: number; // spațiu gol în tone
  filledHeight: number; // înălțimea umplută (metri)
}

export interface HistoricalDataPoint {
  timestamp: Date;
  mass: number;
  level: number; // adăugam nivelul în metri
}

export interface SiloCellData {
  id: number;
  parameters: SiloParameters;
  results: SiloCalculationResults;
  history: HistoricalDataPoint[];
  lastLoadingTime?: Date;
  lastUnloadingTime?: Date;
  chartType: ChartType;
}

export interface AppSettings {
  displayMode: 'all' | 'location';
  selectedLocation?: LocationType;
  defaultChartType: ChartType;
  cellCount: number;
  espApiUrl?: string;
}
