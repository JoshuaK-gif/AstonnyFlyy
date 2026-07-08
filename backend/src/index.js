import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import cluster from 'node:cluster';
import os from 'node:os';
import process from 'node:process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { upload, deleteImage } from './cloudinaryConfig.js';
import { authMiddleware } from './authMiddleware.js';
import { productSchema, collectionSchema, statSchema, orderSchema, messageSchema, subscriberSchema, lookbookSchema, communityImageSchema, testimonialSchema, reviewSchema, siteSettingsSchema } from './validators.js';
import { compressText, decompressText } from './compressionUtils.js';
import { submitOrder, getTransactionStatus } from './pesapal.js';

function sanitizeError(error) {
  if (error.name === 'ZodError') return error.errors;
  return 'Validation failed.';
}

dotenv.config();

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`⚡️ Primary ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`⚠️ Worker ${worker.process.pid} died. Spawning a replacement...`);
    cluster.fork();
  });
} else {
  const { Pool } = pg;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is missing in .env file');
  }

  const app = express();
  const prisma = new PrismaClient({ adapter });
  const PORT = process.env.PORT || 5000;

  // Initialize nodemailer transporter if credentials exist
  const transporter = (process.env.EMAIL_USER && process.env.EMAIL_PASS) ? nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  }) : null;

  // Security Middleware
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
  app.use(helmet());
  app.use(cors({
    origin: (origin, callback) => {
      const allowedOrigins = [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  }));
  app.use(express.json());
  app.use(morgan('dev'));

  // Rate Limiting — General API protection
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: { error: 'Too many requests, please try again later.' }
  });
  app.use('/api/', limiter);

  // Rate Limiting — Stricter for sensitive endpoints
  const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: 'Too many requests, please try again later.' }
  });

  // Rate Limiting — Aggressive login protection (5 attempts per 15 min)
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many login attempts. Please try again in 15 minutes.', retryAfter: 15 },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // In-memory lockout tracker (per IP)
  const loginAttempts = new Map();
  const MAX_CONSECUTIVE_FAILURES = 5;
  const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes

  function getLoginAttemptInfo(ip) {
    const info = loginAttempts.get(ip);
    if (!info) return { failures: 0, lockedUntil: null };
    // Clear lockout if expired
    if (info.lockedUntil && Date.now() > info.lockedUntil) {
      loginAttempts.delete(ip);
      return { failures: 0, lockedUntil: null };
    }
    return info;
  }

  function recordFailedAttempt(ip) {
    const info = getLoginAttemptInfo(ip);
    const failures = info.failures + 1;
    const lockedUntil = failures >= MAX_CONSECUTIVE_FAILURES ? Date.now() + LOCKOUT_DURATION_MS : null;
    loginAttempts.set(ip, { failures, lockedUntil });
    return { failures, lockedUntil, isLocked: !!lockedUntil };
  }

  function clearFailedAttempts(ip) {
    loginAttempts.delete(ip);
  }

  // Health Check
  app.get('/', (req, res) => res.json({ status: 'AstonnyFlyy API is active' }));

  // --- AUTH ROUTES ---

  app.post('/api/auth/login', loginLimiter, async (req, res) => {
    try {
      const clientIp = req.ip || req.socket.remoteAddress;
      const attemptInfo = getLoginAttemptInfo(clientIp);

      // Check if IP is currently locked out
      if (attemptInfo.lockedUntil) {
        const remainingMs = attemptInfo.lockedUntil - Date.now();
        const remainingMin = Math.ceil(remainingMs / 60000);
        console.warn(`🔒 LOCKOUT: Login attempt from locked IP ${clientIp}. ${remainingMin} min remaining.`);
        return res.status(429).json({
          error: `Account locked due to too many failed attempts. Try again in ${remainingMin} minute(s).`,
          lockedUntil: attemptInfo.lockedUntil,
          retryAfter: remainingMin
        });
      }

      const { password } = req.body;
      if (!password) return res.status(400).json({ error: 'Password is required.' });

      const passwordHash = process.env.ADMIN_PASSWORD_HASH;
      if (!passwordHash) {
        console.error('FATAL: ADMIN_PASSWORD_HASH is not set in environment variables.');
        return res.status(500).json({ error: 'Server configuration error.' });
      }

      // Use bcrypt for timing-safe password comparison
      const isMatch = await bcrypt.compare(password, passwordHash);

      if (isMatch) {
        // Clear failed attempts on successful login
        clearFailedAttempts(clientIp);

        const secret = process.env.JWT_SECRET;
        if (!secret) {
          console.error('FATAL: JWT_SECRET is not set in environment variables.');
          return res.status(500).json({ error: 'Server configuration error.' });
        }

        const token = jwt.sign(
          { role: 'admin', iat: Math.floor(Date.now() / 1000) },
          secret,
          { expiresIn: '24h' }
        );

        console.log(`✅ Admin login successful from IP: ${clientIp}`);
        return res.json({ token });
      }

      // Record failed attempt
      const result = recordFailedAttempt(clientIp);
      const attemptsRemaining = MAX_CONSECUTIVE_FAILURES - result.failures;
      console.warn(`⚠️ Failed login attempt #${result.failures} from IP: ${clientIp}. ${attemptsRemaining} attempts remaining.`);

      if (result.isLocked) {
        return res.status(429).json({
          error: 'Too many failed attempts. Account locked for 30 minutes.',
          lockedUntil: result.lockedUntil,
          retryAfter: 30
        });
      }

      res.status(401).json({
        error: 'Invalid credentials.',
        attemptsRemaining
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed.' });
    }
  });

  // --- PESAPAL PAYMENT ROUTES ---

  app.post('/api/pesapal/initiate', strictLimiter, async (req, res) => {
    try {
      const { orderNumber, totalAmount, currency, firstName, lastName, email, phone } = req.body;
      if (!orderNumber || !totalAmount || !firstName || !lastName || !email) {
        return res.status(400).json({ error: 'Missing required order fields' });
      }
      const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
      const callbackUrl = `${baseUrl}/api/pesapal/callback?order_id=${orderNumber}`;
      const result = await submitOrder({
        orderNumber,
        totalAmount,
        currency: currency || 'USD',
        firstName,
        lastName,
        email,
        phone,
        callbackUrl
      });

      await prisma.order.update({
        where: { orderNumber },
        data: {
          pesapalTrackingId: result.order_tracking_id,
          pesapalMerchantRef: result.merchant_reference
        }
      });

      res.json({
        redirectUrl: result.redirect_url,
        orderTrackingId: result.order_tracking_id,
        merchantReference: result.merchant_reference
      });
    } catch (error) {
      console.error('Pesapal initiate error:', error);
      res.status(500).json({ error: 'Failed to initiate payment' });
    }
  });

  app.get('/api/pesapal/callback', async (req, res) => {
    try {
      const { order_id, OrderTrackingId, OrderMerchantReference } = req.query;
      const trackingId = OrderTrackingId || req.query.orderTrackingId;
      if (trackingId) {
        const status = await getTransactionStatus(trackingId);
        const newStatus = status.status_code === '200' ? 'Processing' : 'Pending';
        const order = await prisma.order.update({
          where: { orderNumber: order_id || OrderMerchantReference },
          data: { status: newStatus }
        });
        if (newStatus === 'Processing') sendPaymentReceipt(order);
      } else if (order_id) {
        const order = await prisma.order.update({
          where: { orderNumber: order_id },
          data: { status: 'Processing' }
        });
        sendPaymentReceipt(order);
      }
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout/success?order=${order_id || OrderMerchantReference || ''}`);
    } catch (error) {
      console.error('Pesapal callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout?error=payment_failed`);
    }
  });

  app.get('/api/pesapal/ipn', async (req, res) => {
    try {
      const { OrderTrackingId, OrderMerchantReference, OrderNotificationType } = req.query;
      console.log(`Pesapal IPN received:`, { OrderTrackingId, OrderMerchantReference, OrderNotificationType });
      if (OrderTrackingId) {
        const status = await getTransactionStatus(OrderTrackingId);
        const paymentStatus = status.payment_status_description?.toLowerCase() || '';
        let orderStatus = 'Pending';
        if (paymentStatus.includes('completed') || paymentStatus.includes('success')) orderStatus = 'Processing';
        else if (paymentStatus.includes('failed') || paymentStatus.includes('cancelled')) orderStatus = 'Cancelled';
        const order = await prisma.order.update({
          where: { orderNumber: OrderMerchantReference },
          data: { status: orderStatus }
        });
        if (orderStatus === 'Processing') sendPaymentReceipt(order);
      }
      res.status(200).send('OK');
    } catch (error) {
      console.error('Pesapal IPN error:', error);
      res.status(200).send('OK');
    }
  });

  // --- EMAIL HELPER ---
  async function sendNewCollectionNotification(collection) {
    if (!transporter || !process.env.EMAIL_USER) {
      console.log('Email not configured — skipping new collection notification');
      return;
    }
    try {
      const subscribers = await prisma.subscriber.findMany();
      if (subscribers.length === 0) {
        console.log('No subscribers to notify');
        return;
      }
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const results = await Promise.allSettled(subscribers.map(sub =>
        transporter.sendMail({
          from: `"AstonnyFlyy" <${process.env.EMAIL_USER}>`,
          to: sub.email,
          subject: `New Collection Dropped: ${collection.title}`,
          html: `
            <div style="font-family:Montserrat,sans-serif;max-width:600px;margin:0 auto;">
              <div style="background:#0d0d0d;padding:32px;text-align:center;">
                <h1 style="color:#c9a96e;font-family:Playfair Display,serif;font-size:28px;margin:0;">AstonnyFlyy</h1>
              </div>
              <div style="padding:32px;background:#fff;">
                <h2 style="font-family:Playfair Display,serif;color:#0d0d0d;margin-top:0;">New Collection Alert</h2>
                <p style="color:#555;">Our newest collection has arrived. Be the first to explore it.</p>
                <div style="text-align:center;margin:24px 0;">
                  <img src="${collection.image}" alt="${collection.title}" style="max-width:100%;border-radius:12px;" />
                </div>
                <p style="font-size:20px;font-weight:bold;color:#0d0d0d;text-align:center;">${collection.title}</p>
                <div style="text-align:center;margin-top:24px;">
                  <a href="${frontendUrl}/shop?collection=${collection.tag}" style="display:inline-block;background:#0d0d0d;color:#fff;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:bold;text-transform:uppercase;letter-spacing:2px;font-size:12px;">Shop Now</a>
                </div>
              </div>
              <div style="background:#f5f5f5;padding:24px;text-align:center;color:#888;font-size:12px;">
                <p>AstonnyFlyy — Modern Street Luxury</p>
                <p>Questions? Contact us at ${process.env.EMAIL_USER}</p>
                <p><a href="${frontendUrl}" style="color:#c9a96e;">Visit Store</a></p>
              </div>
            </div>
          `
        })
      ));
      const sent = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      console.log(`Collection notification sent to ${sent} subscribers${failed ? `, ${failed} failed` : ''}`);
    } catch (err) {
      console.error('Failed to send collection notifications:', err);
    }
  }

  async function sendPaymentReceipt(order) {
    if (!transporter || !process.env.EMAIL_USER) return;
    try {
      const itemsHtml = order.items?.map(item =>
        `<tr><td style="padding:8px;border-bottom:1px solid #ddd;">${item.name}</td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:center;">${item.quantity}</td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;">$${Number(item.price).toFixed(2)}</td></tr>`
      ).join('') || '';

      await transporter.sendMail({
        from: `"AstonnyFlyy" <${process.env.EMAIL_USER}>`,
        to: order.customerEmail,
        bcc: 'livingstonetwinamatsiko2@gmail.com',
        subject: `Payment Confirmed — Order ${order.orderNumber}`,
        html: `
          <div style="font-family:Montserrat,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#0d0d0d;padding:32px;text-align:center;">
              <h1 style="color:#c9a96e;font-family:Playfair Display,serif;font-size:28px;margin:0;">AstonnyFlyy</h1>
            </div>
            <div style="padding:32px;background:#fff;">
              <h2 style="font-family:Playfair Display,serif;color:#0d0d0d;margin-top:0;">Thank you for your order!</h2>
              <p style="color:#555;">Your payment has been confirmed. Here's your receipt:</p>
              <p style="color:#0d0d0d;"><strong>Order:</strong> ${order.orderNumber}</p>
              <p style="color:#0d0d0d;"><strong>Name:</strong> ${order.customerName}</p>
              <p style="color:#0d0d0d;"><strong>Email:</strong> ${order.customerEmail}</p>
              <p style="color:#0d0d0d;"><strong>Phone:</strong> ${order.customerPhone || 'N/A'}</p>
              <p style="color:#0d0d0d;"><strong>Shipping:</strong> ${order.shippingAddress}</p>
              <p style="color:#0d0d0d;"><strong>Status:</strong> ${order.status}</p>
              <table style="width:100%;border-collapse:collapse;margin-top:16px;">
                <thead><tr style="background:#f5f5f5;"><th style="padding:8px;text-align:left;">Item</th><th style="padding:8px;text-align:center;">Qty</th><th style="padding:8px;text-align:right;">Price</th></tr></thead>
                <tbody>${itemsHtml}</tbody>
                <tfoot><tr><td colspan="2" style="padding:12px;text-align:right;font-weight:bold;">Total</td><td style="padding:12px;text-align:right;font-weight:bold;font-size:18px;">$${Number(order.totalAmount).toFixed(2)}</td></tr></tfoot>
              </table>
            </div>
            <div style="background:#f5f5f5;padding:24px;text-align:center;color:#888;font-size:12px;">
              <p>AstonnyFlyy — Modern Street Luxury</p>
              <p>Questions? Contact us at ${process.env.EMAIL_USER}</p>
            </div>
          </div>
        `
      });
    } catch (err) {
      console.error('Failed to send payment receipt email:', err);
    }
  }

  // --- IMAGE UPLOAD ---

  app.post('/api/upload', authMiddleware, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ url: req.file.path });
  });

  // --- PRODUCT ROUTES ---

  app.get('/api/products', async (req, res) => {
    try {
      const { category, tag, collection } = req.query;
      console.log(`--- PRODUCT FETCH REQUEST: cat=${category}, tag=${tag}, coll=${collection} ---`);
      
      let where = {};
      // Ignore "undefined" or "null" strings often sent by frontend libraries
      if (category && category !== 'All' && category !== 'undefined' && category !== 'null') {
        where.category = category;
      }
      if (tag && tag !== 'undefined' && tag !== 'null') {
        where.tags = { has: tag };
      }
      if (collection && collection !== 'undefined' && collection !== 'null') {
        // Special mapping for legacy/convenience, but also check the collections array
        const conditions = [
          { collections: { has: collection } },
          { category: collection },
          { tags: { has: collection.toLowerCase() } }
        ];

        if (collection === 'New Arrivals') conditions.push({ newArrival: true });
        if (collection === 'Trending') conditions.push({ bestseller: true });
        if (collection === 'Featured') conditions.push({ featured: true });

        where.OR = conditions;
        console.log('Filtering by collection OR conditions:', JSON.stringify(where.OR, null, 2));
      }

      const products = await prisma.product.findMany({ 
        where,
        orderBy: { createdAt: 'desc' } 
      });
      console.log(`Found ${products.length} products`);
      res.json(products);
    } catch (error) {
      console.error('Fetch products error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await prisma.product.findUnique({
        where: { id: req.params.id }
      });
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
    } catch (error) {
      console.error('Fetch product by id error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.post('/api/products', authMiddleware, async (req, res) => {
    try {
      const validatedData = productSchema.parse(req.body);
      const product = await prisma.product.create({ data: validatedData });
      res.status(201).json(product);
    } catch (error) {
      console.error('--- PRODUCT CREATION ERROR ---');
      if (error.name === 'ZodError') {
        console.error('Validation Errors:', JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ error: error.errors });
      }
      
      // Catch Prisma Unique Constraint
      if (error.code === 'P2002') {
        console.error('Unique constraint failed:', error.meta);
        return res.status(400).json({ error: 'A product with this value already exists.' });
      }

      console.error('Unexpected Error:', error);
      res.status(400).json({ error: 'Validation failed' });
    }
  });

  app.put('/api/products/:id', authMiddleware, async (req, res) => {
    try {
      const validatedData = productSchema.partial().parse(req.body);
      const product = await prisma.product.update({
        where: { id: req.params.id },
        data: validatedData,
      });
      res.json(product);
    } catch (error) {
      console.error('--- PRODUCT UPDATE ERROR ---', error);
      res.status(400).json({ error: sanitizeError(error) });
    }
  });

  app.delete('/api/products/:id', authMiddleware, async (req, res) => {
    try {
      console.log(`--- PRODUCT DELETION: ${req.params.id} ---`);
      const product = await prisma.product.findUnique({ where: { id: req.params.id } });
      if (product) {
        // Cleanup images from Cloudinary
        for (const imageUrl of product.images) {
          await deleteImage(imageUrl);
        }
        await prisma.product.delete({ where: { id: req.params.id } });
        console.log('Product and images deleted successfully');
      }
      res.status(204).send();
    } catch (error) {
      console.error('Delete failed:', error);
      res.status(500).json({ error: 'Delete failed' });
    }
  });

  // --- REVIEW ROUTES ---

  app.get('/api/products/:id/reviews', async (req, res) => {
    try {
      const reviews = await prisma.review.findMany({
        where: { productId: req.params.id },
        orderBy: { createdAt: 'desc' }
      });
      res.json(reviews);
    } catch (error) {
      console.error('Fetch reviews error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.post('/api/reviews', strictLimiter, async (req, res) => {
    try {
      const validatedData = reviewSchema.parse(req.body);
      const review = await prisma.review.create({ data: validatedData });
      res.status(201).json(review);
    } catch (error) {
      console.error('Review creation error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors });
      }
      res.status(400).json({ error: 'Validation failed' });
    }
  });

  app.delete('/api/reviews/:id', authMiddleware, async (req, res) => {
    try {
      await prisma.review.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      console.error('Review delete error:', error);
      res.status(500).json({ error: 'Failed to delete review' });
    }
  });

  app.get('/api/admin/reviews', authMiddleware, async (req, res) => {
    try {
      const reviews = await prisma.review.findMany({
        include: { product: { select: { name: true, id: true } } },
        orderBy: { createdAt: 'desc' }
      });
      res.json(reviews);
    } catch (error) {
      console.error('Fetch all reviews error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // --- COLLECTION ROUTES ---

  app.get('/api/collections', async (req, res) => {
    try {
      const collections = await prisma.collection.findMany();
      res.json(collections);
    } catch (error) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.get('/api/collections/:id', async (req, res) => {
    try {
      const collection = await prisma.collection.findUnique({
        where: { id: req.params.id },
      });
      if (!collection) return res.status(404).json({ error: 'Collection not found' });
      res.json(collection);
    } catch (error) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.post('/api/collections', authMiddleware, async (req, res) => {
    try {
      console.log('--- COLLECTION CREATION REQUEST ---');
      console.log('Body:', JSON.stringify(req.body, null, 2));
      
      const validatedData = collectionSchema.parse(req.body);
      const collection = await prisma.collection.create({ data: validatedData });
      
      console.log('Collection created successfully:', collection);
      sendNewCollectionNotification(collection);
      res.status(201).json(collection);
    } catch (error) {
      console.error('--- COLLECTION CREATION ERROR ---');
      if (error.errors) {
        console.error('Validation Errors:', JSON.stringify(error.errors, null, 2));
      } else {
        console.error('Error:', error);
      }
      res.status(400).json({ error: sanitizeError(error) });
    }
  });

  app.put('/api/collections/:id', authMiddleware, async (req, res) => {
    try {
      const validatedData = collectionSchema.partial().parse(req.body);
      const collection = await prisma.collection.update({
        where: { id: req.params.id },
        data: validatedData,
      });
      res.json(collection);
    } catch (error) {
      res.status(400).json({ error: sanitizeError(error) });
    }
  });

  app.delete('/api/collections/:id', authMiddleware, async (req, res) => {
    try {
      const collection = await prisma.collection.findUnique({ where: { id: req.params.id } });
      if (collection) {
        await deleteImage(collection.image);
        await prisma.collection.delete({ where: { id: req.params.id } });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Delete failed' });
    }
  });

  // --- IMPACT STAT ROUTES ---

  app.get('/api/impact-stats', async (req, res) => {
    try {
      const stats = await prisma.impactStat.findMany();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  // --- ORDER ROUTES ---

  app.get('/api/orders', authMiddleware, async (req, res) => {
    try {
      const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' } });
      res.json(orders);
    } catch (error) {
      console.error('--- ORDER FETCH ERROR ---', error);
      res.status(500).json({ error: 'Database error' });
    }
  });


  app.post('/api/orders', strictLimiter, async (req, res) => {
    try {
      const validatedData = orderSchema.parse(req.body);

      // Generate unique order number (e.g., AF-123456)
      const orderNumber = `AF-${Math.floor(100000 + Math.random() * 900000)}`;

      const order = await prisma.order.create({
        data: {
          ...validatedData,
          orderNumber,
          status: 'Pending'
        }
      });

      // Update product stock quantities
      for (const item of validatedData.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity
            }
          }
        });
      }

      res.status(201).json(order);
    } catch (error) {
      console.error('Order creation error:', error);
      res.status(400).json({ error: sanitizeError(error) });
    }
  });

  app.patch('/api/orders/:id/status', authMiddleware, async (req, res) => {
    try {
      const { status } = req.body;
      const order = await prisma.order.update({
        where: { id: req.params.id },
        data: { status }
      });
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: 'Update failed' });
    }
  });

  // --- ADMIN DASHBOARD STATS ---

  app.get('/api/admin/dashboard-stats', authMiddleware, async (req, res) => {
    try {
      const totalProducts = await prisma.product.count();
      const activeOrders = await prisma.order.count({
        where: {
          status: { in: ['Pending', 'Processing', 'Shipped'] }
        }
      });

      const unreadMessages = await prisma.message.count({
        where: { status: 'Unread' }
      });

      const orders = await prisma.order.findMany({
        select: { totalAmount: true, customerEmail: true, createdAt: true }
      });

      const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const uniqueCustomers = new Set(orders.map(o => o.customerEmail)).size;

      // Calculate last 7 days revenue
      const revenueHistory = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        date.setHours(0, 0, 0, 0);
        
        const dayTotal = orders
          .filter(o => {
            const oDate = new Date(o.createdAt);
            oDate.setHours(0, 0, 0, 0);
            return oDate.getTime() === date.getTime();
          })
          .reduce((sum, o) => sum + o.totalAmount, 0);

        return {
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          amount: dayTotal
        };
      });

      res.json({
        totalProducts,
        activeOrders,
        totalCustomers: uniqueCustomers,
        totalRevenue,
        revenueHistory,
        unreadMessages
      });
    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
  });

  app.post('/api/impact-stats', authMiddleware, async (req, res) => {
    try {
      const validatedData = statSchema.parse(req.body);
      const stat = await prisma.impactStat.create({ data: validatedData });
      res.status(201).json(stat);
    } catch (error) {
      res.status(400).json({ error: sanitizeError(error) });
    }
  });

  app.put('/api/impact-stats/:id', authMiddleware, async (req, res) => {
    try {
      const validatedData = statSchema.parse(req.body);
      const stat = await prisma.impactStat.update({
        where: { id: req.params.id },
        data: validatedData,
      });
      res.json(stat);
    } catch (error) {
      res.status(400).json({ error: sanitizeError(error) });
    }
  });

  app.delete('/api/impact-stats/:id', authMiddleware, async (req, res) => {
    try {
      await prisma.impactStat.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Delete failed' });
    }
  });

  // --- PRODUCT PROPERTY ROUTES ---

  app.get('/api/properties', async (req, res) => {
    try {
      const properties = await prisma.productProperty.findMany();
      res.json(properties);
    } catch (error) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.post('/api/properties', authMiddleware, async (req, res) => {
    try {
      console.log('--- PROPERTY CREATION REQUEST ---');
      console.log('Body:', JSON.stringify(req.body, null, 2));
      
      if (!req.body.type || !req.body.name || !req.body.value) {
        console.error('Missing required fields:', req.body);
        return res.status(400).json({ error: 'Type, Name, and Value are required' });
      }

      const property = await prisma.productProperty.create({ data: req.body });
      console.log('Property created successfully:', property);
      res.status(201).json(property);
    } catch (error) {
      console.error('Failed to create property:', error);
      res.status(400).json({ error: 'Failed to create property' });
    }
  });

  app.delete('/api/properties/:id', authMiddleware, async (req, res) => {
    try {
      await prisma.productProperty.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Delete failed' });
    }
  });

  // --- MESSAGE ROUTES ---

  app.get('/api/messages', authMiddleware, async (req, res) => {
    try {
      const messages = await prisma.message.findMany({ orderBy: { createdAt: 'desc' } });
      
      // Decompress messages
      const decompressedMessages = await Promise.all(messages.map(async (m) => {
        try {
          return {
            ...m,
            message: await decompressText(m.message)
          };
        } catch (decompressError) {
          console.error(`Error decompressing message ${m.id}:`, decompressError);
          return {
            ...m,
            message: `[Error: Could not decompress message - ${m.message.substring(0, 20)}...]`
          };
        }
      }));

      res.json(decompressedMessages);
    } catch (error) {
      console.error('Database error in /api/messages:', error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.post('/api/messages', strictLimiter, async (req, res) => {
    try {
      const validatedData = messageSchema.parse(req.body);
      const rawMessageText = validatedData.message;
      validatedData.message = await compressText(validatedData.message);
      
      const message = await prisma.message.create({ data: validatedData });
      
      // Send Email
      if (transporter && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        try {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: 'livingstonetwinamatsiko2@gmail.com',
            subject: `New Message from ${message.name}: ${message.subject || 'No Subject'}`,
            text: `You have received a new message from ${message.name} (${message.email}):\n\n${rawMessageText}`,
            html: `<p>You have received a new message from <strong>${message.name}</strong> (${message.email}):</p><p>${rawMessageText}</p>`
          });
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
          // Don't fail the request if email fails, but log it.
        }
      }

      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ error: sanitizeError(error) });
    }
  });

  app.patch('/api/messages/:id/status', authMiddleware, async (req, res) => {
    try {
      const { status } = req.body;
      const message = await prisma.message.update({
        where: { id: req.params.id },
        data: { status }
      });
      res.json(message);
    } catch (error) {
      res.status(500).json({ error: 'Update failed' });
    }
  });

  app.delete('/api/messages/:id', authMiddleware, async (req, res) => {
    try {
      await prisma.message.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Delete failed' });
    }
  });

  // --- SUBSCRIBER ROUTES ---

  app.get('/api/subscribers', authMiddleware, async (req, res) => {
    try {
      const subscribers = await prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' } });
      res.json(subscribers);
    } catch (error) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.post('/api/subscribers', strictLimiter, async (req, res) => {
    try {
      const validatedData = subscriberSchema.parse(req.body);
      
      const existing = await prisma.subscriber.findUnique({
        where: { email: validatedData.email }
      });
      
      if (existing) {
        return res.status(400).json({ error: 'Email already subscribed' });
      }

      const subscriber = await prisma.subscriber.create({ data: validatedData });
      res.status(201).json(subscriber);
    } catch (error) {
      res.status(400).json({ error: sanitizeError(error) });
    }
  });

  app.delete('/api/subscribers/:id', authMiddleware, async (req, res) => {
    try {
      await prisma.subscriber.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Delete failed' });
    }
  });

  // --- EDITORIAL ROUTES (LOOKBOOK, COMMUNITY, TESTIMONIALS) ---

  // Lookbook
  app.get('/api/lookbook', async (req, res) => {
    try {
      const items = await prisma.lookbookItem.findMany({ orderBy: { order: 'asc' } });
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.post('/api/lookbook', authMiddleware, async (req, res) => {
    try {
      const validatedData = lookbookSchema.parse(req.body);
      const item = await prisma.lookbookItem.create({ data: validatedData });
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: sanitizeError(error) });
    }
  });

  app.delete('/api/lookbook/:id', authMiddleware, async (req, res) => {
    try {
      const item = await prisma.lookbookItem.findUnique({ where: { id: req.params.id } });
      if (item) {
        await deleteImage(item.image);
        await prisma.lookbookItem.delete({ where: { id: req.params.id } });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Delete failed' });
    }
  });

  // Community Images
  app.get('/api/community-images', async (req, res) => {
    try {
      const items = await prisma.communityImage.findMany({ orderBy: { order: 'asc' } });
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.post('/api/community-images', authMiddleware, async (req, res) => {
    try {
      const validatedData = communityImageSchema.parse(req.body);
      const item = await prisma.communityImage.create({ data: validatedData });
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: sanitizeError(error) });
    }
  });

  app.delete('/api/community-images/:id', authMiddleware, async (req, res) => {
    try {
      const item = await prisma.communityImage.findUnique({ where: { id: req.params.id } });
      if (item) {
        await deleteImage(item.image);
        await prisma.communityImage.delete({ where: { id: req.params.id } });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Delete failed' });
    }
  });

  // Testimonials
  app.get('/api/testimonials', async (req, res) => {
    try {
      const items = await prisma.testimonial.findMany({ orderBy: { order: 'asc' } });
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.post('/api/testimonials', authMiddleware, async (req, res) => {
    try {
      const validatedData = testimonialSchema.parse(req.body);
      const item = await prisma.testimonial.create({ data: validatedData });
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: sanitizeError(error) });
    }
  });

  app.delete('/api/testimonials/:id', authMiddleware, async (req, res) => {
    try {
      await prisma.testimonial.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Delete failed' });
    }
  });

  // --- SITE SETTINGS ROUTES ---

  app.get('/api/settings', async (req, res) => {
    try {
      let settings = await prisma.siteSettings.findFirst();
      if (!settings) {
        settings = await prisma.siteSettings.create({
          data: {
            heroBgType: "image",
            heroBgColor: "#0f172a",
            heroBgImage: "https://media.base44.com/images/public/6a2c25958136d9426eca8288/eeecd1355_generated_8fbbcd65.png",
            
            collectionsBgType: "color",
            collectionsBgColor: "#ffffff",
            collectionsBgImage: null,
            
            featuredBgType: "color",
            featuredBgColor: "#ffffff",
            featuredBgImage: null,
            
            brandStoryBgType: "color",
            brandStoryBgColor: "#ffffff",
            brandStoryBgImage: null,
            
            lookbookBgType: "color",
            lookbookBgColor: "#ffffff",
            lookbookBgImage: null,
            
            impactNumbersBgType: "color",
            impactNumbersBgColor: "#0f172a",
            impactNumbersBgImage: null,
            
            communityBgType: "color",
            communityBgColor: "#ffffff",
            communityBgImage: null,
            
            newsletterBgType: "color",
            newsletterBgColor: "#f8fafc",
            newsletterBgImage: null
          }
        });
      }
      res.json(settings);
    } catch (error) {
      console.error('Fetch settings error:', error);
      res.status(500).json({ error: 'Database error fetching settings' });
    }
  });

  app.put('/api/settings', authMiddleware, async (req, res) => {
    try {
      const validatedData = siteSettingsSchema.parse(req.body);
      let settings = await prisma.siteSettings.findFirst();
      if (!settings) {
        settings = await prisma.siteSettings.create({ data: validatedData });
      } else {
        settings = await prisma.siteSettings.update({
          where: { id: settings.id },
          data: validatedData
        });
      }
      res.json(settings);
    } catch (error) {
      console.error('Update settings error:', error);
      res.status(400).json({ error: sanitizeError(error) });
    }
  });

  // --- SERVE FRONTEND IN PRODUCTION ---
  const frontendDist = path.resolve(__dirname, '..', '..', 'frontend', 'dist');
  app.use(express.static(frontendDist));

  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendDist, 'index.html'));
    }
  });

  // --- GLOBAL ERROR HANDLER ---
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong on the server!' });
  });

  app.listen(PORT, () => {
    console.log(`🚀 Worker ${process.pid} started on http://localhost:${PORT}`);
  });
}
