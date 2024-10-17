import express from 'express';
import passport from 'passport';
import session from 'express-session';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import UserRepository from './user/repository/repository';
import UserHTTPHandler from './user/handler/http_handler';
import GoogleOAuthHTTPHandler from './auth/google/handler/http_handler';
import cors from 'cors';
import nodemailer from 'nodemailer';
import { JWTUtils } from './utils/utils'

dotenv.config();

const dbClient = new Pool(
  {
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT as string, 10) || 5432,
  }
);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // your Gmail address
    pass: process.env.EMAIL_PASS  // your Gmail password or app password
  }
});

const jwtUtils = new JWTUtils(process.env.JWT_SECRET as string)
const userRepository = new UserRepository(dbClient)

const app = express();
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

const googleOAuthHTTPHandler = new
  GoogleOAuthHTTPHandler(
    process.env.GOOGLE_CLIENT_ID as string,
    process.env.GOOGLE_CLIENT_SECRET as string,
    process.env.GOOGLE_OAUTH_CALLBACK_URL as string
  );

// app.use('/auth', authRoutes);


app.use(
  '/auth',
  googleOAuthHTTPHandler.initializeRoutes()
);
app.use('/user', new UserHTTPHandler().initiateRoutes())
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
