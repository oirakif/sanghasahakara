import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express'
import { User } from '../user/model/model';
import { Pool } from 'pg';

class JWTUtils {
    secret: string;
    constructor(secret: string) {
        this.secret = secret;
    }

    public GenerateToken(payload: object, expiryTime: string) {
        const token = jwt.sign(payload, this.secret, {
            expiresIn: expiryTime,
        });
        return token;
    }
    public AuthenticateJWT(req: Request, res: Response, next: NextFunction) {
        const token = req.headers.authorization?.split('Bearer ')[1]; // Extract token from the Authorization header

        if (!token) {
            return res.status(401).json({ message: 'Missing access token' });
        }

        // Verify the JWT token
        jwt.verify(token, this.secret, (err, user) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid token' });
            }

            // Attach user data to request object
            req.user = user as User;
            next();
        });
    }
}


class DBUtils {
    dbClient: Pool;
    constructor(dbClient: Pool) {
        this.dbClient = dbClient;
    }

    public async InitTx(): Promise<string> {
        try {
            await this.dbClient.query('BEGIN');
            return '';
        } catch (error) {
            console.error(error)
            throw (error);
        }

    }
    public async CommitTx(): Promise<string> {
        try {
            await this.dbClient.query('COMMIT');
            return '';
        } catch (error) {
            throw (error);
        }
    }
    public async RollbackTx(): Promise<string> {
        try {
            await this.dbClient.query('ROLLBACK');
            return '';
        } catch (error) {
            throw (error);
        }
    }
}


function SHA256hash(plaintext: string): string {
    return crypto.createHash('sha256').update(plaintext).digest('hex');
}
export { JWTUtils, DBUtils, SHA256hash } 