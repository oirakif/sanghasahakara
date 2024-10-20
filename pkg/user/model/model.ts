import Joi from 'joi'
interface UserFilterQuery {
    id?: number;
    countIndex?: string;
    email?: string;
    password_hash?: string;
    display_name?: string;
    is_verified?: boolean;
    account_type?: 'GOOGLE' | 'FACEBOOK' | 'MAIN';
    status?: 'ACTIVE' | 'DISABLED' | 'BANNED' | 'DELETED';
    login_count?: number;
    logout_count?: number;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc';
}

interface User {
    id: number;
    email: string;
    password_hash: string;
    display_name: string;
    is_email_verified: boolean;
    account_type: 'GOOGLE' | 'FACEBOOK' | 'MAIN';
    status: 'ACTIVE' | 'DISABLED' | 'BANNED' | 'DELETED';
    login_count: number;
    logout_count: number;
    created_at: Date;
    updated_at: Date;

    // update payload
    logoutIncrement?: number;
}

const GetUserStatisticsQuerySchema = Joi.object({
    activeSessionsInterval: Joi.number()
        .required().
        min(1)
})

export {
    UserFilterQuery,
    User,
    GetUserStatisticsQuerySchema
}

