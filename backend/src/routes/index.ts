import { Router, Request, Response } from 'express';
import tokenRoutes from './tokens';
import teamRoutes from './teams';
import applicationRoutes from './applications';
import scanRoutes from './scans';
import dashboardRoutes from './dashboard';
import authRoutes from './auth';
import notificationRoutes from './notifications';
import changeRequestRoutes from './changeRequests';
import emailRoutes from './email';
import subscriptionRoutes from './subscriptions';

const router: Router = Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/tokens', tokenRoutes);
router.use('/teams', teamRoutes);
router.use('/applications', applicationRoutes);
router.use('/scans', scanRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/notifications', notificationRoutes);
router.use('/change-requests', changeRequestRoutes);
router.use('/email', emailRoutes);
router.use('/subscriptions', subscriptionRoutes);

// API Info endpoint
router.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Design Tokens Usage Tracker API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      tokens: '/api/tokens',
      teams: '/api/teams',
      applications: '/api/applications',
      scans: '/api/scans',
      dashboard: '/api/dashboard',
      notifications: '/api/notifications',
      changeRequests: '/api/change-requests',
      email: '/api/email',
      subscriptions: '/api/subscriptions'
    }
  });
});

export default router;
