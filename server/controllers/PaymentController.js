const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../db');
const logger = require('../utils/logger');

/**
 * Create a payment intent
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'usd', metadata = {} } = req.body;
    
    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }
    
    // Add user_id to metadata for reference
    const paymentMetadata = {
      ...metadata,
      user_id: req.user.id,
    };
    
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: paymentMetadata,
      automatic_payment_methods: { enabled: true },
    });
    
    // Log the payment intent creation
    logger.info(`Payment intent created for user ${req.user.id}`, { 
      amount, 
      currency, 
      payment_intent_id: paymentIntent.id 
    });
    
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
    });
  } catch (error) {
    logger.error('Error creating payment intent', { error: error.message, user_id: req.user?.id });
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get Stripe customer ID for a user, creating one if needed
 * @param {number} userId - User ID
 * @returns {Promise<string>} Stripe customer ID
 */
const getOrCreateCustomerId = async (userId) => {
  try {
    // Check if user already has a Stripe customer ID
    const query = 'SELECT stripe_customer_id FROM user_profiles WHERE id = $1';
    const result = await db.query(query, [userId]);
    
    if (result.rows[0] && result.rows[0].stripe_customer_id) {
      return result.rows[0].stripe_customer_id;
    }
    
    // Get user details to create Stripe customer
    const userQuery = 'SELECT email, first_name, last_name FROM user_profiles WHERE id = $1';
    const userResult = await db.query(userQuery, [userId]);
    
    if (!userResult.rows[0]) {
      throw new Error('User not found');
    }
    
    const { email, first_name, last_name } = userResult.rows[0];
    
    // Create a new customer in Stripe
    const customer = await stripe.customers.create({
      email,
      name: `${first_name} ${last_name}`,
      metadata: { user_id: userId },
    });
    
    // Save the Stripe customer ID to our database
    const updateQuery = 'UPDATE user_profiles SET stripe_customer_id = $1 WHERE id = $2 RETURNING stripe_customer_id';
    const updateResult = await db.query(updateQuery, [customer.id, userId]);
    
    logger.info(`Created Stripe customer for user ${userId}`, { customer_id: customer.id });
    
    return updateResult.rows[0].stripe_customer_id;
  } catch (error) {
    logger.error('Error getting or creating Stripe customer', { 
      error: error.message, 
      user_id: userId 
    });
    throw error;
  }
};

