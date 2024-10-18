import UserRepository from '../../../user/repository/repository';
import { GetUsersFilterQuery, User } from '../../../user/model/model';
import { DBUtils, JWTUtils, SHA256hash } from '../../../utils/utils'
import { ErrorResponse, SuccessResponse } from '../../../wrapper/wrapper'
import EmailRepository from '../../../email/repository/repository';
import UsersEmailVerificationRepository from '../../../users-email-verification/repository/repository';
import { Pool } from 'pg';
import moment from 'moment';
import { UsersEmailVerification } from '../../../users-email-verification/model/model';

class MainAuthDomain {
    userRepository: UserRepository;
    emailRepository: EmailRepository;
    usersEmailVerificationRepository: UsersEmailVerificationRepository;
    jwtUtils: JWTUtils;
    mainServiceURL: string;
    dbUtils: DBUtils;
    constructor(
        userRepository: UserRepository,
        emailRepository: EmailRepository,
        usersEmailVerificationRepository: UsersEmailVerificationRepository,
        jwtUtils: JWTUtils,
        dbUtils: DBUtils,
        mainServiceURL: string) {
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
        this.dbUtils = dbUtils;
        this.emailRepository = emailRepository;
        this.mainServiceURL = mainServiceURL;
        this.usersEmailVerificationRepository = usersEmailVerificationRepository;
    }

    public async LoginUser(email: string, password: string): Promise<[SuccessResponse, ErrorResponse]> {
        const hashedPassword = SHA256hash(password)
        const filterQuery: GetUsersFilterQuery = <GetUsersFilterQuery>{
            email,
            password_hash: hashedPassword,
            limit: 1,
            offset: 1
        }
        const [retrievedUser, err] = await this.userRepository.GetUsersList(filterQuery)
        if (err != '') {
            return [<SuccessResponse>{}, <ErrorResponse>{
                statusCode: 500,
                message: 'error on validating user'
            }]
        }

        if (retrievedUser.length == 0) {
            return [<SuccessResponse>{}, <ErrorResponse>{
                statusCode: 404,
                message: 'invalid email address or password'
            }]
        }
        const token = this.jwtUtils.GenerateToken({ id: retrievedUser[0].id }, '1d')
        return [<SuccessResponse>{
            statusCode: 200,
            message: 'login successful',
            token
        }, <ErrorResponse>{}]
    }


    public async RegisterUser(email: string, password: string, displayName: string): Promise<[SuccessResponse, ErrorResponse]> {
        const hashedPassword = SHA256hash(password)
        const filterQuery: GetUsersFilterQuery = <GetUsersFilterQuery>{
            email,
            limit: 1,
            offset: 1
        }
        const [retrievedUser, getErr] = await this.userRepository.GetUsersList(filterQuery)
        if (getErr != '') {
            return [<SuccessResponse>{}, <ErrorResponse>{
                statusCode: 500,
                message: 'error on validating user'
            }]
        }

        if (retrievedUser.length > 0) {
            return [<SuccessResponse>{}, <ErrorResponse>{
                statusCode: 404,
                message: 'email is already registered'
            }]
        }

        const currentTimestamp = new Date()
        const newUser: User = <User>{
            email,
            password_hash: hashedPassword,
            display_name: displayName,
            is_email_verified: false,
            status: 'ACTIVE',
            created_at: currentTimestamp,
            updated_at: currentTimestamp,
        }

        try {
            await this.dbUtils.InitTx();
            const [newUserID, insertErr] = await this.userRepository.InsertUser(newUser)
            if (insertErr != '') {
                throw insertErr;
            }
            const token = this.jwtUtils.GenerateToken({ id: newUserID }, '30m')

            var expiresAt = moment(currentTimestamp).add(30, 'm').toDate();
            const userEmailVerification: UsersEmailVerification = <UsersEmailVerification>{
                token,
                user_id: newUserID,
                expires_at: expiresAt,
                created_at: currentTimestamp,
            }
            const [_, emailVerifInsertErr] = await this.usersEmailVerificationRepository.InsertUsersEmailVerification(userEmailVerification)
            if (emailVerifInsertErr != '') {
                throw emailVerifInsertErr;
            }

            const verifyLink = `${this.mainServiceURL}/auth/main/verify?token=${token}`
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
            await this.dbUtils.CommitTx();
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
}

export default MainAuthDomain