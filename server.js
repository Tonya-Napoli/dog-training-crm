import app from './src/serverApp.js';
import { config } from 'dotenv';

config();
const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`*************************\n \tPORT: ${port} \n*************************`);
});



