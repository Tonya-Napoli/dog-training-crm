import { Router, Request, Response } from 'express';
import { getUserData } from '../../data/users';

const router = Router();

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const data = await getUserData(req.params.id);
        res.status(200).json({ data });
    } catch (error) {
        return res.status(500).json({ error });
    }
});

export default router;
