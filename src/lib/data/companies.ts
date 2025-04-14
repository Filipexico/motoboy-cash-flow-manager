
import { v4 as uuidv4 } from 'uuid';
import { Company } from '@/types';

// Sample companies
export const companies: Company[] = [
  {
    id: uuidv4(),
    name: 'iFood',
    logoUrl: 'https://placeholder.com/150x150',
    active: true,
    createdAt: new Date('2023-01-01')
  },
  {
    id: uuidv4(),
    name: 'Uber Eats',
    logoUrl: 'https://placeholder.com/150x150',
    active: true,
    createdAt: new Date('2023-01-05')
  },
  {
    id: uuidv4(),
    name: 'Rappi',
    logoUrl: 'https://placeholder.com/150x150',
    active: true,
    createdAt: new Date('2023-01-10')
  },
  {
    id: uuidv4(),
    name: '99 Food',
    logoUrl: 'https://placeholder.com/150x150',
    active: false,
    createdAt: new Date('2023-02-15')
  }
];

// Add a company
export const addCompany = (company: Omit<Company, 'id' | 'createdAt'>): Company => {
  const newCompany: Company = {
    ...company,
    id: uuidv4(),
    createdAt: new Date()
  };
  
  companies.push(newCompany);
  return newCompany;
};
