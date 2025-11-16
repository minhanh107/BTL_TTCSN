const fs = require('fs').promises;
const path = require('path');

const dataDir = path.join(__dirname, '../data');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Initialize JSON files if they don't exist
async function initFiles() {
  await ensureDataDir();
  
  const usersFile = path.join(dataDir, 'users.json');
  const otpsFile = path.join(dataDir, 'otps.json');
  const sessionsFile = path.join(dataDir, 'sessions.json');

  try {
    await fs.access(usersFile);
  } catch {
    await fs.writeFile(usersFile, JSON.stringify([], null, 2));
  }

  try {
    await fs.access(otpsFile);
  } catch {
    await fs.writeFile(otpsFile, JSON.stringify([], null, 2));
  }

  try {
    await fs.access(sessionsFile);
  } catch {
    await fs.writeFile(sessionsFile, JSON.stringify([], null, 2));
  }
}

// Read users from JSON file
async function getUsers() {
  await initFiles();
  const filePath = path.join(dataDir, 'users.json');
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Write users to JSON file
async function saveUsers(users) {
  await initFiles();
  const filePath = path.join(dataDir, 'users.json');
  await fs.writeFile(filePath, JSON.stringify(users, null, 2));
}

// Add a new user
async function addUser(user) {
  const users = await getUsers();
  users.push(user);
  await saveUsers(users);
  return user;
}

// Find user by email
async function findUserByEmail(email) {
  const users = await getUsers();
  return users.find(user => user.email === email);
}

// Find user by username
async function findUserByUsername(username) {
  const users = await getUsers();
  return users.find(user => user.username === username);
}

// Find user by Google ID
async function findUserByGoogleId(googleId) {
  const users = await getUsers();
  return users.find(user => user.googleId === googleId);
}

// Update user
async function updateUser(email, updates) {
  const users = await getUsers();
  const index = users.findIndex(user => user.email === email);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    await saveUsers(users);
    return users[index];
  }
  return null;
}

// Read OTPs from JSON file
async function getOTPs() {
  await initFiles();
  const filePath = path.join(dataDir, 'otps.json');
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Write OTPs to JSON file
async function saveOTPs(otps) {
  await initFiles();
  const filePath = path.join(dataDir, 'otps.json');
  await fs.writeFile(filePath, JSON.stringify(otps, null, 2));
}

// Add a new OTP
async function addOTP(otp) {
  const otps = await getOTPs();
  otps.push(otp);
  await saveOTPs(otps);
  return otp;
}

// Find OTP by email and code
async function findOTP(email, code) {
  const otps = await getOTPs();
  return otps.find(otp => otp.email === email && otp.code === code);
}

// Delete OTP
async function deleteOTP(email, code) {
  const otps = await getOTPs();
  const filtered = otps.filter(otp => !(otp.email === email && otp.code === code));
  await saveOTPs(filtered);
}

// Clean expired OTPs
async function cleanExpiredOTPs() {
  const otps = await getOTPs();
  const now = new Date();
  const valid = otps.filter(otp => new Date(otp.expiresAt) > now);
  await saveOTPs(valid);
}

// Read sessions from JSON file
async function getSessions() {
  await initFiles();
  const filePath = path.join(dataDir, 'sessions.json');
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Write sessions to JSON file
async function saveSessions(sessions) {
  await initFiles();
  const filePath = path.join(dataDir, 'sessions.json');
  await fs.writeFile(filePath, JSON.stringify(sessions, null, 2));
}

module.exports = {
  getUsers,
  saveUsers,
  addUser,
  findUserByEmail,
  findUserByUsername,
  findUserByGoogleId,
  updateUser,
  getOTPs,
  saveOTPs,
  addOTP,
  findOTP,
  deleteOTP,
  cleanExpiredOTPs,
  getSessions,
  saveSessions
};
