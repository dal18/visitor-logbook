import { validateAdmin } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Validate against default admin credentials
    const isValid = validateAdmin(username, password);

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Return success
    return res.status(200).json({
      message: 'Login successful',
      admin: {
        username: username
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}