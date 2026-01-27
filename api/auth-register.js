// Auth System - User Registration
// Simple JSON-based user storage (for MVP - can be upgraded to DB later)

import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

const USERS_FILE = path.join('/tmp', 'audio-studio-users.json');
const ADMIN_EMAILS = ['micha@mcgv.de', 'admin@mcgv.de']; // Unlimited access

async function getUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { email, password } = req.body || {};
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Password strength
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const users = await getUsers();
    
    // Check if user already exists
    if (users[email]) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Create new user
    const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
    users[email] = {
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
      isAdmin,
      generationsUsed: 0,
      monthlyLimit: isAdmin ? -1 : 5, // -1 = unlimited for admins
      lastResetMonth: new Date().getMonth()
    };

    await saveUsers(users);

    res.status(201).json({ 
      success: true, 
      message: 'Registration successful',
      isAdmin
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
}
