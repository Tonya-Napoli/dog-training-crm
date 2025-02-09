mport { Router, Request, Response } from 'express';
import { approveSubscriptionApplication } from '../../data/applications';
import {
    getCompanies,
    getCompany,
    addCompany,
    updateCompany
} from '../../data/users';

const router = Router();

router.get('/all', async (req: Request, res: Response) => {
    try {
        const result = await getCompanies();

        res.status(200).json({ result });
    } catch (error) {
        res.status(500).json({error})
    }
});

router.post('/update', async (req: Request, res: Response) => {
    const { body } = req;
    const emptyBody = !Boolean(Object.keys(body).length);

    if (emptyBody) return res.status(402).json({ error: 'Missing Company Data' });

    try {
        const result = await updateCompany(body)

        res.status(201).json({result});
    } catch(error) {
        res.status(500).json({ error });
    }
});

router.post('/archive', async (req, res) => {
    try {
        console.log({req, body: req.body});
        
        const result = await getCompany(req.body.companyId);
        const company =  result?.Items ? result?.Items[0] : null;

        if(company) {
            company.metadata.archived = true;
            //@ts-ignore
            const archiveResult = await updateCompany(company);

            res.status(200).json({archiveResult})
        } else {
            res.status(400).json({error: 'invalid company id', companyId: req.body.companyId})
        }
    } catch(error) {
        console.log({error})
        res.status(500).json({ error });
    }
});

export default router;


