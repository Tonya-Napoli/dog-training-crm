import api from './src/api';
import { config } from 'dotenv';

config();
const port = process.env.PORT || 4000;

api.listen(port, () => {
    console.log(`*************************\n \tPORT: ${port} \n*************************`);
});


