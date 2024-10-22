// AuthController.ts
import { Request, Router, Response } from 'express';
import { LoginPayloadSchema, RegisterPayloadSchema, VerifyEmailQuerySchema, ResetPasswordPayloadSchema } from '../model/model';
import MainAuthDomain from '../domain/domain';
import { JWTUtils } from '../../../utils/utils';
import jwt from 'jsonwebtoken';

class MainAuthHTTPHandler {
  mainAuthDomain: MainAuthDomain;
  jwtUtils: JWTUtils;
  constructor(mainAuthDomain: MainAuthDomain, jwtUtils: JWTUtils) {
    this.mainAuthDomain = mainAuthDomain;
    this.jwtUtils = jwtUtils;
  }


  public InitializeRoutes() {
    const router = Router();
    router.post('/main/login', (req, res) => { this.handleLogin(req, res) });
    router.post('/main/logout',
      (req, res, next) => {
        this.jwtUtils.AuthenticateJWT(req, res, next)
      },
      (req, res) => { this.handleLogout(req, res) });
    router.post('/main/register', (req, res) => { this.handleRegister(req, res) });
    router.get('/main/email/verify', (req, res) => { this.handleVerifyEmail(req, res) });
    router.post('/main/password/reset',
      (req, res, next) => {
        this.jwtUtils.AuthenticateJWT(req, res, next)
      },
      (req, res) => { this.handleResetPassword(req, res) });
    return router;
  }

  private async handleLogin(req: Request, res: Response) {
    const { email, password } = req.body
    const { error } = LoginPayloadSchema.validate({ email, password });
    if (error) {
      const message = {
        error: true,
        message: error.details[0].message
      }
      res.status(400).json(
        message
      )
      return;
    }

    const [successWrapper, errWrapper] = await this.mainAuthDomain.LoginUser(email, password)
    if (errWrapper.statusCode) {
      res.
        status(errWrapper.statusCode).
        json(errWrapper)
      return
    }
    res.status(successWrapper.statusCode).json(successWrapper)
  }

  private async handleLogout(req: Request, res: Response) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'unauthorized' });
    }

    const token = authHeader.split(" ")[1];

    const decodedToken = jwt.decode(token) as { jti?: string; id?: number } | null;
    if (!decodedToken || !decodedToken.jti || !decodedToken.id) {
      return res.status(401).json({ message: 'unauthorized' });
    }

    const [successWrapper, errWrapper] = await this.mainAuthDomain.LogoutUser(decodedToken.jti, decodedToken.id)
    if (errWrapper.statusCode) {
      res.
        status(errWrapper.statusCode).
        json(errWrapper)
      return
    }
    res.status(successWrapper.statusCode).json(successWrapper)
  }

  private async handleRegister(req: Request, res: Response) {
    const { email, password, display_name: displayName } = req.body
    const { error } = RegisterPayloadSchema.validate({ email, password, display_name: displayName });
    if (error) {
      const message = {
        error: true,
        message: error.details[0].message
      }
      res.status(400).json(
        message
      )
      return;
    }

    const [successWrapper, errWrapper] = await this.mainAuthDomain.RegisterUser(email, password, displayName)
    if (errWrapper.statusCode) {
      res.
        status(errWrapper.statusCode).
        json(errWrapper)
      return
    }
    res.status(successWrapper.statusCode).json(successWrapper)
  }

  private async handleResetPassword(req: Request, res: Response) {
    const id = req.user?.id;
    const { oldPassword, newPassword } = req.body
    const { error } = ResetPasswordPayloadSchema.validate({ oldPassword, newPassword });
    if (error) {
      const message = {
        error: true,
        message: error.details[0].message
      }
      res.status(400).json(
        message
      )
      return;
    }

    const [successWrapper, errWrapper] = await this.mainAuthDomain.ResetPassword(id as number, oldPassword, newPassword)
    if (errWrapper.statusCode) {
      res.
        status(errWrapper.statusCode).
        json(errWrapper)
      return
    }
    res.status(successWrapper.statusCode).json(successWrapper)
  }


  private async handleVerifyEmail(req: Request, res: Response) {
    const { user_id, token } = req.query
    const userIDInt = parseInt(user_id as string)
    const { error } = VerifyEmailQuerySchema.validate({ user_id: userIDInt, token });
    if (error) {
      const message = {
        error: true,
        message: error.details[0].message
      }
      res.status(400).json(
        message
      )
      return;
    }

    const [successWrapper, errWrapper] = await this.mainAuthDomain.verifyEmail(userIDInt, token as string)
    if (errWrapper.statusCode) {
      res.
        status(errWrapper.statusCode).
        json(errWrapper)
      return
    }
    res.status(successWrapper.statusCode).json(successWrapper)
  }

}

export default MainAuthHTTPHandler