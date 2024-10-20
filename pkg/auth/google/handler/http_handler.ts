// AuthController.ts
import { Request, Router, Response } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { JWTUtils } from '../../../utils/utils';
import GoogleOAuthDomain from '../domain/domain';

class GoogleOAuthHTTPHandler {
  clientID: string;
  clientSecret: string;
  callbackURL: string;
  jwtUtils: JWTUtils;
  googleOAuthDomain: GoogleOAuthDomain;

  constructor(clientID: string, clientSecret: string, callbackURL: string, jwtUtils: JWTUtils, googleOAuthDomain: GoogleOAuthDomain) {
    this.clientID = clientID;
    this.clientSecret = clientSecret;
    this.callbackURL = callbackURL;
    this.jwtUtils = jwtUtils;
    this.googleOAuthDomain = googleOAuthDomain;
  }

  private initializePassport() {
    passport.use(new GoogleStrategy({
      clientID: this.clientID,
      clientSecret: this.clientSecret,
      callbackURL: this.callbackURL
    }, async (accessToken, refreshToken, profile, done) => {
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : undefined;
      const user: Express.User = {
        email,
        displayName: profile.displayName,
      };
      done(null, user)
    }));

    // Serialize user to store in session
    passport.serializeUser((user, done) => {
      done(null, user); // Store only user ID
    });

    // Deserialize user from session
    passport.deserializeUser(async (user: Express.User, done) => {
      // Here you can fetch the user from the database by ID
      const [userID, token] = await this.googleOAuthDomain.ProcessGoogleOAuthLogin(user.email as string, user.displayName as string)
      user.id = userID;
      user.token = token
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