/**
 * Create a subscription
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createSubscription = async (req, res) => {
  try {
    const { priceId, paymentMethodId } = req.body;
    
    if (!priceId) {
      return res.status(400).json({ message: 'Price ID is required' });
    }
    
    const userId = req.user.id;
    const customerId = await getOrCreateCustomerId(userId);
    
    // If payment method provided, attach it to the customer
    if (paymentMethodId) {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
      
      // Set as default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }
    
    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      expand: ['latest_invoice.payment_intent'],
    });
    
    // Store subscription info in our database
    const insertQuery = `
      INSERT INTO user_subscriptions (
        user_id, stripe_subscription_id, subscription_status, 
        plan_id, current_period_start, current_period_end
      )
      VALUES ($1, $2, $3, $4, to_timestamp($5), to_timestamp($6))
      ON CONFLICT (user_id) 
      DO UPDATE SET
        stripe_subscription_id = EXCLUDED.stripe_subscription_id,
        subscription_status = EXCLUDED.subscription_status,
        plan_id = EXCLUDED.plan_id,
        current_period_start = EXCLUDED.current_period_start,
        current_period_end = EXCLUDED.current_period_end
      RETURNING id
    `;
    
    await db.query(insertQuery, [
      userId,
      subscription.id,
      subscription.status,
      priceId,
      subscription.current_period_start,
      subscription.current_period_end
    ]);
    
    logger.info(`Subscription created for user ${userId}`, { 
      subscription_id: subscription.id, 
      status: subscription.status 
    });
    
    res.status(200).json({
      subscriptionId: subscription.id,
      status: subscription.status,
      clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
    });
  } catch (error) {
    logger.error('Error creating subscription', { 
      error: error.message, 
      user_id: req.user?.id 
    });
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get customer payment methods
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPaymentMethods = async (req, res) => {
  try {
    const userId = req.user.id;
    const customerId = await getOrCreateCustomerId(userId);
    
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
    
    res.status(200).json(paymentMethods.data);
  } catch (error) {
    logger.error('Error fetching payment methods', { 
      error: error.message, 
      user_id: req.user?.id 
    });
    res.status(500).json({ message: error.message });
  }
};

/**
 * Add a payment method
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.addPaymentMethod = async (req, res) => {
  try {
    const { paymentMethodId } = req.body;
    
    if (!paymentMethodId) {
      return res.status(400).json({ message: 'Payment method ID is required' });
    }
    
    const userId = req.user.id;
    const customerId = await getOrCreateCustomerId(userId);
    
    // Attach the payment method to the customer
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
    
    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    
    logger.info(`Payment method added for user ${userId}`, { 
      payment_method_id: paymentMethodId 
    });
    
    res.status(200).json(paymentMethod);
  } catch (error) {
    logger.error('Error adding payment method', { 
      error: error.message, 
      user_id: req.user?.id 
    });
    res.status(500).json({ message: error.message });
  }
};

/**
 * Remove a payment method
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.removePaymentMethod = async (req, res) => {
  try {
    const { paymentMethodId } = req.params;
    
    if (!paymentMethodId) {
      return res.status(400).json({ message: 'Payment method ID is required' });
    }
    
    // Detach the payment method from the customer
    await stripe.paymentMethods.detach(paymentMethodId);
    
    logger.info(`Payment method removed`, { 
      payment_method_id: paymentMethodId,
      user_id: req.user.id 
    });
    
    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Error removing payment method', { 
      error: error.message, 
      user_id: req.user?.id 
    });
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get subscription details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getSubscriptionDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's subscription from our database
    const query = `
      SELECT 
        us.stripe_subscription_id, us.subscription_status, us.plan_id,
        us.current_period_start, us.current_period_end,
        p.name as plan_name, p.price, p.currency, p.billing_interval
      FROM user_subscriptions us
      LEFT JOIN subscription_plans p ON us.plan_id = p.stripe_price_id
      WHERE us.user_id = $1
    `;
    
    const result = await db.query(query, [userId]);
    
    if (!result.rows[0] || !result.rows[0].stripe_subscription_id) {
      return res.status(200).json({ active: false });
    }
    
    const subscriptionId = result.rows[0].stripe_subscription_id;
    
    // Get the latest data from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // If subscription status changed, update our database
    if (subscription.status !== result.rows[0].subscription_status) {
      const updateQuery = `
        UPDATE user_subscriptions 
        SET subscription_status = $1
        WHERE user_id = $2
      `;
      
      await db.query(updateQuery, [subscription.status, userId]);
    }
    
    const subscriptionDetails = {
      id: subscriptionId,
      status: subscription.status,
      active: subscription.status === 'active',
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      planDetails: {
        id: result.rows[0].plan_id,
        name: result.rows[0].plan_name,
        price: result.rows[0].price,
        currency: result.rows[0].currency,
        interval: result.rows[0].billing_interval
      }
    };
    
    res.status(200).json(subscriptionDetails);
  } catch (error) {
    logger.error('Error fetching subscription details', { 
      error: error.message, 
      user_id: req.user?.id 
    });
    res.status(500).json({ message: error.message });
  }
};

/**
 * Cancel subscription
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's subscription from our database
    const query = 'SELECT stripe_subscription_id FROM user_subscriptions WHERE user_id = $1';
    const result = await db.query(query, [userId]);
    
    if (!result.rows[0] || !result.rows[0].stripe_subscription_id) {
      return res.status(404).json({ message: 'No active subscription found' });
    }
    
    const subscriptionId = result.rows[0].stripe_subscription_id;
    
    // Cancel the subscription at the end of the billing period
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
    
    logger.info(`Subscription cancelled for user ${userId}`, { 
      subscription_id: subscriptionId
    });
    
    res.status(200).json({
      canceled: true,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    });
  } catch (error) {
    logger.error('Error cancelling subscription', { 
      error: error.message, 
      user_id: req.user?.id 
    });
    res.status(500).json({ message: error.message });
  }
};

/**
 * Webhook handler for Stripe events
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  let event;
  
  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.rawBody, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    logger.error('Webhook signature verification failed', { error: err.message });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle the event
  switch (event.type) {
    case 'invoice.payment_succeeded':
      await handleInvoicePaymentSucceeded(event.data.object);
      break;
    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;
    default:
      logger.info(`Unhandled Stripe event type: ${event.type}`);
  }
  
  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({ received: true });
};

/**
 * Handle invoice payment succeeded event
 * @param {Object} invoice - Stripe invoice object
 */
