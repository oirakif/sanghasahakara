// AuthController.ts
import { Request, Router, Response } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { JWTUtils } from '../../../utils/utils';

class GoogleOAuthHTTPHandler {
  clientID: string;
  clientSecret: string;
  callbackURL: string;
  jwtUtils: JWTUtils;

  constructor(clientID: string, clientSecret: string, callbackURL: string, jwtUtils: JWTUtils) {
    this.clientID = clientID;
    this.clientSecret = clientSecret;
    this.callbackURL = callbackURL;
    this.jwtUtils = jwtUtils;
  }

  private initializePassport() {
    passport.use(new GoogleStrategy({
      clientID: this.clientID,
      clientSecret: this.clientSecret,
      callbackURL: this.callbackURL
    }, async (accessToken, refreshToken, profile, done) => {
      const user: Express.User = {
        id: 0
      };
      done(null, user)
    }));

    // Serialize user to store in session
    passport.serializeUser((user, done) => {
      done(null, user.id); // Store only user ID
    });

    // Deserialize user from session
    passport.deserializeUser((id: number, done) => {
      // Here you can fetch the user from the database by ID
      const token = this.jwtUtils.GenerateToken({ id, account_type: 'GOOGLE' }, '1d')
      const user: Express.User = {
        id,
        accountType: 'GOOGLE',
        token
      };
      done(null, user); // Pass the user object
    });
  }

  public InitializeRoutes() {
    this.initializePassport();
    const router = Router();
    router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }),);
    router.get('/callback/google', passport.authenticate('google', { failureRedirect: '/login' }), this.handleOAuthGoogleLogin);
    return router;
  }

  private handleOAuthGoogleLogin(req: Request, res: Response) {

    res.redirect(`/user/profile?access_token=${req.user?.token}`);
  }
}

export default GoogleOAuthHTTPHandler