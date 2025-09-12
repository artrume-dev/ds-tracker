import { Router, Request, Response } from 'express';

const router: Router = Router();

// GET /api/tokens - Get all tokens with usage data
router.get('/', async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: [],
    message: 'Token endpoints coming soon'
  });
});

export default router;
