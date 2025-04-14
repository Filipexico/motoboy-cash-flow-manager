
import { v4 as uuidv4 } from 'uuid';
import { Refueling } from '@/types';
import { vehicles } from './vehicles';

// Generate sample refuelings for the last 4 weeks
const generateSampleRefuelings = (): Refueling[] => {
  const refuelings: Refueling[] = [];
  const now = new Date();
  let lastOdometer = 25000; // Starting odometer for the first vehicle
  
  for (let weekOffset = 0; weekOffset < 4; weekOffset++) {
    const date = new Date(now);
    date.setDate(now.getDate() - (weekOffset * 7));
    
    const odometerEnd = lastOdometer + Math.floor(Math.random() * 300) + 200; // 200-500 km per week
    const liters = Math.floor(Math.random() * 10) + 10; // 10-20 liters
    const pricePerLiter = 4.5 + (Math.random() * 1); // Between 4.5 and 5.5 per liter
    
    refuelings.push({
      id: uuidv4(),
      vehicleId: vehicles[0].id, // Main vehicle
      date,
      odometerStart: lastOdometer,
      odometerEnd,
      liters,
      pricePerLiter,
      totalCost: liters * pricePerLiter,
      createdAt: date
    });
    
    lastOdometer = odometerEnd;
  }
  
  return refuelings;
};

// Create the sample data
export const refuelings = generateSampleRefuelings();

// Add refueling
export const addRefueling = (refueling: Omit<Refueling, 'id' | 'createdAt' | 'totalCost'>): Refueling => {
  const totalCost = refueling.liters * refueling.pricePerLiter;
  
  const newRefueling: Refueling = {
    ...refueling,
    id: uuidv4(),
    totalCost,
    createdAt: new Date()
  };
  
  refuelings.push(newRefueling);
  return newRefueling;
};
