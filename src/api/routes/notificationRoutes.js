import { Router, Request, Response } from 'express';
import { addNotification, getUserNotifications } from '../../data/notifications';

const router = Router();

router.post('/add', async (req: Request, res: Response) => {
    try {
        const { body } = req;
        const emptyBody = !Boolean(Object.keys(body).length);
        
        if (emptyBody) return res.status(402).json({ error: 'Missing Notification Data' });
        
        const result = await addNotification(body);

        res.status(201).json({ result });
    } catch (error) {
        res.status(500).json({ error });
    }
});

router.get('/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        if (!userId) return res.status(402).json({ error: 'Missing User ID' });

        const result = await getUserNotifications(userId);

        res.status(200).json({ result });
    } catch (error) {
        throw error;
    }
});

export default router;
