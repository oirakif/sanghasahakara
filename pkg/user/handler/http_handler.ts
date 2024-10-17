import { Router } from 'express';

class UserHTTPHandler {
  constructor() {

  }

  initiateRoutes(): Router {
    const router = Router();
    router.get('/profile', (req, res) => {
      if (req.isAuthenticated()) {
        res.send(`Hello, ${req.user?.displayName}`);
      } else {
        res.redirect('/login');
      }
    });

    return router;
  }
}

export default UserHTTPHandler
