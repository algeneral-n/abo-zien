/**
 * ABO ZIEN - Financial Routes
 * Local financial management (Invoices, Tax, VAT, Ledger)
 */

import express from 'express';
import { getDatabase, DB } from '../database/localDB.js';
import crypto from 'crypto';
import {
  createPaymentIntent,
  createCheckoutSession,
  confirmPayment,
  getPaymentStatus,
  refundPayment,
  createInvoice,
  getInvoice,
  listInvoices,
  STRIPE_KEY=REPLACE_ME
} from '../services/paymentService.js';

const router = express.Router();

/**
 * Get user ID from token (middleware)
 */
function getUserId(req) {
  return req.headers['x-user-id'] || 'default_user';
}

/**
 * Create invoice
 * POST /api/financial/invoice
 */
router.post('/invoice', (req, res) => {
  try {
    const userId = getUserId(req);
    const { clientName, items, tax = 15, currency = 'SAR' } = req.body;

    if (!clientName || !items || !items.length) {
      return res.status(400).json({ error: 'Client name and items are required' });
    }

    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const taxAmount = subtotal * (tax / 100);
    const total = subtotal + taxAmount;

    const invoiceId = `INV-${Date.now()}`;
    const invoice = {
      id: invoiceId,
      userId,
      clientName,
      items,
      subtotal,
      tax,
      taxAmount,
      total,
      currency,
      status: 'draft',
      dueDate: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
    };

    DB.invoices.create(invoice);

    res.json({
      success: true,
      invoice,
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

/**
 * Get invoices
 * GET /api/financial/invoices
 */
router.get('/invoices', (req, res) => {
  try {
    const userId = getUserId(req);
    const { status } = req.query;

    const invoices = DB.invoices.findByUser(userId, status);

    res.json({
      success: true,
      invoices: invoices.map(inv => ({
        ...inv,
        items: JSON.parse(inv.items),
      })),
      count: invoices.length,
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Failed to get invoices' });
  }
});

/**
 * Calculate VAT
 * POST /api/financial/vat
 */
router.post('/vat', (req, res) => {
  try {
    const { amount, rate = 15 } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const vatAmount = amount * (rate / 100);
    const total = amount + vatAmount;

    res.json({
      success: true,
      calculation: {
        originalAmount: amount,
        vatRate: rate,
        vatAmount,
        total,
        currency: 'SAR',
      },
    });
  } catch (error) {
    console.error('VAT calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate VAT' });
  }
});

/**
 * Get tax report
 * GET /api/financial/tax-report
 */
router.get('/tax-report', (req, res) => {
  try {
    const userId = getUserId(req);
    const invoices = DB.invoices.findByUser(userId);

    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.subtotal, 0);
    const totalVAT = invoices.reduce((sum, inv) => sum + inv.tax_amount, 0);

    res.json({
      success: true,
      taxReport: {
        period: 'current_quarter',
        totalRevenue,
        totalVAT,
        vatRate: 15,
        invoiceCount: invoices.length,
        currency: 'SAR',
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Tax report error:', error);
    res.status(500).json({ error: 'Failed to generate tax report' });
  }
});

/**
 * Add journal entry
 * POST /api/financial/journal
 */
router.post('/journal', (req, res) => {
  try {
    const userId = getUserId(req);
    const { date, description, debit, credit, account, category } = req.body;

    if (!description || !account) {
      return res.status(400).json({ error: 'Description and account are required' });
    }

    const entryId = `journal_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    const entry = {
      id: entryId,
      userId,
      date: date || Math.floor(Date.now() / 1000),
      description,
      debit: debit || 0,
      credit: credit || 0,
      account,
      category: category || 'general',
    };

    DB.journal.create(entry);

    res.json({
      success: true,
      entry,
    });
  } catch (error) {
    console.error('Add journal entry error:', error);
    res.status(500).json({ error: 'Failed to add journal entry' });
  }
});

/**
 * Get ledger
 * GET /api/financial/ledger
 */
router.get('/ledger', (req, res) => {
  try {
    const userId = getUserId(req);
    const { account, startDate, endDate } = req.query;

    let entries = DB.journal.findByUser(
      userId,
      startDate ? parseInt(startDate) : undefined,
      endDate ? parseInt(endDate) : undefined
    );

    // Filter by account if provided
    if (account) {
      entries = entries.filter(e => e.account === account);
    }

  res.json({
    success: true,
    entries,
    count: entries.length,
  });
  } catch (error) {
    console.error('Get ledger error:', error);
    res.status(500).json({ error: 'Failed to get ledger' });
  }
});

/**
 * Create Payment Intent
 * POST /api/financial/payment-intent
 */
router.post('/payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'SAR', metadata = {} } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const result = await createPaymentIntent(amount, currency, metadata);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create payment intent',
    });
  }
});

/**
 * Create Checkout Session (for Web)
 * POST /api/financial/checkout-session
 */
router.post('/checkout-session', async (req, res) => {
  try {
    const {
      amount,
      currency = 'SAR',
      metadata = {},
      successUrl,
      cancelUrl,
    } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const result = await createCheckoutSession(
      amount,
      currency,
      metadata,
      successUrl,
      cancelUrl
    );

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create checkout session',
    });
  }
});

/**
 * Create Payment Session (for ElevenLabs Agent)
 * POST /api/payment/create-session
 * This endpoint is specifically for ElevenLabs Agent to create Stripe payment sessions
 */
router.post('/create-session', async (req, res) => {
  try {
    const {
      amount,
      currency = 'SAR',
      client_id,
      metadata = {},
    } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Valid amount is required' 
      });
    }

    if (!client_id) {
      return res.status(400).json({ 
        success: false,
        error: 'Client ID is required' 
      });
    }

    // Use CLIENT_PORTAL_URL from environment or default
    const clientPortalUrl = process.env.CLIENT_PORTAL_URL || 'https://api.zien-ai.app/client-portal';
    
    const result = await createCheckoutSession(
      amount,
      currency,
      {
        ...metadata,
        client_id,
        source: 'elevenlabs_agent',
      },
      `${clientPortalUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      `${clientPortalUrl}/payment/cancel`
    );

    res.json({
      success: true,
      session_id: result.sessionId,
      payment_url: result.url,
      status: 'ready',
    });
  } catch (error) {
    console.error('Create payment session error (Agent):', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create payment session',
    });
  }
});

/**
 * Confirm Payment
 * POST /api/financial/confirm-payment
 */
router.post('/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }

    const result = await confirmPayment(paymentIntentId);

    // Update invoice status if payment succeeded
    if (result.success && result.metadata) {
      const { invoiceId, requestId, clientId, clientName } = result.metadata;
      
      if (invoiceId) {
        const invoice = DB.invoices.findById(invoiceId);
        if (invoice) {
          invoice.status = 'paid';
          invoice.paidAt = Date.now();
          invoice.paymentIntentId = paymentIntentId;
          DB.invoices.update(invoice);
        }
      }

      // ??? Notify Auto Builder that payment is completed and build can proceed
      if (result.success && requestId) {
        const io = req.app.get('io') || global.io;
        if (io) {
          io.of('/auto-builder').emit('payment:completed', {
            requestId,
            clientId,
            clientName,
            invoiceId,
            paymentIntentId,
            amount: result.amount,
            currency: result.currency,
            message: '???? ?????????? ??????????. ?????????? ???????? ?????????? ???? ????????????.',
          });

          // Also notify client portal
          io.of('/client-portal').emit('client:payment:confirmed', {
            requestId,
            invoiceId,
            amount: result.amount,
            currency: result.currency,
            message: '???? ?????????? ?????????? ??????????! ???????? ?????????? ?????????? ???????????? ?????? ?????????? ???????????????????? ?????? ???????????? ????????????.',
          });

          // ??? Send WhatsApp notification - Payment Received
          try {
            const { sendPaymentReceived } = await import('../services/twilioTemplatesService.js');
            // Get client phone from metadata or request
            const clientRequests = global.clientRequests || new Map();
            // Try to find client request by clientId
            let clientRequest = null;
            for (const [cid, requests] of clientRequests.entries()) {
              if (cid === clientId && requests.length > 0) {
                clientRequest = requests[0];
                break;
              }
            }
            if (clientRequest?.phone) {
              const paymentDate = new Date().toLocaleDateString('ar-SA', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              });
              await sendPaymentReceived(
                clientRequest.phone,
                clientName || clientRequest.clientName || '???????????? ????????????',
                `${result.amount} ${result.currency}`,
                requestId || 'N/A',
                paymentDate
              );
              console.log('??? Payment received notification sent to:', clientRequest.phone);
            }
          } catch (error) {
            console.error('Failed to send payment received notification:', error);
          }
        }
      }
    }

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to confirm payment',
    });
  }
});

/**
 * Get Payment Status
 * GET /api/financial/payment-status/:paymentIntentId
 */
router.get('/payment-status/:paymentIntentId', async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    const result = await getPaymentStatus(paymentIntentId);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get payment status',
    });
  }
});

