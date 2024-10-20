import pg from 'pg'
import { UserFilterQuery, User } from '../model/model';

class UserRepository {
    DBClient: pg.Pool;

    constructor(dbCLient: pg.Pool) {
        this.DBClient = dbCLient;
    }

    public async GetUsersList(filterQuery: UserFilterQuery): Promise<User[]> {
        const args: any[] = []
        const whereClauses: string[] = []
        let query = `SELECT id,email,is_email_verified,account_type,status,login_count,logout_count,created_at,updated_at FROM users u`
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

        query += ` LIMIT $${whereClauses.length + 1} OFFSET $${whereClauses.length + 2}`
        args.push(filterQuery.limit, filterQuery.offset)

        if (filterQuery.sortBy) {
            query += `ORDER BY ${whereClauses.length + 3} ${whereClauses.length + 4}`
            args.push(filterQuery.sortBy)
            if (filterQuery.sortOrder) {
                args.push(filterQuery.sortOrder)
            } else {
                args.push('DESC')
            }
        }
        try {
            const queryRes = await this.DBClient.query(query, args)
            if (queryRes.rows.length === 0) {
                return [];
            }

            const result: User[] = queryRes.rows
            return result;
        }
        catch (err) {
            console.error(err);;
            throw (err);
        }
    }


    public async InsertUser(newUser: User): Promise<number> {
        const args: any[] = []
        let query = `INSERT INTO users (email,password_hash,display_name,is_email_verified,account_type,status,login_count,logout_count,created_at,updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id;`
        args.push(
            newUser.email,
            newUser.password_hash,
            newUser.display_name,
            newUser.is_email_verified,
            newUser.account_type,
            newUser.status,
            newUser.login_count,
            newUser.logout_count,
            newUser.created_at,
            newUser.updated_at,
        )

        try {
            const res = await this.DBClient.query(query, args)
            return res.rows[0].id;
        }
        catch (err) {
            console.error(err);

            throw (err);
        }
    }


    public async UpdateUser(filterQuery: UserFilterQuery, payload: User) {
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

        if (payload.is_email_verified) {
            updateClauses.push(`is_email_verified = $${args.length + 1}`);
            args.push(
                payload.is_email_verified)
        };

        if (payload.login_count) {
            updateClauses.push(`login_count = $${args.length + 1}`);
            args.push(
                payload.login_count)
        };

        if (payload.logout_count) {
            updateClauses.push(`logout_count = $${args.length + 1}`);
            args.push(
                payload.logout_count)
        };

        if (payload.updated_at) {
            updateClauses.push(`updated_at = $${args.length + 1}`);
            args.push(
                payload.updated_at)
        };

        if (payload.logoutIncrement) {
            updateClauses.push(`logout_count = logout_count+$${args.length + 1}`);
            args.push(
                payload.logoutIncrement)
        };

        if (args.length === 0) {
            return 'no update payload specified';
        }

        query += ` SET ` + updateClauses.join(' , ');
        // set where clause
        if (filterQuery.id) {
            whereClauses.push(`id = $${args.length + 1}`);
            args.push(filterQuery.id);
        }
        if (filterQuery.email) {
            whereClauses.push(`email = $${args.length + 1}`);
            args.push(filterQuery.email);
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

    public async CountUsers(filterQuery: UserFilterQuery): Promise<number> {
        const args: any[] = []
        const whereClauses: string[] = []
        let countIndex = '*';
        if (filterQuery.countIndex) {
            countIndex = filterQuery.countIndex
        }
        let query = `SELECT COUNT(${countIndex}) AS users_count FROM users`
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
                return 0;
            }
            return Number(queryRes.rows[0].users_count);
        }
        catch (err) {
            console.error(err);;
            throw (err);
        }
    }
}

export default UserRepository;
