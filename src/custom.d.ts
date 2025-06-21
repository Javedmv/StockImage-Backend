import { User as CustomUser } from './models/user.model';

declare global {
  namespace Express {
    interface Request {
      user?: CustomUser;
    }
  }
}
