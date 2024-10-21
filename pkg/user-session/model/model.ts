interface UserSessionsFilterQuery {
    id?: number;
    countIndex?: string;
    user_id?: number;
    last_active?: Date;
    created_at?:Date;
    customFilters?: any[];
    customArgs?: any[];
}

interface UserSessions{
    id?: number;
    user_id?: number;
    last_active?: Date;
    created_at?:Date;
}

interface PopulatedUserSessions{
    day?: Date;
    active_users_count?: number;
}

export {
    UserSessionsFilterQuery,
    UserSessions,
    PopulatedUserSessions
}

