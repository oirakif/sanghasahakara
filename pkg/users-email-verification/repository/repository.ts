import pg from 'pg'
import { UsersEmailVerification, UsersEmailVerificationFilterQuery } from '../model/model';

class UsersEmailVerificationRepository {
    DBClient: pg.Pool;

    constructor(dbCLient: pg.Pool) {
        this.DBClient = dbCLient;
    }

    public async InsertUsersEmailVerification(payload: UsersEmailVerification) {
        const args: any[] = []
        let query = `INSERT INTO users_email_verifications (user_id,token,expires_at,created_at) VALUES($1,$2,$3,$4)`
        args.push(
            payload.user_id,
            payload.token,
            payload.expires_at,
            payload.created_at,
        )

        try {
            await this.DBClient.query(query, args)
        }
        catch (err) {
            console.error(err);
            throw (err);
        }
    }

    public async GetUsersEmailVerification(filterQuery: UsersEmailVerificationFilterQuery): Promise<UsersEmailVerification[]> {
        const args: any[] = []
        const whereClauses: string[] = []
        let query = `SELECT id,user_id,token,expires_at,created_at FROM users_email_verifications u`
        if (filterQuery.id) {
            whereClauses.push(`id = $${whereClauses.length + 1}`);
            args.push(filterQuery.id);
        }

        if (filterQuery.user_id) {
            whereClauses.push(`user_id = $${whereClauses.length + 1}`);
            args.push(filterQuery.user_id);
        }

        if (filterQuery.token) {
            whereClauses.push(`token = $${whereClauses.length + 1}`);
            args.push(filterQuery.token);
        }

        if (filterQuery.expires_at_GT) {
            whereClauses.push(`expires_at > $${whereClauses.length + 1}`);
            args.push(filterQuery.expires_at_GT);
        }


        if (whereClauses.length > 0) {
            query += ` WHERE ` + whereClauses.join(' AND ');
        }
        try {
            const queryRes = await this.DBClient.query(query, args)
            if (queryRes.rows.length === 0) {
                return [];
            }

            const result: UsersEmailVerification[] = queryRes.rows
            return result;
        }
        catch (err) {
            console.error(err);
            throw err;
        }
    }


    public async UpdateUsersEmailVerification(filterQuery: UsersEmailVerificationFilterQuery, payload: UsersEmailVerification) {
        const args: any[] = []
        const updateClauses: any[] = []
        const whereClauses: any[] = []

        let query = `UPDATE users_email_verifications`

        // set update clause
        if (payload.is_used) {
            updateClauses.push(`is_used = $${args.length + 1}`);
            args.push(
                payload.is_used)
        };
        if (payload.updated_at) {
            updateClauses.push(`updated_at = $${args.length + 1}`);
            args.push(
                payload.updated_at)
        };

        if (args.length === 0) {
            return 'no update payload specified';
        }

        query += ` SET ` + updateClauses.join(' , ');

        // set where clause
        if (filterQuery.user_id) {
            whereClauses.push(`user_id = $${args.length + 1}`);
            args.push(filterQuery.user_id);
        }

        if (filterQuery.token) {
            whereClauses.push(`token = $${args.length + 1}`);
            args.push(filterQuery.token);
        }

        if (filterQuery.id) {
            whereClauses.push(`id = $${args.length + 1}`);
            args.push(filterQuery.id);
        }

        query += ` WHERE ` + whereClauses.join(' AND ');
        try {
            await this.DBClient.query(query, args)
        }
        catch (err) {
            console.error(err);

            throw (err);
        }
    }
}

export default UsersEmailVerificationRepository;
