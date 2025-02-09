import api from './api';
import { config } from 'dotenv';

config();
const port: string = process.env.PORT || '4000';

api.listen(port, () => {
    console.log(*************************\n \tPORT:${port} \n*************************);
});
