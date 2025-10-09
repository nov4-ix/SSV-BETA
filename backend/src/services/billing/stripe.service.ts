import Stripe from 'stripe';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import { AppError } from '@/utils/errors';

// 🏆 STRIPE INTEGRATION PARA ALVAE ACCOUNTS 🏆

export interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
  publishableKey: string;
}

export interface AlvaeSubscription {
  id: string;
  customerId: string;
  priceId: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  metadata: {
    alvaeRole: string;
    alvaeTier: string;
    alvaeSymbol: string;
  };
}

export class StripeService {
  private stripe: Stripe;
  private webhookSecret: string;

  constructor() {
    if (!config.stripe.secretKey) {
      throw new AppError(500, 'Stripe secret key is required');
    }

    this.stripe = new Stripe(config.stripe.secretKey, {
      apiVersion: '2023-10-16',
    });
    this.webhookSecret = config.stripe.webhookSecret || '';
  }

  // 🏆 CREAR CUSTOMER ALVAE 🏆
  async createAlvaeCustomer(accountData: {
    email: string;
    name: string;
    alvaeRole: string;
    alvaeTier: string;
    alvaeSymbol: string;
  }): Promise<Stripe.Customer> {
    try {
      logger.info({ email: accountData.email, role: accountData.alvaeRole }, 'Creating ALVAE customer');

      const customer = await this.stripe.customers.create({
        email: accountData.email,
        name: accountData.name,
        metadata: {
          alvae_role: accountData.alvaeRole,
          alvae_tier: accountData.alvaeTier,
          alvae_symbol: accountData.alvaeSymbol,
          account_type: 'alvae',
        },
        description: `ALVAE ${accountData.alvaeRole} Account`,
      });

      logger.info({ customerId: customer.id, email: accountData.email }, 'ALVAE customer created successfully');
      return customer;

    } catch (error) {
      logger.error({ error, accountData }, 'Failed to create ALVAE customer');
      throw new AppError(500, 'Failed to create Stripe customer');
    }
  }

  // 🏆 CREAR SUBSCRIPTION ALVAE 🏆
  async createAlvaeSubscription(customerId: string, priceId: string, metadata: any): Promise<Stripe.Subscription> {
    try {
      logger.info({ customerId, priceId }, 'Creating ALVAE subscription');

      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata: {
          ...metadata,
          alvae_subscription: 'true',
        },
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      logger.info({ subscriptionId: subscription.id, customerId }, 'ALVAE subscription created successfully');
      return subscription;

    } catch (error) {
      logger.error({ error, customerId, priceId }, 'Failed to create ALVAE subscription');
      throw new AppError(500, 'Failed to create subscription');
    }
  }

