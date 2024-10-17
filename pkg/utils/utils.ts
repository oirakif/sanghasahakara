import jwt from 'jsonwebtoken';


class JWTUtils {
    secret: string;
    constructor(secret: string) {
        this.secret = secret;
    }

    generateToken(payload: object, expiryTime: string) {
        const token = jwt.sign(payload, this.secret, {
            expiresIn: expiryTime,
        });
        return token;
    }

}

export { JWTUtils } 