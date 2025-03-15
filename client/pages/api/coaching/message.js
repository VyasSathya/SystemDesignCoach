import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { messages, options } = req.body;
    
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/coaching/message`, {
      messages,
      options
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Server AI request failed:', error.message);
    res.status(500).json({ 
      message: 'Failed to process message',
      error: error.message 
    });
  }
}