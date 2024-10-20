// AuthController.ts
import { Request, NextFunction, Router, Response } from 'express';
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
  frontendURL: string;

  constructor(clientID: string, clientSecret: string, callbackURL: string, jwtUtils: JWTUtils, googleOAuthDomain: GoogleOAuthDomain, frontendURL: string) {
    this.clientID = clientID;
    this.clientSecret = clientSecret;
    this.callbackURL = callbackURL;
    this.jwtUtils = jwtUtils;
    this.googleOAuthDomain = googleOAuthDomain;
    this.frontendURL = frontendURL;
  }

  private initializePassport() {
    passport.use(new GoogleStrategy({
      clientID: this.clientID,
      clientSecret: this.clientSecret,
      callbackURL: this.callbackURL
    }, async (accessToken, refreshToken, profile, done) => {
      const email = profile.emails?.[0]?.value || '';
      const displayName = profile.displayName || '';
  
      // Get user ID and token
      const [userID, token] = await this.googleOAuthDomain.ProcessGoogleOAuthLogin(email, displayName);
  
      const user: Express.User = {
        id: userID,
        email,
        displayName,
        token // Include token for later use
      };
  
      done(null, user);
    }));

    passport.serializeUser((user: Express.User, done) => {
      done(null, user);
    });

    passport.deserializeUser(async (user: Express.User, done) => {
      done(null, user); // Pass the entire object back, now including id and token
    });
  }

  public InitializeRoutes() {
    this.initializePassport();
    const router = Router();
    router.get('/google', (req: Request, res: Response, next: NextFunction) => {
      const finalRedirect: string = (req.query.redirect_uri as string) || '/default-portal';

      passport.authenticate('google', {
        scope: ['profile', 'email'],
        state: finalRedirect
      })(req, res, next);
    });

    router.get('/callback/google', (req: Request, res: Response, next: NextFunction) => {
      // Handle the Google authentication response
      passport.authenticate('google', { failureRedirect: this.frontendURL }, (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.redirect(this.frontendURL); // Redirect if user is not found

        // Store user info in the session
        req.logIn(user, (err) => {
          if (err) return next(err);

          // Now, `req.user` should have the user information
          this.handleOAuthGoogleLogin(req, res);
        });
      })(req, res, next);
    });
    return router;
  }

  private handleOAuthGoogleLogin(req: Request, res: Response) {
    const finalRedirect = req.query.state || this.frontendURL;
    const token = req.user?.token;
    res.redirect(`${finalRedirect}?access_token=${token}`);
  }
}

export default GoogleOAuthHTTPHandler