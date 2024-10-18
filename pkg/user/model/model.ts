interface GetUsersFilterQuery {
    id: string;
    email: string;
    password_hash: string;
    display_name: string;
    is_verified: boolean;
    status: 'ACTIVE' | 'DISABLED' | 'BANNED' | 'DELETED';
    limit: number;
    offset: number;
}

interface User {
    id: string;
    email: string;
    password_hash:string;
    display_name: string;
    is_email_verified: boolean;
    status: 'ACTIVE' | 'DISABLED' | 'BANNED' | 'DELETED';
    created_at: Date;
    updated_at: Date;
}

export {
    GetUsersFilterQuery,
    User
}