/**
 * 🌌 SON1KVERS3 BACKEND - Netlify Functions Entry Point
 */

import { Handler, Context } from 'aws-lambda';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Import our main server
import { app } from '../src/server';

// Create Express app for Netlify Functions
const netlifyApp = express();

// Security middleware
netlifyApp.use(helmet());
netlifyApp.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
});
netlifyApp.use(limiter);

// Body parsing
netlifyApp.use(express.json({ limit: '10mb' }));
netlifyApp.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount the main app
netlifyApp.use('/', app);

// Netlify Functions handler
export const handler: Handler = async (event: any, context: Context) => {
  // Set up the request and response objects
  const request = {
    method: event.httpMethod,
    url: event.path,
    headers: event.headers,
    body: event.body,
    query: event.queryStringParameters || {},
  };

  const response = {
    statusCode: 200,
    headers: {},
    body: '',
  };

  try {
    // Process the request through Express
    await new Promise((resolve, reject) => {
      netlifyApp(request as any, response as any, (err: any) => {
        if (err) reject(err);
        else resolve(response);
      });
    });

    return {
      statusCode: response.statusCode,
      headers: response.headers,
      body: response.body,
    };
  } catch (error) {
    console.error('Netlify Function Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
      }),
    };
  }
};
