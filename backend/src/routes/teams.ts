import { Router, Request, Response } from 'express'; const router: Router = Router(); router.get('/', (req: Request, res: Response) => res.json({ success: true, data: [] })); export default router;
