// api/messengerRoutes.ts
import { Router, Request, Response } from 'express';
import { StreamChat } from 'stream-chat';
import { streamAccessKey, streamSecretKey } from '../../constants';

const api_key = streamAccessKey || "";
const api_secret = streamSecretKey || "";

const router = Router();

router.get('/token/:user_id', async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    console.log({ user_id, api_key, api_secret });
    const serverClient = StreamChat.getInstance(api_key, api_secret);
    console.log({ serverClient });
    const token = serverClient.createToken(user_id);
    console.log({ token });
    res.status(200).json({ token });
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error });
  }
});

export default router;
