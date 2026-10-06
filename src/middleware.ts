import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';

import { JWT_PASSWORD } from './config.js';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const userMiddleware = (req : Request, res: Response, next: NextFunction) => {
    const header = req.headers["authorization"];
    const decoded = jwt.verify(header as string, JWT_PASSWORD)
    if (decoded) {
        //@ts-ignore
        req.userId = decoded.id
        next()
    } else {
        res.status(403).json({
            message: "You are not logged in",
        });
    }
}

// override the types of the express request object