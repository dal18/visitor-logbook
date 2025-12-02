import { findAdminByUsername, createAdmin } from '../../../lib/db';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if username already exists
    const existingAdmin = findAdminByUsername(username);
    if (existingAdmin) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const newAdmin = createAdmin({
      username,
      password: hashedPassword
    });

    return res.status(201).json({
      message: 'Admin registered successfully',
      admin: {
        id: newAdmin.id,
        username: newAdmin.username
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}