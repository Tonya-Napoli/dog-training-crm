// api/applicationRoutes.ts
import { Router, Request, Response } from 'express';
import { 
    newSubscriptionApplication,
    approveSubscriptionApplication,
} from '../../data/applications';
import { addCompany } from '../../data/users';

const router = Router();

// Endpoint for new subscription applications
router.post('/apply', async (req: Request, res: Response) => {
    try {
        const { body } = req;
        const emptyBody = !Boolean(Object.keys(body).length);
        if (emptyBody) return res.status(422).json({ error: 'Missing Form Data' });

        const result = await newSubscriptionApplication(body);
        res.status(201).json({ result });
    } catch (error) {
        res.status(500).json({ error });
    }
});

// Endpoint to approve a subscription application and add a company
router.post('/approve', async (req: Request, res: Response) => {
    try {
        const { body } = req;
        const emptyBody = !Boolean(Object.keys(body).length);
        if (emptyBody) return res.status(402).json({ error: 'Missing Company Data' });

        const userResult = await addCompany(body);
        const applicationResult = await approveSubscriptionApplication(body.userId);

        res.status(201).json({ userResult, applicationResult });
    } catch (error) {
        res.status(500).json({ error });
    }
});

export default router;
