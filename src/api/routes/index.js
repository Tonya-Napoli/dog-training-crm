// api/index.ts
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

// Import your route modules
import CompanyRoutes from './companyRoutes';
import SendgridRoutes from './sendgridRoutes';
import ClientRoutes from './clientRoutes';
import MemberRoutes from './memberRoutes';
import UserRoutes from './userRoutes';
import ManagerRoutes from './managerRoutes';
import CreditRoutes from './creditRoutes';
import StripeRoutes from './stripeRoutes';
import ReferralRoutes from './referralRoutes';
import SupportTicketRoutes from './supportTicketRoutes';
import SubscriberRoutes from './subscriberRoutes';
import NotificationRoutes from './notificationRoutes';
import MessengerRoutes from './messengerRoutes';

const app = express();

// Middleware configuration
app.use(bodyParser.json());
app.use(cors());

// Mount individual route modules on designated paths
app.use('/companies', CompanyRoutes);
app.use('/mail', SendgridRoutes);
app.use('/clients', ClientRoutes);
app.use('/members', MemberRoutes);
app.use('/users', UserRoutes);
app.use('/managers', ManagerRoutes);
app.use('/credit', CreditRoutes);
app.use('/payment', StripeRoutes);
app.use('/referral-accounts', ReferralRoutes);
app.use('/tickets', SupportTicketRoutes);
app.use('/subscribers', SubscriberRoutes);
app.use('/notifications', NotificationRoutes);
app.use('/messenger', MessengerRoutes);

// Optional: a default route for the API root
app.get('/', (req, res) => {
  res.send('Welcome to the Dog Training CRM API');
});

export default app;


