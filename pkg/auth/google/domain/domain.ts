import UserRepository from '../../../user/repository/repository';
import { UserFilterQuery, User } from '../../../user/model/model';
import { DBUtils, JWTUtils, NewUUID } from '../../../utils/utils'
import UserSessionsRepository from '../../../user-session/repository/repository';
import { UserSessions } from '../../../user-session/model/model';

class GoogleOAuthDomain {
    userRepository: UserRepository;
    userSessionsRepository: UserSessionsRepository;
    jwtUtils: JWTUtils;
    dbUtils: DBUtils;
    constructor(
        userRepository: UserRepository,
        userSessionsRepository: UserSessionsRepository,
        jwtUtils: JWTUtils,
        dbUtils: DBUtils,) {
        this.userRepository = userRepository;
        this.userSessionsRepository = userSessionsRepository;
        this.jwtUtils = jwtUtils;
        this.dbUtils = dbUtils;
    }

    public async ProcessGoogleOAuthLogin(email: string, displayName: string): Promise<[number, string]> {
        const filterQuery: UserFilterQuery = <UserFilterQuery>{
            email,
            limit: 1,
            offset: 0
        }

        try {
            await this.dbUtils.InitTx();
            const retrievedUser = await this.userRepository.GetUsersList(filterQuery)
            const jti = NewUUID();
            if (retrievedUser.length > 0) {
                return [retrievedUser[0].id, this.jwtUtils.GenerateToken({ ...retrievedUser[0], jti }, '1d')]
            }

            const currentTimestamp = new Date();
            const newUser: User = <User>{
                email,
                display_name: displayName,
                password_hash: 'GOOGLE_AUTH_LOGIN',
                is_email_verified: true,
                account_type: 'GOOGLE',
                status: 'ACTIVE',
                login_count: 0,
                logout_count: 0,
                created_at: currentTimestamp,
                updated_at: currentTimestamp,
            }

            const newUserID = await this.userRepository.InsertUser(newUser)

            const newUserSessions: UserSessions = <UserSessions>{
                user_id: newUserID,
                last_active: currentTimestamp,
                created_at: currentTimestamp,
            }
            await this.userSessionsRepository.InsertUserSession(newUserSessions)
            await this.dbUtils.CommitTx();
            newUser.password_hash = '';
            const token = this.jwtUtils.GenerateToken({ ...newUser, jti }, '1d');
            return [newUserID, token];
        } catch (error) {
            await this.dbUtils.RollbackTx();
            return [0, ''];
        }
    }

}

export default GoogleOAuthDomain