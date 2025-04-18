
import { v4 as uuidv4 } from 'uuid';
import { Vehicle } from '@/types';

// Helper to format date to ISO string
const formatDate = (date: Date): string => date.toISOString();

// Sample vehicles
export const vehicles: Vehicle[] = [
  {
    id: uuidv4(),
    name: 'Minha Moto Principal',
    model: 'Honda CG 160',
    year: 2020,
    licensePlate: 'ABC1234',
    active: true,
    createdAt: formatDate(new Date('2023-01-01'))
  },
  {
    id: uuidv4(),
    name: 'Moto Reserva',
    model: 'Yamaha Factor 125',
    year: 2019,
    licensePlate: 'XYZ5678',
    active: false,
    createdAt: formatDate(new Date('2023-02-15'))
  }
];

// Add vehicle
export const addVehicle = (vehicle: Omit<Vehicle, 'id' | 'createdAt'>): Vehicle => {
  const newVehicle: Vehicle = {
    ...vehicle,
    id: uuidv4(),
    createdAt: formatDate(new Date())
  };
  
  vehicles.push(newVehicle);
  return newVehicle;
};
