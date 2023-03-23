import dotenv from 'dotenv';
dotenv.config();

export const settings = {
  JWT_SECRET: process.env.JWT_SECRET || 'fake',
  JWT_LIFETIME: 10, //In minutes
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'fake',
  JWT_REFRESH_LIFETIME: 20, //In minutes
  MONGO_URI: process.env.MONGO_URL || 'fake',
  EMAIL_LOGIN: process.env.EMAIL_LOGIN || 'fake',
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || 'fake',
  ENV: process.env.NODE_ENV || 'fake',
  PORT: process.env.PORT || 'fake',
  BASIC_AUTH_LOGIN: 'admin',
  BASIC_AUTH_PASSWORD: 'qwerty',
};
