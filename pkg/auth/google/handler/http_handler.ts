// AuthController.ts
import { Request, Router, Response } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

class GoogleOAuthHTTPHandler {
  clientID: string;
  clientSecret: string;
  callbackURL: string;

  constructor(clientID: string, clientSecret: string, callbackURL: string) {
    this.clientID = clientID;
    this.clientSecret = clientSecret;
    this.callbackURL = callbackURL;
  }

  private initializePassport() {
    passport.use(new GoogleStrategy({
      clientID: this.clientID,
      clientSecret: this.clientSecret,
      callbackURL: this.callbackURL
    }, async (accessToken, refreshToken, profile, done) => {
      const user: Express.User = {
        id: profile.id,
        email: profile.emails?.[0].value,
        displayName: profile.displayName
      };
      done(null, user)
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
  }

  initializeRoutes() {
    this.initializePassport();
    const router = Router();
    router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }),);
    router.get('/callback/google', passport.authenticate('google', { failureRedirect: '/login' }), this.handleOAuthGoogleLogin);
    return router;
  }

  handleOAuthGoogleLogin(req: Request, res: Response) {
    res.redirect('/user/profile');
  }
}

export default GoogleOAuthHTTPHandler