
import { v4 as uuidv4 } from 'uuid';
import { User } from '@/types';

// Helper to format date to ISO string
const formatDate = (date: Date): string => date.toISOString();

// Sample users data
export let users: User[] = [
  {
    id: uuidv4(),
    email: 'admin@example.com',
    name: 'Administrador',
    createdAt: formatDate(new Date('2023-01-01')),
    isAdmin: true,
    isSubscribed: true,
    subscriptionEndDate: formatDate(new Date('2099-12-31')),
  },
  {
    id: uuidv4(),
    email: 'user@example.com',
    name: 'Usuário Comum',
    createdAt: formatDate(new Date('2023-02-15')),
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
    createdAt: formatDate(new Date()),
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
    subscriptionEndDate: endDate ? formatDate(endDate) : undefined,
  };
  
  console.log(`User subscription updated: ${users[userIndex].name} (${users[userIndex].email})`);
  console.log(`Subscription status: ${isSubscribed ? 'Active' : 'Inactive'}`);
  if (endDate) console.log(`Subscription end date: ${endDate.toISOString()}`);
  
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
  
  console.log(`User admin status updated: ${users[userIndex].name} (${users[userIndex].email})`);
  console.log(`Admin status: ${isAdmin ? 'Admin' : 'Regular user'}`);
  
  return users[userIndex];
};

// Get all users (admin function)
export const getAllUsers = (): User[] => {
  return [...users];
};

// For debugging: list all users
export const listAllUsers = (): User[] => {
  return users;
};

// Delete user (admin function)
export const deleteUser = (userId: string): boolean => {
  const initialLength = users.length;
  users = users.filter(user => user.id !== userId);
  
  const wasDeleted = users.length < initialLength;
  if (wasDeleted) {
    console.log(`User with ID ${userId} was deleted`);
    console.log(`Total users: ${users.length}`);
  } else {
    console.log(`No user found with ID ${userId}`);
  }
  
  return wasDeleted;
};
