
import { 
  SiloParameters, 
  SiloCalculationResults, 
  ProductType,
  ProductInfo,
  TrendType,
  HistoricalDataPoint
} from './types';

export const PRODUCTS_CONFIG: { [key in ProductType]: ProductInfo } = {
  grau: { label: 'Grâu', color: '#F59E0B', density: 750, hectoliterWeight: 78 },
  porumb: { label: 'Porumb', color: '#EAB308', density: 720, hectoliterWeight: 72 },
  floareaSoarelui: { label: 'Floarea Soarelui', color: '#84CC16', density: 450, hectoliterWeight: 45 },
  orz: { label: 'Orz', color: '#A3E635', density: 600, hectoliterWeight: 63 },
  rapita: { label: 'Rapiță', color: '#06B783', density: 650, hectoliterWeight: 68 },
  mazareGalbena: { label: 'Mazăre Galbenă', color: '#22C55E', density: 840, hectoliterWeight: 80 },
};

export const getProductInfo = (product: ProductType): ProductInfo => {
  return PRODUCTS_CONFIG[product];
};

export const calculateConeVolume = (radius: number, height: number): number => {
  return (1/3) * Math.PI * Math.pow(radius, 2) * height;
};

export const calculateCylinderVolume = (radius: number, height: number): number => {
  return Math.PI * Math.pow(radius, 2) * height;
};

export const calculateConeHeight = (radius: number, angleTaluz: number): number => {
  // Convert angle from degrees to radians and calculate tangent
  return radius / Math.tan(angleTaluz * Math.PI / 180);
};

export const formatNumber = (value: number | string | undefined): string => {
  // Handle undefined or null values
  if (value === undefined || value === null) {
    return "0";
  }
  
  // Convert string to number if needed
  if (typeof value === 'string') {
    value = parseFloat(value);
    // If conversion fails, return "0"
    if (isNaN(value)) {
      return "0";
    }
  }
  
  return value.toLocaleString('ro-RO', { 
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  });
};

// Convertește volumul în tone pe baza densității
export const convertVolumeToTons = (volume: number, density: number): number => {
  return (volume * density) / 1000; // Convert kg to tons
};

// Convertește spațiul gol din metri în tone
export const convertEmptySpaceToTons = (emptySpace: number, radius: number, density: number): number => {
  // Calculam volumul gol in metri cubi
  const emptyVolume = calculateCylinderVolume(radius, emptySpace);
  // Convertim volumul in tone
  return convertVolumeToTons(emptyVolume, density);
};

// Interface for the ESP8266 API response
interface ModbusDataResponse {
  [key: string]: number;  // reg0, reg1, reg2, etc.
}

// Default ESP8266 API URL - can be updated in settings
const DEFAULT_ESP8266_API_URL = 'http://localhost:3001/api/modbusData'; // Changed to a localhost URL for dev/testing
let ESP8266_API_URL = DEFAULT_ESP8266_API_URL;

// Function to set the ESP8266 API URL
export const setESP8266ApiUrl = (url: string): void => {
  ESP8266_API_URL = url;
};

// Function to get the current ESP8266 API URL
export const getESP8266ApiUrl = (): string => {
  return ESP8266_API_URL;
};

// Reset to default URL
export const resetESP8266ApiUrl = (): void => {
  ESP8266_API_URL = DEFAULT_ESP8266_API_URL;
};

// Fetch data from ESP8266 API
export const fetchESP8266Data = async (): Promise<ModbusDataResponse | null> => {
  try {
    console.log(`Fetching data from ESP8266 at: ${ESP8266_API_URL}`);
    const response = await fetch(ESP8266_API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Add a small timeout so we don't wait forever
      signal: AbortSignal.timeout(3000)
    });
    
    if (!response.ok) {
      console.error('ESP8266 API returned an error:', response.status);
      return null;
    }
    
    const data = await response.json();
    console.log('Received ESP8266 data:', data);
    return data as ModbusDataResponse;
  } catch (error) {
    console.error('Error fetching data from ESP8266:', error);
    return null;
  }
};

// Convert ESP8266 modbus register value to empty space in meters
export const convertModbusToEmptySpace = (registerValue: number): number => {
  // The Arduino code sends values in centimeters, convert to meters
  // If value is 0 or undefined, return a default of 0
  if (!registerValue) return 0;
  return registerValue / 100;
};

