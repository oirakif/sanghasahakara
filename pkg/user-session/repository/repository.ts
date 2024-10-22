import pg from 'pg'
import { UserSessionsFilterQuery, UserSessions, PopulatedUserSessions } from '../model/model';

class UserSessionsRepository {
    DBClient: pg.Pool;

    constructor(dbCLient: pg.Pool) {
        this.DBClient = dbCLient;
    }

    public async CountUserSessions(filterQuery: UserSessionsFilterQuery): Promise<number> {
        const args: any[] = []
        const whereClauses: string[] = []
        let countIndex = '*';
        if (filterQuery.countIndex) {
            countIndex = filterQuery.countIndex
        }
        let query = `SELECT CAST(COUNT(${countIndex}) AS INTEGER) AS user_sessions_count FROM user_sessions`
        if (filterQuery.id) {
            whereClauses.push(`id = $${whereClauses.length + 1}`);
            args.push(filterQuery.id);
        }

        filterQuery.customFilters?.forEach((filter) => {
            const replacedFilter = filter.replaceAll('?', `$${whereClauses.length + 1}`)
            whereClauses.push(`${replacedFilter}`)
        })

        filterQuery.customArgs?.forEach((arg) => {
            args.push(arg)
        })
        if (whereClauses.length > 0) {
            query += ` WHERE ` + whereClauses.join(' AND ');
        }

        try {
            const queryRes = await this.DBClient.query(query, args)
            if (queryRes.rows.length === 0) {
                return 0;
            }

            return queryRes.rows[0].user_sessions_count;
        }
        catch (err) {
            console.error(err);;
            throw (err);
        }
    }

    public async InsertUserSession(payload: UserSessions) {
        const args: any[] = []
        let query = `INSERT INTO user_sessions (user_id,last_active,created_at) VALUES($1,$2,$3);`
        args.push(
            payload.user_id,
            payload.last_active,
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

    public async UpdateUserSession(filterQuery: UserSessionsFilterQuery, payload: UserSessions) {
        const args: any[] = []
        const updateClauses: any[] = []
        const whereClauses: any[] = []
        let query = `UPDATE user_sessions`
        // set update clause
        if (payload.user_id) {
            updateClauses.push(`user_id = $${args.length + 1}`);
            args.push(
                payload.user_id)
        };
        if (payload.last_active) {
            updateClauses.push(`last_active = $${args.length + 1}`);
            args.push(
                payload.last_active)
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
        if (filterQuery.last_active) {
            whereClauses.push(`last_active = $${args.length + 1}`);
            args.push(filterQuery.last_active);
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

    public async AggregateActiveUser(daysInterval: number): Promise<number> {
        const query = `
        SELECT AVG(active_users) AS average_active_users
        FROM (
          SELECT COUNT(DISTINCT user_id) AS active_users
          FROM user_sessions us 
          WHERE last_active >= CURRENT_DATE - INTERVAL '${daysInterval} days'
        ) AS daily_active_users;
      `;
        try {
            const queryRes = await this.DBClient.query(query)
            if (queryRes.rows.length === 0) {
                return 0;
            }

            return Math.floor(queryRes.rows[0].average_active_users) as number;
        }
        catch (err) {
            console.error(err);;
            throw (err);
        }
    }

    public async PopulateActiveUser(daysInterval: number): Promise<PopulatedUserSessions[]> {
        const query = `
        SELECT
            DATE(last_active) AS day,
            CAST(COUNT(DISTINCT user_id) AS INTEGER) AS active_users_count
        FROM
            user_sessions us 
        WHERE
            last_active >= NOW() - INTERVAL '${daysInterval} days'
        GROUP BY
            DATE(last_active)
        ORDER BY
            day ASC;
      `;
        try {
            const queryRes = await this.DBClient.query(query)
            if (queryRes.rows.length === 0) {
                return [];
            }
            const result: PopulatedUserSessions[] = queryRes.rows
            return result;
        }
        catch (err) {
            console.error(err);;
            throw (err);
        }
    }
}

export default UserSessionsRepository;
