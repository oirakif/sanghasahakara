// AuthController.ts
import { Request, Router, Response } from 'express';
import { LoginPayloadSchema, RegisterPayloadSchema } from '../model/model';
import MainAuthDomain from '../domain/domain';

class MainAuthHTTPHandler {
  mainAuthDomain: MainAuthDomain;
  constructor(mainAuthDomain: MainAuthDomain) {
    this.mainAuthDomain = mainAuthDomain;
  }


  public InitializeRoutes() {
    const router = Router();
    router.post('/main/login', (req, res) => { this.handleLogin(req, res) });
    router.post('/main/register', (req, res) => { this.handleRegister(req, res) });
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
}

export default MainAuthHTTPHandler