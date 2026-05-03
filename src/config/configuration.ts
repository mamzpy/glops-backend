export default () => ({
  app: {
    port: parseInt(process.env.PORT ?? '3000', 10),
    env: process.env.NODE_ENV ?? 'development',
  },

  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
  },

  database: {
    url: process.env.DATABASE_URL,
  },

  session: {
    inactivityTimeoutSeconds: parseInt(
      process.env.SESSION_INACTIVITY_TIMEOUT ?? '120',
      10,
    ),
    scanTimeoutSeconds: parseInt(process.env.SCAN_TIMEOUT ?? '30', 10),
    paymentWaitTimeoutSeconds: parseInt(
      process.env.PAYMENT_WAIT_TIMEOUT ?? '120',
      10,
    ),
    suspendRecoveryTimeoutSeconds: parseInt(
      process.env.SUSPEND_RECOVERY_TIMEOUT ?? '60',
      10,
    ),
  },

  xibo: {
    apiUrl: process.env.XIBO_API_URL,
    clientId: process.env.XIBO_CLIENT_ID,
    clientSecret: process.env.XIBO_CLIENT_SECRET,
  },
});