async function handleInvoicePaymentSucceeded(invoice) {
  try {
    if (invoice.subscription) {
      // Update subscription status if this is a subscription invoice
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
      
      const updateQuery = `
        UPDATE user_subscriptions 
        SET 
          subscription_status = $1,
          current_period_start = to_timestamp($2),
          current_period_end = to_timestamp($3)
        WHERE stripe_subscription_id = $4
      `;
      
      await db.query(updateQuery, [
        subscription.status,
        subscription.current_period_start,
        subscription.current_period_end,
        subscription.id
      ]);
      
      logger.info('Subscription payment succeeded', { 
        subscription_id: subscription.id,
        customer_id: invoice.customer
      });
    }
  } catch (error) {
    logger.error('Error handling invoice payment succeeded', { 
      error: error.message, 
      invoice_id: invoice.id 
    });
  }
}

/**
 * Handle invoice payment failed event
 * @param {Object} invoice - Stripe invoice object
 */
async function handleInvoicePaymentFailed(invoice) {
  try {
    if (invoice.subscription) {
      // Update subscription status if this is a subscription invoice
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
      
      const updateQuery = `
        UPDATE user_subscriptions 
        SET subscription_status = $1
        WHERE stripe_subscription_id = $2
      `;
      
      await db.query(updateQuery, [subscription.status, subscription.id]);
      
      // Get user info for notification
      const userQuery = `
        SELECT up.id, up.email, up.first_name
        FROM user_subscriptions us
        JOIN user_profiles up ON us.user_id = up.id
        WHERE us.stripe_subscription_id = $1
      `;
      
      const result = await db.query(userQuery, [subscription.id]);
      
      if (result.rows[0]) {
        // Send payment failure notification (implement notification service)
        logger.info('Should send payment failure notification', {
          user_id: result.rows[0].id,
          email: result.rows[0].email
        });
      }
      
      logger.info('Subscription payment failed', { 
        subscription_id: subscription.id,
        customer_id: invoice.customer
      });
    }
  } catch (error) {
    logger.error('Error handling invoice payment failed', { 
      error: error.message, 
      invoice_id: invoice.id 
    });
  }
}

/**
 * Handle subscription updated event
 * @param {Object} subscription - Stripe subscription object
 */
async function handleSubscriptionUpdated(subscription) {
  try {
    const updateQuery = `
      UPDATE user_subscriptions 
      SET 
        subscription_status = $1,
        current_period_start = to_timestamp($2),
        current_period_end = to_timestamp($3)
      WHERE stripe_subscription_id = $4
    `;
    
    await db.query(updateQuery, [
      subscription.status,
      subscription.current_period_start,
      subscription.current_period_end,
      subscription.id
    ]);
    
    logger.info('Subscription updated', { 
      subscription_id: subscription.id,
      status: subscription.status
    });
  } catch (error) {
    logger.error('Error handling subscription updated', { 
      error: error.message, 
      subscription_id: subscription.id 
    });
  }
}

/**
 * Handle subscription deleted event
 * @param {Object} subscription - Stripe subscription object
 */
async function handleSubscriptionDeleted(subscription) {
  try {
    const updateQuery = `
      UPDATE user_subscriptions 
      SET subscription_status = 'canceled'
      WHERE stripe_subscription_id = $1
    `;
    
    await db.query(updateQuery, [subscription.id]);
    
    logger.info('Subscription deleted', { 
      subscription_id: subscription.id
    });
  } catch (error) {
    logger.error('Error handling subscription deleted', { 
      error: error.message, 
      subscription_id: subscription.id 
    });
  }
}; 