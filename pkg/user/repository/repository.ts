import pg from 'pg'

class UserRepository {
    DBClient: pg.Pool;

    constructor(dbCLient: pg.Pool) {
        this.DBClient = dbCLient;
    }

}

export default UserRepository;
