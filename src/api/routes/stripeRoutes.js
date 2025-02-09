import { Router, Request, Response } from 'express';
import {
  addPaymentMethod,
  createCustomer,
  fetchCatalogue,
  fetchCustomerSubscriptions,
  getCustomerInformation,
  getCustomerList,
  processPayment,
  processSingleTimePayment,
  setupIntent,
  stripeConnection
} from '../../data/stripe';

const router = Router();

// Create a new customer
router.post('/create-customer', async (req: Request, res: Response) => {
  try {
    const result = await createCustomer(req.body);
    res.status(202).json(result);
  } catch (error) {
    res.status(500).json({ error });
  }
});

// Retrieve customer information
router.post('/retrieve-customer', async (req: Request, res: Response) => {
  try {
    const result = await getCustomerInformation(req.body.customerId);
    console.log(result);
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

// Retrieve customer list
router.post('/retrieve-customer-list', async (req: Request, res: Response) => {
  try {
    const result = await getCustomerList();
    console.log(result);
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

// Add a payment method for a customer
router.post('/add-payment-method', async (req: Request, res: Response) => {
  try {
    const result = await addPaymentMethod(req.body);
    res.status(200).send({ result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

// Create a setup intent
router.post('/setup-intent', async (req: Request, res: Response) => {
  try {
    const { stripeId } = req.body;
    console.log(stripeId);
    const result = await setupIntent(stripeId);
    res.status(202).json({ result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

// Create a payment intent (for recurring payments)
router.post('/create-payment-intent', async (req: Request, res: Response) => {
  const { customerId, paymentMethodId, amount } = req.body;
  try {
    const paymentIntent = await stripeConnection.paymentIntents.create({
      customer: customerId,
      payment_method: paymentMethodId,
      amount, // amount in cents
      currency: 'usd',
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      }
    });
    res.json({ result: { client_secret: paymentIntent.client_secret } });
  } catch (error: any) {
    res.status(500).json({ error: error?.message });
  }
});

// Add a subscriber (creates a subscription)
router.post('/add-subscriber', async (req: Request, res: Response) => {
  const payload = req.body;
  try {
    const subscriptions = await stripeConnection.subscriptions.create(payload);
    res.json({ result: { subscriptions } });
  } catch (error: any) {
    res.status(500).json({ error: error?.message });
  }
});

// Process a payment (endpoint stub)
router.post('/process-payment', async (req: Request, res: Response) => {
  try {
    // Your logic for processing payment would go here.
    res.status(202).json("result");
  } catch (error) {
    res.status(500).json({ error });
  }
});

// Invoices endpoint stub
router.post('/invoices', async (req: Request, res: Response) => {
  try {
    res.status(202).json("result");
  } catch (error) {
    res.status(500).json({ error });
  }
});

// Single invoice endpoint stub
router.post('/single-invoice', async (req: Request, res: Response) => {
  try {
    res.status(202).json("result");
  } catch (error) {
    res.status(500).json({ error });
  }
});

// List payment methods for a customer
router.post('/payment-methods', async (req: Request, res: Response) => {
  const { customerId } = req.body;
  try {
    const paymentMethods = await stripeConnection.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
    res.status(200).json({ paymentMethods });
  } catch (error) {
    res.status(500).json({ error });
  }
});

// Charge a customer (recurring subscription payment)
router.post('/charge-customer', async (req: Request, res: Response) => {
  const { customerId, paymentMethodId, productId, discountCode } = req.body;
  if (!customerId || !paymentMethodId || !productId)
    return res.status(400).json({ error: 'Missing Data', data: { customerId, paymentMethodId, productId } });
  try {
    const result = await processPayment(customerId, paymentMethodId, productId, discountCode);
    res.status(201).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

// Process a single charge (one-time payment)
router.post('/single-charge', async (req: Request, res: Response) => {
  const { customerId, paymentMethodId, amount } = req.body;
  if (!customerId || !paymentMethodId || !amount)
    return res.status(400).json({ error: 'Missing Data', data: { customerId, paymentMethodId, amount } });
  try {
    const result = await processSingleTimePayment(customerId, paymentMethodId, amount);
    res.status(201).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

// Fetch the product catalogue
router.post('/product-catalogue', async (req: Request, res: Response) => {
  try {
    const result = await fetchCatalogue();
    res.status(201).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

// Fetch customer subscriptions
router.post('/customer-subscriptions', async (req: Request, res: Response) => {
  const { customerId } = req.body;
  try {
    if (!customerId)
      return res.status(402).json({ error: 'Missing Customer Data' });
    const result = await fetchCustomerSubscriptions(customerId);
    res.status(201).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

export default router;
