
import { Request, Router, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { JWTUtils } from '../../../utils/utils';

class GoogleOAuthHTTPHandler {
  clientID: string;
  clientSecret: string;
  defaultCallbackURL: string;
  jwtUtils: JWTUtils;

  constructor(clientID: string, clientSecret: string, defaultCallbackURL: string, jwtUtils: JWTUtils) {
    this.clientID = clientID;
    this.clientSecret = clientSecret;
    this.defaultCallbackURL = defaultCallbackURL;
    this.jwtUtils = jwtUtils;
  }

  private initializePassport() {
    passport.use(new GoogleStrategy({
      clientID: this.clientID,
      clientSecret: this.clientSecret,
      callbackURL: this.defaultCallbackURL
    }, async (accessToken, refreshToken, profile, done) => {
      const user: Express.User = {
        id: 0
      };
      done(null, user)
    }));


    passport.serializeUser((user, done) => {
      done(null, user.id);
    });


    passport.deserializeUser((id: number, done) => {

      const token = this.jwtUtils.GenerateToken({ id, account_type: 'GOOGLE' }, '1d')
      const user: Express.User = {
        id,
        accountType: 'GOOGLE',
        token
      };
      done(null, user);
    });
  }

  public InitializeRoutes() {
    this.initializePassport();
    const router = Router();
    router.get('/google', (req: Request, res: Response, next: NextFunction) => {
      const redirectUri = req.query.redirect_uri as string || this.defaultCallbackURL;
      this.handleGoogleAuth(req, res, next, redirectUri)
    }

    );
    router.get('/callback/google',
      passport.authenticate('google', { scope: ['profile', 'email'], failureRedirect: '/login' }),
      (req, res) => {
        this.handleGoogleAuthCallback(req, res)
      });
    return router;
  }


  private handleGoogleAuth(req: Request, res: Response, next: NextFunction, redirectUri: string) {
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      state: redirectUri,
    })(req, res, next);
  }

  private handleGoogleAuthCallback(req: Request, res: Response) {
    if (!req.query.state) {
      return res.redirect(this.defaultCallbackURL);
    }

    let finalRedirect = req.query.state as string;

    finalRedirect += `?access_token=${req.user?.token}`;
    res.redirect(finalRedirect);
  }

}

export default GoogleOAuthHTTPHandler