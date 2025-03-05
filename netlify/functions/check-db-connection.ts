import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import prisma from './utils/prisma';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight response' })
    };
  }

  try {
    // Log environment variables (without exposing sensitive data)
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    // Try to connect to the database
    await prisma.$connect();
    
    // Try a simple query
    const userCount = await prisma.user.count();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Database connection successful',
        userCount,
        databaseUrlExists: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV
      })
    };
  } catch (error) {
    console.error('Database connection error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        databaseUrlExists: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV
      })
    };
  } finally {
    // Always disconnect
    await prisma.$disconnect();
  }
};

export { handler }; 