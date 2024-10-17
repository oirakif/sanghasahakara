import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import dotenv from 'dotenv';

dotenv.config();

// Google Strategy example
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID as string,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  callbackURL: `${process.env.GOOGLE_OAUTH_CALLBACK_URL}`
}, (accessToken, refreshToken, profile, done) => {
  const user: Express.User = {
    id: profile.id,
    email: profile.emails?.[0].value,
    displayName: profile.displayName
  };
  done(null, user);
}));

// Serialize user to store in session
passport.serializeUser((user, done) => {
  done(null, user.id); // Store only user ID
});

// Deserialize user from session
passport.deserializeUser((id: string, done) => {
  // Here you can fetch the user from the database by ID
  const user: Express.User = {
    id,
    email: "user@example.com", // Retrieve email from DB if needed
    displayName: "User Name"
  };
  done(null, user); // Pass the user object
});
