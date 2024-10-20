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
import { DBUtils, JWTUtils } from './utils/utils'
import MainAuthHTTPHandler from './auth/main/handler/http_handler';
import bodyParser from 'body-parser'
import MainAuthDomain from './auth/main/domain/domain';
import EmailRepository from './email/repository/repository';
import UsersEmailVerificationRepository from './users-email-verification/repository/repository';
import UserDomain from './user/domain/domain';
import { createClient } from 'redis';
import UserSessionsRepository from './user-session/repository/repository';
import GoogleOAuthDomain from './auth/google/domain/domain';

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


const client = createClient().on('error', (err) => console.log('Redis Client Error', err)).connect();

dbClient.connect(async (err) => {
  if (err) {
    console.error('Failed to connect to the database:', err);
    await dbClient.end();
    console.log('PostgreSQL client disconnected');
    process.exit(1);
  }
})

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // your Gmail address
    pass: process.env.EMAIL_PASS  // your Gmail password or app password
  }
});

// initiate utils
const jwtUtils = new JWTUtils(process.env.JWT_SECRET as string);
const dbUtils = new DBUtils(dbClient);


// initiate repositories
const userRepository = new UserRepository(dbClient);
const userEmailVerificationRepository = new UsersEmailVerificationRepository(dbClient);
const emailRepository = new EmailRepository(transporter);
const userSessionsRepository = new UserSessionsRepository(dbClient);

// initiate domains
const mainAuthDomain = new MainAuthDomain(
  userRepository,
  emailRepository,
  userEmailVerificationRepository,
  userSessionsRepository,
  jwtUtils,
  dbUtils,
  process.env.MAIN_SERVICE_URL as string,
);
const googleOAuthDomain = new GoogleOAuthDomain(
  userRepository,
  userSessionsRepository,
  jwtUtils,
  dbUtils,
);


const app = express();
app.use(cors({
  origin: '*',
  credentials: true
}));

// bodyparser x-form, enable it if needed
// app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());


app.use(
  '/auth',
  new GoogleOAuthHTTPHandler(
    process.env.GOOGLE_CLIENT_ID as string,
    process.env.GOOGLE_CLIENT_SECRET as string,
    process.env.GOOGLE_OAUTH_CALLBACK_URL as string,
    jwtUtils,
    googleOAuthDomain).
    InitializeRoutes(),

  new MainAuthHTTPHandler(mainAuthDomain, jwtUtils).
    InitializeRoutes()
);
app.use('/users', new UserHTTPHandler(new UserDomain(userRepository, dbUtils, userSessionsRepository), jwtUtils).InitiateRoutes())
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
