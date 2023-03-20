import dotenv from 'dotenv';
dotenv.config();

export const settings = {
  JWT_SECRET: process.env.JWT_SECRET || 'fake',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'fake',
  MONGO_URI: process.env.MONGO_URL || 'fake',
  EMAIL_LOGIN: process.env.EMAIL_LOGIN || 'fake',
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || 'fake',
  ENV: process.env.NODE_ENV || 'fake',
  PORT: process.env.PORT || 'fake',
};
