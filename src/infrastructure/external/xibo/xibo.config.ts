import { registerAs } from '@nestjs/config';

export default registerAs('xibo', () => ({
  baseUrl: process.env.XIBO_BASE_URL,
  clientId: process.env.XIBO_CLIENT_ID,
  clientSecret: process.env.XIBO_CLIENT_SECRET,
}));
