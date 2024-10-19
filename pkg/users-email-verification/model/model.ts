interface UsersEmailVerification {
    id: number;
    user_id: number;
    token:string;
    is_used:boolean;
    expires_at: Date;
    created_at: Date;
    updated_at: Date;
}

interface UsersEmailVerificationFilterQuery {
    id?: number;
    user_id?: number;
    token?:string;
    is_used?:boolean;
    expires_at_GT: Date;
    created_at?: Date;
    limit?:number;
    offset?:number;
}

export {
    UsersEmailVerification,
    UsersEmailVerificationFilterQuery
}