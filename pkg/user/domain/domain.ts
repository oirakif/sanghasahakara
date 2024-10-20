import UserRepository from '../repository/repository';
import { UserFilterQuery } from '../model/model';
import { DBUtils, CalculateOffset } from '../../utils/utils'
import { ErrorResponse, SuccessResponse } from '../../wrapper/wrapper'
import UserSessionsRepository from '../../user-session/repository/repository';

class UserDomain {
    userRepository: UserRepository;
    userSessionsRepository: UserSessionsRepository;
    dbUtils: DBUtils;
    constructor(
        userRepository: UserRepository,
        dbUtils: DBUtils,
        userSessionsRepository: UserSessionsRepository) {
        this.userRepository = userRepository;
        this.dbUtils = dbUtils;
        this.userSessionsRepository = userSessionsRepository;
    }

    public async GetUser(id: number): Promise<[SuccessResponse, ErrorResponse]> {
        const filterQuery: UserFilterQuery = <UserFilterQuery>{
            id,
            limit: 1,
            offset: 0
        }

        try {
            const retrievedUser = await this.userRepository.GetUsersList(filterQuery)
            if (retrievedUser.length === 0) {
                return [<SuccessResponse>{}, <ErrorResponse>{
                    statusCode: 404,
                    message: 'user is not found'
                }]
            }
            return [<SuccessResponse>{
                data: retrievedUser[0],
                message: 'user profile data',
                statusCode: 200,
            }, <ErrorResponse>{}]
        }
        catch (err) {
            return [
                <SuccessResponse>{},
                <ErrorResponse>{
                    statusCode: 500,
                    message: 'error occured while gathering user data'
                }]
        }
    }

    public async GetUsersList(page: number, perPage: number, sortBy: string, sortOrder: string): Promise<[SuccessResponse, ErrorResponse]> {
        const offset: number = CalculateOffset(page, perPage)
        const filterQuery: UserFilterQuery = <UserFilterQuery>{
            limit: perPage,
            offset,
            sortBy,
            sortOrder,
        }

        try {
            const retrievedUser = await this.userRepository.GetUsersList(filterQuery)
            if (retrievedUser.length === 0) {
                return [<SuccessResponse>{}, <ErrorResponse>{
                    statusCode: 404,
                    message: 'user is not found'
                }]
            }
            return [<SuccessResponse>{
                data: retrievedUser,
                message: 'users list',
                statusCode: 200,
            }, <ErrorResponse>{}]
        }
        catch (err) {
            return [
                <SuccessResponse>{},
                <ErrorResponse>{
                    statusCode: 500,
                    message: 'error occured while gathering user list'
                }]
        }
    }


    public async AggregateUserStatistics(activeSessionsInterval: number): Promise<[SuccessResponse, ErrorResponse]> {
        const filterQuery: UserFilterQuery = <UserFilterQuery>{}

        try {
            const totalUsersCount:number = await this.userRepository.CountUsers(filterQuery)
            filterQuery.countIndex = '*';
            const distinctUsersCount:number = await this.userRepository.CountUsers(filterQuery)
            const avgActiveUsersCount:number = await this.userSessionsRepository.AggregateDailyActiveUser(activeSessionsInterval)

            
            const data: object = {
                totalUsersCount,
                distinctUsersCount,
                avgActiveUsersCount
            }
            return [<SuccessResponse>{
                message: 'users list',
                statusCode: 200,
                data
            }, <ErrorResponse>{}]
        }
        catch (err) {
            return [
                <SuccessResponse>{},
                <ErrorResponse>{
                    statusCode: 500,
                    message: 'error occured while gathering user list'
                }]
        }
    }
}

export default UserDomain