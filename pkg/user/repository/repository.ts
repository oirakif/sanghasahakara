import pg from 'pg'
import { GetUsersFilterQuery, User } from '../model/model';

class UserRepository {
    DBClient: pg.Pool;

    constructor(dbCLient: pg.Pool) {
        this.DBClient = dbCLient;
    }

    async GetUsersList(filterQuery: GetUsersFilterQuery): Promise<[User[], string]> {
        const args: any[] = []
        const conditions: string[] = []
        let query = `SELECT id,email,is_email_verified,account_type,status,created_at,updated_at FROM users u`
        if (filterQuery.id) {
            conditions.push(`id = $${conditions.length + 1}`);
            args.push(filterQuery.id);
        }

        if (filterQuery.password_hash) {
            conditions.push(`password_hash = $${conditions.length + 1}`);
            args.push(filterQuery.password_hash);
        }

        if (filterQuery.email) {
            conditions.push(`email = $${conditions.length + 1}`);
            args.push(filterQuery.email);
        }

        if (filterQuery.is_verified) {
            conditions.push(`is_verified = $${conditions.length + 1}`);
            args.push(filterQuery.is_verified);
        }

        if (filterQuery.status) {
            conditions.push(`status = $${conditions.length + 1}`);
            args.push(filterQuery.status);
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        try {
            const queryRes = await this.DBClient.query(query, args)
            if (queryRes.rows.length === 0) {
                return [[], '']
            }

            const result: User[] = queryRes.rows
            return [result, '']
        }
        catch (err) {
            console.log(err)

            return [[], err as string]
        }
    }


    async InsertUser(newUser: User): Promise<[number, string]> {
        const args: any[] = []
        let query = `INSERT INTO users (email,password_hash,display_name,is_email_verified,account_type,status,created_at,updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id;`
        args.push(
            newUser.email,
            newUser.password_hash,
            newUser.display_name,
            newUser.is_email_verified,
            newUser.account_type,
            newUser.status,
            newUser.created_at,
            newUser.updated_at,
        )

        try {
            const res = await this.DBClient.query(query, args)
            return [res.rows[0].id, '']
        }
        catch (err) {
            console.log(err)

            return [0, err as string]
        }
    }
}

export default UserRepository;
