// Auth System - User Login
import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { SignJWT } from 'jose';

const USERS_FILE = path.join('/tmp', 'audio-studio-users.json');
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');

async function getUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return {};
  }
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

  try {
    const users = await getUsers();
    const user = users[email];

    if (!user || user.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Reset monthly counter if new month
    const currentMonth = new Date().getMonth();
    if (user.lastResetMonth !== currentMonth) {
      user.generationsUsed = 0;
      user.lastResetMonth = currentMonth;
      users[email] = user;
      await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
    }

    // Generate JWT token
    const token = await new SignJWT({ 
      email,
      isAdmin: user.isAdmin || false
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    res.status(200).json({ 
      success: true,
      token,
      user: {
        email,
        isAdmin: user.isAdmin || false,
        generationsUsed: user.generationsUsed,
        monthlyLimit: user.monthlyLimit
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
}
