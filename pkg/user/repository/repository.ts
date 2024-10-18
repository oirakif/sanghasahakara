import pg from 'pg'
import { UserFilterQuery, User } from '../model/model';

class UserRepository {
    DBClient: pg.Pool;

    constructor(dbCLient: pg.Pool) {
        this.DBClient = dbCLient;
    }

    public async GetUsersList(filterQuery: UserFilterQuery): Promise<[User[], string]> {
        const args: any[] = []
        const whereClauses: string[] = []
        let query = `SELECT id,email,is_email_verified,account_type,status,created_at,updated_at FROM users u`
        if (filterQuery.id) {
            whereClauses.push(`id = $${whereClauses.length + 1}`);
            args.push(filterQuery.id);
        }

        if (filterQuery.password_hash) {
            whereClauses.push(`password_hash = $${whereClauses.length + 1}`);
            args.push(filterQuery.password_hash);
        }

        if (filterQuery.email) {
            whereClauses.push(`email = $${whereClauses.length + 1}`);
            args.push(filterQuery.email);
        }

        if (filterQuery.is_verified) {
            whereClauses.push(`is_verified = $${whereClauses.length + 1}`);
            args.push(filterQuery.is_verified);
        }

        if (filterQuery.status) {
            whereClauses.push(`status = $${whereClauses.length + 1}`);
            args.push(filterQuery.status);
        }

        if (whereClauses.length > 0) {
            query += ` WHERE ` + whereClauses.join(' AND ');
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


    public async InsertUser(newUser: User): Promise<[number, string]> {
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


    public async UpdateUser(filterQuery: UserFilterQuery, payload: User): Promise<string> {
        const args: any[] = []
        const updateClauses: any[] = []
        const whereClauses: any[] = []

        let query = `UPDATE users`

        // set update clause
        if (payload.display_name) {
            updateClauses.push(`display_name = $${args.length + 1}`);
            args.push(
                payload.display_name)
        };
        if (payload.password_hash) {
            updateClauses.push(`password_hash = $${args.length + 1}`);
            args.push(
                payload.password_hash)
        };

        if (args.length === 0) {
            return 'no update payload specified';
        }

        query += ` SET ` + updateClauses.join(' AND ');
        // set where clause
        if (filterQuery.id) {
            whereClauses.push(`id = $${args.length + 1}`);
            args.push(filterQuery.id);
        }

        query += ` WHERE ` + whereClauses.join(' AND ');
        try {
            const res = await this.DBClient.query(query, args)
            return ''
        }
        catch (err) {
            console.log(err)

            return err as string
        }
    }
}

export default UserRepository;
