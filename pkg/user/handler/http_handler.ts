import { Router, Request, Response } from 'express';
import UserDomain from '../domain/domain';
import { JWTUtils } from '../../utils/utils';
import { GetUserStatisticsQuerySchema } from '../model/model';

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

    router.get('/list',
      (req, res, next) => {
        this.jwtUtils.AuthenticateJWT(req, res, next)
      },
      (req, res) => {
        this.getUsersList(req, res)
      });

    router.get('/statistics',
      (req, res, next) => {
        this.jwtUtils.AuthenticateJWT(req, res, next)
      },
      (req, res) => {
        this.getUserStatistics(req, res)
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


  private async getUsersList(req: Request, res: Response) {
    const { page, per_page, sort_by, sort_order } = req.query
    const pageInt = parseInt(page as string) || 1
    const perPageInt = parseInt(per_page as string) || 25
    const [successWrapper, errWrapper] = await this.userDomain.GetUsersList(
      pageInt,
      perPageInt,
      sort_by as string,
      sort_order as string
    )
    if (errWrapper.statusCode) {
      res.
        status(errWrapper.statusCode).
        json(errWrapper)
      return
    }
    res.status(successWrapper.statusCode).json(successWrapper)
  }

  private async getUserStatistics(req: Request, res: Response) {
    const { active_sessions_interval } = req.query
    const { error } = GetUserStatisticsQuerySchema.validate({ active_sessions_interval });
    const activeSessionIntervalInt = parseInt(active_sessions_interval as string)
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
    const [successWrapper, errWrapper] = await this.userDomain.AggregateUserStatistics(activeSessionIntervalInt)
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
