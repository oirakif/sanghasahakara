import UserRepository from '../repository/repository';
import { GetUsersFilterQuery } from '../model/model';
import { DBUtils } from '../../utils/utils'
import { ErrorResponse, SuccessResponse } from '../../wrapper/wrapper'

class UserDomain {
    userRepository: UserRepository;
    dbUtils: DBUtils;
    constructor(
        userRepository: UserRepository,
        dbUtils: DBUtils) {
        this.userRepository = userRepository;
        this.dbUtils = dbUtils;
    }

    public async GetUser(id: number): Promise<[SuccessResponse, ErrorResponse]> {
        const filterQuery: GetUsersFilterQuery = <GetUsersFilterQuery>{
            id,
            limit: 1,
            offset: 1
        }

        try {
            const [retrievedUser, getErr] = await this.userRepository.GetUsersList(filterQuery)
            if (getErr != '') {
                return [<SuccessResponse>{}, <ErrorResponse>{
                    statusCode: 500,
                    message: 'error on validating user'
                }]
            }

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

export default UserDomain