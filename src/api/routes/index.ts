import { Router } from 'express';
import manualAccountRoutes from './manualAccountRoutes';

const router = Router();

router.use('/manual-accounts', manualAccountRoutes);

export default router; 