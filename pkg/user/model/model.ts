interface UserFilterQuery {
    id?: number;
    email?: string;
    password_hash?: string;
    display_name?: string;
    is_verified?: boolean;
    account_type?: 'GOOGLE' | 'FACEBOOK' | 'MAIN';
    status?: 'ACTIVE' | 'DISABLED' | 'BANNED' | 'DELETED';
    limit?: number;
    offset?: number;
}

interface User {
    id: number;
    email: string;
    password_hash:string;
    display_name: string;
    is_email_verified: boolean;
    account_type: 'GOOGLE' | 'FACEBOOK' | 'MAIN';
    status: 'ACTIVE' | 'DISABLED' | 'BANNED' | 'DELETED';
    created_at: Date;
    updated_at: Date;
}

export {
    UserFilterQuery,
    User
}