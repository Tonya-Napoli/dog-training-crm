//import express from 'express';
import { config } from 'dotenv';
import api from './src/api/routes/index';

config();
const port = process.env.PORT || 4000; 

api.listen(port, () => {
    console.log(`************************* \n \tPORT: ${port} \n *************************`);
});

