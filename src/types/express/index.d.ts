import { JwtPayload } from "../../controllers/user.controller";

declare global {
  namespace Express {
    export interface Request {
      user?: JwtPayload['user'];
    }
  }
}
