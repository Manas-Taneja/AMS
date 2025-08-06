import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
  const authHeader = req.headers.authorization;

  try {
    const backendRes = await fetch(`${backendUrl}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader || '',
        'Content-Type': 'application/json',
      },
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error connecting to backend', error: (error as Error).message });
  }
} 