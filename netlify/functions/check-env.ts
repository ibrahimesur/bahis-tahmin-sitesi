import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

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
    // Collect environment information (without exposing sensitive data)
    const envInfo = {
      databaseUrlExists: !!process.env.DATABASE_URL,
      databaseUrlLength: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0,
      databaseUrlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : 'not set',
      nodeEnv: process.env.NODE_ENV,
      netlify: !!process.env.NETLIFY,
      netlifyDev: process.env.NETLIFY_DEV,
      netlifyContext: process.env.CONTEXT,
      netlifyBuildId: process.env.BUILD_ID,
      netlifyDeployId: process.env.DEPLOY_ID,
      netlifyDeployUrl: process.env.DEPLOY_URL,
      netlifyUrl: process.env.URL,
      netlifyCommitRef: process.env.COMMIT_REF,
      netlifyBranch: process.env.BRANCH,
      netlifyHeadBranch: process.env.HEAD,
      netlifyPullRequest: process.env.PULL_REQUEST,
      netlifyReviewId: process.env.REVIEW_ID,
      netlifyRepositoryUrl: process.env.REPOSITORY_URL,
    };
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Environment check successful',
        environment: envInfo
      })
    };
  } catch (error) {
    console.error('Environment check error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Environment check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
    };
  }
};

export { handler }; 