// Use ESP8266 data to update silo parameters
export const updateSiloParametersFromESP = (
  cellId: number, 
  parameters: SiloParameters, 
  espData: ModbusDataResponse
): SiloParameters => {
  // Map cellId to ESP register (1-indexed for cells, 0-indexed for registers)
  // We only use registers 1-9 for the silos
  const registerIndex = (cellId - 1) % 9;
  const registerKey = `reg${registerIndex + 1}`; // Add 1 to match registers 1-9 instead of 0-8
  
  console.log(`Looking for cell ${cellId} data in register ${registerKey}`);
  
  if (registerKey in espData && espData[registerKey] !== undefined) {
    const emptySpaceValue = convertModbusToEmptySpace(espData[registerKey]);
    console.log(`Updating cell ${cellId} empty space to ${emptySpaceValue}m from ${registerKey} (value: ${espData[registerKey]})`);
    return {
      ...parameters,
      emptySpace: emptySpaceValue
    };
  }
  
  // If no data available or register value is 0, return empty space as 0 (full silo)
  console.log(`No data found for cell ${cellId} in register ${registerKey}, setting as full`);
  return {
    ...parameters,
    emptySpace: 0
  };
};

// Simulate small changes in empty space for real-time updates
// Used as fallback when ESP data is not available
export const simulateEmptySpaceChange = (currentEmptySpace: number): number => {
  // Random fluctuation between -0.1 and +0.1 meters
  const change = (Math.random() - 0.5) * 0.2;
  // Ensure empty space doesn't go negative or change too drastically
  return Math.max(0, currentEmptySpace + change);
};

export const calculateSiloParameters = (parameters: SiloParameters, prevHistory: HistoricalDataPoint[]): SiloCalculationResults => {
  const { radius, heightCylinder, angleTaluz, product, emptySpace } = parameters;

  const productData = getProductInfo(product);
  const density = productData.density;

  // Calculate cone height based on radius and angle - fixed to use 6.5m as specified
  const heightCone = 6.5; // Fixed cone height at 6.5 meters as specified
  
  // Total height is cylinder + cone (fixed at 16.40 + 6.5 = 22.9 meters)
  const totalHeight = heightCylinder + heightCone;

  // Calculate volumes
  const cylinderVolume = calculateCylinderVolume(radius, heightCylinder);
  const coneVolume = calculateConeVolume(radius, heightCone);
  const totalVolume = cylinderVolume + coneVolume;

  // Calculate filled heights with proper boundary checks
  const filledCylinderHeight = Math.max(0, Math.min(heightCylinder, heightCylinder - emptySpace));
  const filledCylinderVolume = calculateCylinderVolume(radius, filledCylinderHeight);

  // Calculate how much of the cone is filled (if any)
  let filledConeVolume = 0;
  if (emptySpace < heightCylinder) {
    // Cylinder is partially or completely filled
    filledConeVolume = emptySpace <= 0 ? coneVolume : 0;
  } else {
    // Cylinder is empty, check if cone is partially filled
    const remainingEmptySpace = emptySpace - heightCylinder; 
    const effectiveConeHeight = Math.max(0, heightCone - remainingEmptySpace);
    filledConeVolume = calculateConeVolume(radius, effectiveConeHeight);
  }

  // Total filled volume and mass calculations
  const filledVolume = filledCylinderVolume + filledConeVolume;
  const filledHeight = Math.min(totalHeight, totalHeight - emptySpace);
  const mass = (filledVolume * density) / 1000; // Convert to tonnes
  const totalCapacity = (totalVolume * density) / 1000; // Total capacity in tonnes
  const fillPercent = (filledVolume / totalVolume) * 100;
  
  // Calculate empty space in tons
  const emptyVolume = calculateCylinderVolume(radius, emptySpace);
  const emptySpaceTons = (emptyVolume * density) / 1000;

  // Calculate trend based on previous history if available
  let trend: TrendType = 'stable';
  let levelChange = 0;
  
  if (prevHistory.length > 0) {
    const currentLevel = filledHeight;
    const prevLevel = prevHistory[prevHistory.length - 1].level;
    levelChange = currentLevel - prevLevel;
    
    if (Math.abs(levelChange) > 0.05) { // threshold to avoid minor fluctuations
      trend = levelChange > 0 ? 'loading' : 'unloading';
    }
  }

  return {
    filledVolume,
    totalVolume,
    mass,
    totalCapacity,
    fillPercent,
    heightCone,
    totalHeight,
    trend,
    levelChange,
    emptySpaceTons,
    filledHeight
  };
};

// For compatibility with existing code
export const calculateVolumeAndMass = calculateSiloParameters;
