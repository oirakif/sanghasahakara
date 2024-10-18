import pg from 'pg'
import { UsersEmailVerification } from '../model/model';

class UsersEmailVerificationRepository {
    DBClient: pg.Pool;

    constructor(dbCLient: pg.Pool) {
        this.DBClient = dbCLient;
    }

    async InsertUsersEmailVerification(payload: UsersEmailVerification): Promise<[number, string]> {
        const args: any[] = []
        let query = `INSERT INTO users_email_verifications (user_id,token,expires_at,created_at) VALUES($1,$2,$3,$4)`
        args.push(
            payload.user_id,
            payload.token,
            payload.expires_at,
            payload.created_at,
        )

        try {
            const res = await this.DBClient.query(query, args)
            return [0, '']
        }
        catch (err) {
            console.log(err)

            return [0, err as string]
        }
    }
}

export default UsersEmailVerificationRepository;