  // 🏆 OBTENER SUBSCRIPTION ALVAE 🏆
  async getAlvaeSubscription(subscriptionId: string): Promise<AlvaeSubscription | null> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);

      return {
        id: subscription.id,
        customerId: subscription.customer as string,
        priceId: subscription.items.data[0]?.price.id || '',
        status: subscription.status as any,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        metadata: {
          alvaeRole: subscription.metadata.alvae_role || '',
          alvaeTier: subscription.metadata.alvae_tier || '',
          alvaeSymbol: subscription.metadata.alvae_symbol || '',
        },
      };

    } catch (error) {
      logger.error({ error, subscriptionId }, 'Failed to retrieve ALVAE subscription');
      return null;
    }
  }

  // 🏆 CANCELAR SUBSCRIPTION ALVAE 🏆
  async cancelAlvaeSubscription(subscriptionId: string, immediately = false): Promise<boolean> {
    try {
      logger.info({ subscriptionId, immediately }, 'Canceling ALVAE subscription');

      if (immediately) {
        await this.stripe.subscriptions.cancel(subscriptionId);
      } else {
        await this.stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
      }

      logger.info({ subscriptionId }, 'ALVAE subscription canceled successfully');
      return true;

    } catch (error) {
      logger.error({ error, subscriptionId }, 'Failed to cancel ALVAE subscription');
      return false;
    }
  }

  // 🏆 CREAR CHECKOUT SESSION ALVAE 🏆
  async createAlvaeCheckoutSession(customerId: string, priceId: string, metadata: any): Promise<Stripe.Checkout.Session> {
    try {
      logger.info({ customerId, priceId }, 'Creating ALVAE checkout session');

      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${config.app.frontendUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config.app.frontendUrl}/pricing`,
        metadata: {
          ...metadata,
          alvae_checkout: 'true',
        },
      });

      logger.info({ sessionId: session.id, customerId }, 'ALVAE checkout session created successfully');
      return session;

    } catch (error) {
      logger.error({ error, customerId, priceId }, 'Failed to create ALVAE checkout session');
      throw new AppError(500, 'Failed to create checkout session');
    }
  }

  // 🏆 PROCESAR WEBHOOK ALVAE 🏆
  async processAlvaeWebhook(payload: string, signature: string): Promise<void> {
    try {
      const event = this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);

      logger.info({ eventType: event.type }, 'Processing ALVAE webhook');

      switch (event.type) {
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        default:
          logger.info({ eventType: event.type }, 'Unhandled webhook event type');
      }

    } catch (error) {
      logger.error({ error }, 'Failed to process ALVAE webhook');
      throw new AppError(400, 'Invalid webhook signature');
    }
  }

  // 🏆 HANDLERS DE WEBHOOK 🏆
  private async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    logger.info({ subscriptionId: subscription.id }, 'ALVAE subscription created');
    // Aquí actualizarías la base de datos con el estado de la suscripción
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    logger.info({ subscriptionId: subscription.id }, 'ALVAE subscription updated');
    // Aquí actualizarías la base de datos con los cambios
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    logger.info({ subscriptionId: subscription.id }, 'ALVAE subscription deleted');
    // Aquí marcarías la suscripción como cancelada en la base de datos
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    logger.info({ invoiceId: invoice.id }, 'ALVAE payment succeeded');
    // Aquí actualizarías el estado de pago en la base de datos
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    logger.info({ invoiceId: invoice.id }, 'ALVAE payment failed');
    // Aquí manejarías el fallo de pago
  }

  // 🏆 OBTENER CUSTOMER ALVAE 🏆
  async getAlvaeCustomer(customerId: string): Promise<Stripe.Customer | null> {
    try {
      const customer = await this.stripe.customers.retrieve(customerId);
      return customer as Stripe.Customer;
    } catch (error) {
      logger.error({ error, customerId }, 'Failed to retrieve ALVAE customer');
      return null;
    }
  }

  // 🏆 LISTAR CUSTOMERS ALVAE 🏆
  async listAlvaeCustomers(limit = 100): Promise<Stripe.Customer[]> {
    try {
      const customers = await this.stripe.customers.list({
        limit,
        expand: ['data.subscriptions'],
      });

      return customers.data.filter(customer => 
        customer.metadata?.account_type === 'alvae'
      );
    } catch (error) {
      logger.error({ error }, 'Failed to list ALVAE customers');
      return [];
    }
  }

  // 🏆 CREAR PRICE ALVAE 🏆
  async createAlvaePrice(productId: string, amount: number, currency = 'usd', interval: 'month' | 'year' = 'month'): Promise<Stripe.Price> {
    try {
      logger.info({ productId, amount, currency, interval }, 'Creating ALVAE price');

      const price = await this.stripe.prices.create({
        product: productId,
        unit_amount: amount,
        currency,
        recurring: {
          interval,
        },
        metadata: {
          alvae_price: 'true',
        },
      });

      logger.info({ priceId: price.id }, 'ALVAE price created successfully');
      return price;

    } catch (error) {
      logger.error({ error, productId, amount }, 'Failed to create ALVAE price');
      throw new AppError(500, 'Failed to create price');
    }
  }

  // 🏆 CREAR PRODUCT ALVAE 🏆
  async createAlvaeProduct(name: string, description: string, metadata: any): Promise<Stripe.Product> {
    try {
      logger.info({ name }, 'Creating ALVAE product');

      const product = await this.stripe.products.create({
        name,
        description,
        metadata: {
          ...metadata,
          alvae_product: 'true',
        },
      });

      logger.info({ productId: product.id }, 'ALVAE product created successfully');
      return product;

    } catch (error) {
      logger.error({ error, name }, 'Failed to create ALVAE product');
      throw new AppError(500, 'Failed to create product');
    }
  }
}

export const stripeService = new StripeService();
