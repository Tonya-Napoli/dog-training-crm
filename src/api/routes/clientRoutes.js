// api/clientRoutes.ts
import { Router, Request, Response } from 'express';
import { addClient, getAllClients, getClient, getMemberClients, getCompanyClients, updateClient } from '../../data/users';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.post('/add', async (req: Request, res: Response) => {
  try {
    const { body } = req;
    const emptyBody = !Boolean(Object.keys(body).length);
    
    if (emptyBody) return res.status(402).json({ error: 'Missing Client Data' });
    if (!body?.userId || !body?.userId?.length) body.userId = uuidv4();
    
    const result = await addClient(body);
    res.status(201).json({ result });
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.get('/company/:companyId', async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    if (!companyId) return res.status(402).json({ error: 'Missing Company ID' });
    const result = await getCompanyClients(companyId);
    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ error });
  }
});

// ... add the rest of your routes similarly

export default router;

