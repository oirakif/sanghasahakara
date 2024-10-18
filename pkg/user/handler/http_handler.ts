import { Router, Request, Response } from 'express';
import UserDomain from '../domain/domain';
import UserRepository from '../repository/repository';
import { JWTUtils } from '../../utils/utils';

class UserHTTPHandler {
  userDomain: UserDomain;
  jwtUtils: JWTUtils;
  constructor(userDomain: UserDomain, jwtUtils: JWTUtils) {
    this.userDomain = userDomain;
    this.jwtUtils = jwtUtils;
  }

  InitiateRoutes(): Router {
    const router = Router();

    router.get('/profile/me',
      (req, res, next) => {
        this.jwtUtils.AuthenticateJWT(req, res, next)
      },
      (req, res) => {
        this.getMyProfile(req, res)
      });

    return router;
  }

  private async getMyProfile(req: Request, res: Response) {

    const id = req.user?.id
    const [successWrapper, errWrapper] = await this.userDomain.GetUser(id as number)
    if (errWrapper.statusCode) {
      res.
        status(errWrapper.statusCode).
        json(errWrapper)
      return
    }
    res.status(successWrapper.statusCode).json(successWrapper)
  }

}

export default UserHTTPHandler
