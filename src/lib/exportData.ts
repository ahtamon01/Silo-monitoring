
import { SiloCellData } from './types';
import { formatNumber } from './siloCalculations';

/**
 * Exportă datele istorice pentru o celulă în format CSV
 */
export const exportCellHistory = (cell: SiloCellData) => {
  const { id, parameters, history } = cell;
  
  // Verificăm dacă există date istorice
  if (history.length === 0) {
    return alert('Nu există date istorice pentru export.');
  }

  // Creăm antetul CSV
  const csvHeader = 'Data,Ora,Masă (tone),Nivel (metri),Spațiu gol (metri),Produs\n';
  
  // Creăm rândurile cu date
  const csvRows = history.map(point => {
    const date = new Date(point.timestamp);
    const dateStr = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
    const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    
    return `${dateStr},${timeStr},${formatNumber(point.mass)},${formatNumber(point.level)},${formatNumber(parameters.emptySpace)},${parameters.product}`;
  }).join('\n');
  
  // Combinăm antetul și rândurile
  const csvContent = `data:text/csv;charset=utf-8,${csvHeader}${csvRows}`;
  
  // Creăm un element <a> pentru a descărca fișierul
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  
  // Numele fișierului va conține ID-ul celulei și data curentă
  const currentDate = new Date();
  const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
  link.setAttribute('download', `istoric_celula_${id}_${dateStr}.csv`);
  
  // Simulăm un click pentru a declanșa descărcarea
  document.body.appendChild(link);
  link.click();
  
  // Curățăm DOM-ul
  document.body.removeChild(link);
};

/**
 * Exportă datele istorice pentru toate celulele în format CSV
 */
export const exportAllCellsHistory = (cells: SiloCellData[]) => {
  // Verificăm dacă există date istorice
  if (cells.length === 0 || cells.every(cell => cell.history.length === 0)) {
    return alert('Nu există date istorice pentru export.');
  }

  // Creăm antetul CSV
  const csvHeader = 'Celula,Data,Ora,Masă (tone),Nivel (metri),Spațiu gol (metri),Produs\n';
  
  // Creăm rândurile cu date pentru toate celulele
  const csvRows = cells.flatMap(cell => {
    return cell.history.map(point => {
      const date = new Date(point.timestamp);
      const dateStr = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
      const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
      
      return `${cell.id},${dateStr},${timeStr},${formatNumber(point.mass)},${formatNumber(point.level)},${formatNumber(cell.parameters.emptySpace)},${cell.parameters.product}`;
    });
  }).join('\n');
  
  // Combinăm antetul și rândurile
  const csvContent = `data:text/csv;charset=utf-8,${csvHeader}${csvRows}`;
  
  // Creăm un element <a> pentru a descărca fișierul
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  
  // Numele fișierului va conține data curentă
  const currentDate = new Date();
  const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
  link.setAttribute('download', `istoric_toate_celulele_${dateStr}.csv`);
  
  // Simulăm un click pentru a declanșa descărcarea
  document.body.appendChild(link);
  link.click();
  
  // Curățăm DOM-ul
  document.body.removeChild(link);
};
