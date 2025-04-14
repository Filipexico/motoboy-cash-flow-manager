
import { v4 as uuidv4 } from 'uuid';
import { User } from '@/types';

// Sample users data
export let users: User[] = [
  {
    id: uuidv4(),
    email: 'admin@example.com',
    name: 'Administrador',
    createdAt: new Date('2023-01-01'),
    isAdmin: true,
    isSubscribed: true,
    subscriptionEndDate: new Date('2099-12-31'),
  },
  {
    id: uuidv4(),
    email: 'user@example.com',
    name: 'Usuário Comum',
    createdAt: new Date('2023-02-15'),
    isAdmin: false,
    isSubscribed: false,
  },
];

// Find user by email
export const findUserByEmail = (email: string): User | undefined => {
  return users.find(user => user.email === email);
};

// Create new user
export const createUser = (email: string, name: string): User => {
  const newUser: User = {
    id: uuidv4(),
    email,
    name,
    createdAt: new Date(),
    isAdmin: false,
    isSubscribed: false,
  };
  
  users.push(newUser);
  console.log(`User created: ${name} (${email})`);
  console.log(`Total users: ${users.length}`);
  return newUser;
};

// Update user subscription
export const updateUserSubscription = (userId: string, isSubscribed: boolean, endDate?: Date): User | null => {
  const userIndex = users.findIndex(user => user.id === userId);
  if (userIndex === -1) return null;
  
  users[userIndex] = {
    ...users[userIndex],
    isSubscribed,
    subscriptionEndDate: endDate,
  };
  
  return users[userIndex];
};

// Make user admin
export const makeUserAdmin = (userId: string, isAdmin: boolean): User | null => {
  const userIndex = users.findIndex(user => user.id === userId);
  if (userIndex === -1) return null;
  
  users[userIndex] = {
    ...users[userIndex],
    isAdmin,
  };
  
  return users[userIndex];
};

// For debugging: list all users
export const listAllUsers = (): User[] => {
  return users;
};
