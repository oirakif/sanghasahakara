import UserRepository from '../../../user/repository/repository';
import { UserFilterQuery, User } from '../../../user/model/model';
import { DBUtils, JWTUtils, SHA256hash, NewUUID } from '../../../utils/utils'
import { ErrorResponse, SuccessResponse } from '../../../wrapper/wrapper'
import EmailRepository from '../../../email/repository/repository';
import UsersEmailVerificationRepository from '../../../users-email-verification/repository/repository';
import moment from 'moment';
import { UsersEmailVerification, UsersEmailVerificationFilterQuery } from '../../../users-email-verification/model/model';
import { UserSessions } from '../../../user-session/model/model';
import UserSessionsRepository from '../../../user-session/repository/repository';
import RedisRepository from '../../../redis/repository/repository';

class MainAuthDomain {
    userRepository: UserRepository;
    emailRepository: EmailRepository;
    usersEmailVerificationRepository: UsersEmailVerificationRepository;
    userSessionsRepository: UserSessionsRepository;
    redisRepository: RedisRepository;
    jwtUtils: JWTUtils;
    mainServiceURL: string;
    dbUtils: DBUtils;
    constructor(
        userRepository: UserRepository,
        emailRepository: EmailRepository,
        usersEmailVerificationRepository: UsersEmailVerificationRepository,
        userSessionsRepository: UserSessionsRepository,
        redisRepository: RedisRepository,
        jwtUtils: JWTUtils,
        dbUtils: DBUtils,
        mainServiceURL: string) {
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
        this.dbUtils = dbUtils;
        this.emailRepository = emailRepository;
        this.redisRepository = redisRepository;
        this.mainServiceURL = mainServiceURL;
        this.usersEmailVerificationRepository = usersEmailVerificationRepository;
        this.userSessionsRepository = userSessionsRepository;
    }

    public async LoginUser(email: string, password: string): Promise<[SuccessResponse, ErrorResponse]> {
        const hashedPassword = SHA256hash(password)
        const filterQuery: UserFilterQuery = <UserFilterQuery>{
            email,
            password_hash: hashedPassword,
            limit: 1,
            offset: 0
        }

        try {
            const retrievedUser = await this.userRepository.GetUsersList(filterQuery)

            if (retrievedUser.length == 0) {
                return [<SuccessResponse>{}, <ErrorResponse>{
                    statusCode: 404,
                    message: 'invalid email address or password'
                }]
            }
            const targetUser = retrievedUser[0]
            targetUser.login_count = targetUser.login_count + 1;
            await this.userRepository.UpdateUser(filterQuery, targetUser)
            const jti = NewUUID();
            const token = this.jwtUtils.GenerateToken({ ...retrievedUser[0], jti }, '1d')
            return [<SuccessResponse>{
                statusCode: 200,
                message: 'login successful',
                token
            }, <ErrorResponse>{}]
        } catch (error) {
            return [<SuccessResponse>{}, <ErrorResponse>{
                statusCode: 500,
                message: 'error occured in login process'
            }]
        }
    }


    public async LogoutUser(jwtID: string, userID: number): Promise<[SuccessResponse, ErrorResponse]> {
        try {
            await this.redisRepository.Set(jwtID, "blacklisted", 60 * 60 * 24);
            const filter: UserFilterQuery = <UserFilterQuery>{
                id: userID
            }
            const payload: User = <User>{
                logoutIncrement: 1
            }
            await this.userRepository.UpdateUser(filter, payload)

        } catch (error) {
            return [<SuccessResponse>{}, <ErrorResponse>{
                statusCode: 500,
                message: 'error on logging out user'
            }]
        }
        // Store the token ID in Redis

        return [<SuccessResponse>{ statusCode: 204 }, <ErrorResponse>{}]
    }


    public async RegisterUser(email: string, password: string, displayName: string): Promise<[SuccessResponse, ErrorResponse]> {
        const hashedPassword = SHA256hash(password)
        const filterQuery: UserFilterQuery = <UserFilterQuery>{
            email,
            limit: 1,
            offset: 0
        }
        const retrievedUser = await this.userRepository.GetUsersList(filterQuery)

        if (retrievedUser.length > 0) {
            return [<SuccessResponse>{}, <ErrorResponse>{
                statusCode: 404,
                message: 'email is already registered'
            }]
        }
        const currentTimestamp = new Date();
        const newUser: User = <User>{
            email,
            password_hash: hashedPassword,
            display_name: displayName,
            is_email_verified: false,
            account_type: 'MAIN',
            status: 'ACTIVE',
            login_count: 0,
            logout_count: 0,
            created_at: currentTimestamp,
            updated_at: currentTimestamp,
        }

        try {
            await this.dbUtils.InitTx();
            const newUserID = await this.userRepository.InsertUser(newUser)
            const token = this.jwtUtils.GenerateToken({ id: newUserID, account_type: 'MAIN' }, '30m')

            var expiresAt: Date = moment(currentTimestamp).add(30, 'm').toDate();
            const userEmailVerification: UsersEmailVerification = <UsersEmailVerification>{
                id: newUserID,
                token,
                user_id: newUserID,
                is_used: false,
                expires_at: expiresAt,
                created_at: currentTimestamp,
            }
            await this.usersEmailVerificationRepository.InsertUsersEmailVerification(userEmailVerification)
            const newUserSessions: UserSessions = <UserSessions>{
                user_id: newUserID,
                last_active: currentTimestamp,
                created_at: currentTimestamp,
            }
            await this.userSessionsRepository.InsertUserSession(newUserSessions)
            await this.dbUtils.CommitTx();
            const verifyLink = `${this.mainServiceURL}/auth/main/email/verify?user_id=${newUserID}&token=${token}`
            const emailContent =
                `<h1>Welcome, ${displayName}!</h1>
           <p>Please confirm your email by clicking the link below:</p>
           <a href="${verifyLink}">Confirm Your Email</a>`
            const a = this.emailRepository.SendEmail(
                'User Statistic Service',
                [email],
                'Email Verification',
                emailContent
            )

            return [
                <SuccessResponse>{
                    statusCode: 200,
                    message: 'register successful, verification email sent',
                },
                <ErrorResponse>{}]
        }
        catch (err) {
            await this.dbUtils.RollbackTx();
            return [
                <SuccessResponse>{},
                <ErrorResponse>{
                    statusCode: 500,
                    message: 'error occured while inserting new user'
                }]
        }

    }


