import { createRouter } from 'next-connect';

const router = createRouter();

router
  .get(async (req, res) => {
    try {
      res.status(200).json({ message: 'Coaching API endpoint' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
  .post(async (req, res) => {
    try {
      // Handle POST /api/coaching
      res.status(200).json({ message: 'Success' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Export the handler
export default router.handler();
