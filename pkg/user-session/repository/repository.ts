import pg from 'pg'
import { UserSessionsFilterQuery, UserSessions } from '../model/model';

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
        let query = `SELECT COUNT(${countIndex}) AS userSessionsCount FROM user_sessions`
        if (filterQuery.id) {
            whereClauses.push(`id = $${whereClauses.length + 1}`);
            args.push(filterQuery.id);
        }

        filterQuery.customFilters?.forEach((filter) => {
            filter.replaceAll('?', whereClauses.length + 1)
            whereClauses.push(`${filter} ${whereClauses.length + 1}`)
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
            return Number(queryRes.rows[0].usersCount);
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

    public async AggregateDailyActiveUser(daysInterval: number): Promise<number> {
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
}

export default UserSessionsRepository;