    public async ResetPassword(id: number, oldPassword: string, newPassword: string): Promise<[SuccessResponse, ErrorResponse]> {
        if (oldPassword === newPassword) {
            return [<SuccessResponse>{}, <ErrorResponse>{
                statusCode: 409,
                message: 'identical old and new password'
            }]
        }
        const hashedOldPassword = SHA256hash(oldPassword)
        try {
            const filterQuery: UserFilterQuery = <UserFilterQuery>{
                id,
                password_hash: hashedOldPassword,
                limit: 1,
                offset: 0
            }
            const retrievedUser = await this.userRepository.GetUsersList(filterQuery)
            if (retrievedUser.length === 0) {
                return [<SuccessResponse>{}, <ErrorResponse>{
                    statusCode: 404,
                    message: 'incorrect password'
                }]
            }

            const hashedNewPassword: string = SHA256hash(newPassword)
            const currentTimestamp = new Date();
            const targetUser = retrievedUser[0];
            targetUser.password_hash = hashedNewPassword;
            targetUser.updated_at = currentTimestamp;
            await this.dbUtils.InitTx();
            await this.userRepository.UpdateUser(filterQuery, targetUser)

            await this.dbUtils.CommitTx();
            return [
                <SuccessResponse>{
                    statusCode: 204,
                },
                <ErrorResponse>{}]
        }
        catch (err) {
            await this.dbUtils.RollbackTx();
            return [
                <SuccessResponse>{},
                <ErrorResponse>{
                    statusCode: 500,
                    message: 'error occured while inserting new user'
                }]
        }
    }

    public async verifyEmail(userID: number, token: string): Promise<[SuccessResponse, ErrorResponse]> {
        const emailVerifFilterQuery: UsersEmailVerificationFilterQuery = <UsersEmailVerificationFilterQuery>{
            user_id: userID,
            token,
            is_used: false,
            limit: 1,
            offset: 0
        };


        try {
            await this.dbUtils.InitTx();
            const retrievedEmailVerif = await this.usersEmailVerificationRepository.GetUsersEmailVerification(emailVerifFilterQuery);
            if (retrievedEmailVerif.length == 0) {
                return [<SuccessResponse>{}, <ErrorResponse>{
                    statusCode: 404,
                    message: 'invalid token or token is expired'
                }]
            };
            const UserFilterQuery: UserFilterQuery = <UserFilterQuery>{
                id: userID,
                limit: 1,
                offset: 0
            };
            const retrievedUser = await this.userRepository.GetUsersList(UserFilterQuery);
            if (retrievedUser.length == 0) {
                return [<SuccessResponse>{}, <ErrorResponse>{
                    statusCode: 404,
                    message: 'invalid email address or password'
                }]
            };

            if (retrievedUser[0].is_email_verified) {
                return [<SuccessResponse>{}, <ErrorResponse>{
                    statusCode: 500,
                    message: 'error on validating user'
                }]
            };

            const currentTimestamp = new Date();
            const updateUserPayload: User = <User>{
                is_email_verified: true,
                updated_at: currentTimestamp
            }
            await this.userRepository.UpdateUser(UserFilterQuery, updateUserPayload)
            const updateUserVerificationPayload: UsersEmailVerification = <UsersEmailVerification>{
                is_used: true,
                updated_at: currentTimestamp
            }
            await this.usersEmailVerificationRepository.UpdateUsersEmailVerification(emailVerifFilterQuery, updateUserVerificationPayload);
            await this.dbUtils.CommitTx();
            return [<SuccessResponse>{
                statusCode: 200,
                message: 'user verify success',
            }, <ErrorResponse>{}]
        } catch (error) {
            await this.dbUtils.RollbackTx();
            return [
                <SuccessResponse>{},
                <ErrorResponse>{
                    statusCode: 500,
                    message: 'error occured while verifying user email'
                }]
        }
    }
}

export default MainAuthDomain