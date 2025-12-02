import { getAllLogs, createLog } from '../../../lib/db';

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const logs = getAllLogs();
      return res.status(200).json(logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
      return res.status(500).json({ message: 'Error fetching logs' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, address, date, gender, age, organization, purpose, signature } = req.body;

      if (!name || !address || !date || !gender || !age || !purpose || !signature) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      const newLog = createLog({
        name,
        address,
        date,
        gender,
        age: parseInt(age),
        organization: organization || 'N/A',
        purpose,
        signature
      });

      return res.status(201).json(newLog);
    } catch (error) {
      console.error('Error creating log:', error);
      return res.status(500).json({ message: 'Error creating log' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}