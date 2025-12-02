import { getLogById, updateLog, deleteLog } from '../../../lib/db';

export default function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const log = getLogById(id);
      if (!log) {
        return res.status(404).json({ message: 'Log not found' });
      }
      return res.status(200).json(log);
    } catch (error) {
      console.error('Error fetching log:', error);
      return res.status(500).json({ message: 'Error fetching log' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { name, address, date, gender, age, organization, purpose } = req.body;

      const updatedLog = updateLog(id, {
        name,
        address,
        date,
        gender,
        age: parseInt(age),
        organization,
        purpose
      });

      if (!updatedLog) {
        return res.status(404).json({ message: 'Log not found' });
      }

      return res.status(200).json(updatedLog);
    } catch (error) {
      console.error('Error updating log:', error);
      return res.status(500).json({ message: 'Error updating log' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const success = deleteLog(id);
      if (!success) {
        return res.status(404).json({ message: 'Log not found' });
      }
      return res.status(200).json({ message: 'Log deleted successfully' });
    } catch (error) {
      console.error('Error deleting log:', error);
      return res.status(500).json({ message: 'Error deleting log' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}