import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data');
const LOGS_FILE = path.join(DB_PATH, 'logs.json');

// Ensure data directory exists
if (!fs.existsSync(DB_PATH)) {
  fs.mkdirSync(DB_PATH, { recursive: true });
}

// Initialize files if they don't exist
if (!fs.existsSync(LOGS_FILE)) {
  fs.writeFileSync(LOGS_FILE, JSON.stringify([], null, 2));
}

// Default admin credentials (hardcoded)
const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'admin123' // In production, this should be hashed
};

// Read data
export const readLogs = () => {
  const data = fs.readFileSync(LOGS_FILE, 'utf-8');
  return JSON.parse(data);
};

// Write data
export const writeLogs = (logs) => {
  fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2));
};

// CRUD operations for logs
export const getAllLogs = () => {
  return readLogs();
};

export const getLogById = (id) => {
  const logs = readLogs();
  return logs.find(log => log.id === parseInt(id));
};

export const createLog = (logData) => {
  const logs = readLogs();
  const newLog = {
    id: Date.now(),
    ...logData,
    createdAt: new Date().toISOString()
  };
  logs.push(newLog);
  writeLogs(logs);
  return newLog;
};

export const updateLog = (id, logData) => {
  const logs = readLogs();
  const index = logs.findIndex(log => log.id === parseInt(id));
  if (index !== -1) {
    logs[index] = { ...logs[index], ...logData, updatedAt: new Date().toISOString() };
    writeLogs(logs);
    return logs[index];
  }
  return null;
};

export const deleteLog = (id) => {
  const logs = readLogs();
  const filteredLogs = logs.filter(log => log.id !== parseInt(id));
  writeLogs(filteredLogs);
  return filteredLogs.length < logs.length;
};

// Admin authentication
export const validateAdmin = (username, password) => {
  return username === DEFAULT_ADMIN.username && password === DEFAULT_ADMIN.password;
};  