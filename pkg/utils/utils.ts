import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express'
import { User } from '../user/model/model';
import { Pool } from 'pg';
import RedisRepository from '../redis/repository/repository';
import { v4 as uuidv4 } from 'uuid';

class JWTUtils {
    secret: string;
    redisClientRepository: RedisRepository;
    constructor(secret: string, redisClientRepository: RedisRepository) {
        this.secret = secret;
        this.redisClientRepository = redisClientRepository;
    }

    public GenerateToken(payload: object, expiryTime: string) {
        const token = jwt.sign(payload, this.secret, {
            expiresIn: expiryTime,
        });
        return token;
    }
    public async AuthenticateJWT(req: Request, res: Response, next: NextFunction) {
        const token: string = req.headers.authorization?.split('Bearer ')[1] as string;

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const decodedToken = jwt.decode(token) as { jti?: string, exp?: number } | null;

        if (!decodedToken) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if(!decodedToken.jti){
            return res.status(401).json({ message: 'Unauthorized' });   
        }
        const blacklisted: string = await this.redisClientRepository.Get(decodedToken.jti as string)
        if (blacklisted) {
            return res.status(401).json({ message: 'Unauthorized' });   
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

function NewUUID(): string {
    return uuidv4();
}

function CalculateOffset(page: number, perPage: number): number {
    return (page - 1) * perPage
}

function SHA256hash(plaintext: string): string {
    return crypto.createHash('sha256').update(plaintext).digest('hex');
}

export { JWTUtils, DBUtils, SHA256hash, NewUUID, CalculateOffset } 