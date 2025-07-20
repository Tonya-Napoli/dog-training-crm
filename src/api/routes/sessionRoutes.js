import express from 'express';
//import auth, {adminAuth} from '../middleware/adminAuth.js';

const router = express.Router();

//WIP  expand these later
router.get('/', (req, res) => {
  res.json({ message: 'Sessions endpoint' });
});

export default router;