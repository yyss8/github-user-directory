export const appendUsers = (users, total, cursor, hasNext) =>{
    return {
        type:'USERS_APPEND',
        users,
        total,
        cursor,
        hasNext
    };
}

export const setUsers = users =>{
    return {
        type:'USERS_SET',
        users
    };
}

export const clearUsers = () =>{
    return {
        type:'USERS_CLEAR'
    };
}