/**
 * Refund Payment
 * POST /api/financial/refund
 */
router.post('/refund', async (req, res) => {
  try {
    const { paymentIntentId, amount } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }

    const result = await refundPayment(paymentIntentId, amount);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Refund payment error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to refund payment',
    });
  }
});

/**
 * Get Stripe Publishable Key
 * GET /api/financial/stripe-key
 */
router.get('/stripe-key', (req, res) => {
  res.json({
    success: true,
    publishableKey: STRIPE_KEY=REPLACE_ME
  });
});

/**
 * Create Stripe Invoice
 * POST /api/financial/stripe-invoice
 */
router.post('/stripe-invoice', async (req, res) => {
  try {
    const { customerId, items, metadata = {} } = req.body;

    if (!customerId || !items || !items.length) {
      return res.status(400).json({ error: 'Customer ID and items are required' });
    }

    const result = await createInvoice(customerId, items, metadata);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Create Stripe invoice error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create invoice',
    });
  }
});

/**
 * Get Stripe Invoice
 * GET /api/financial/stripe-invoice/:invoiceId
 */
router.get('/stripe-invoice/:invoiceId', async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const result = await getInvoice(invoiceId);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Get Stripe invoice error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get invoice',
    });
  }
});

/**
 * List Stripe Invoices
 * GET /api/financial/stripe-invoices
 */
router.get('/stripe-invoices', async (req, res) => {
  try {
    const { customerId, limit = 10 } = req.query;

    const result = await listInvoices(customerId, parseInt(limit));

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('List Stripe invoices error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to list invoices',
    });
  }
});

export default router;



