import updater from 'immutability-helper';

const globalReducer  = ( global = {}, action ) =>{

    switch ( action.type ){
        case 'GLOBAL_LOADING_ON_ADD':
            const pageLoadingPerc = global.pageLoadingPerc ? action.perc:global.pageLoadingPerc + action.perc;
            
            if ( pageLoadingPerc >= 100 ){
                return updater(global, {
                    isPageLoaded:{$set: true},
                    pageLoadingPerc:{ $set: 100 }
                });
            }  

            return updater(global, {
                pageLoadingPerc:{$set:pageLoadingPerc }
            });
        case 'GLOBAL_LOADING_ON_CHANGE':
            if ( action.perc >= 100 ){
                return updater(global, {
                    isPageLoaded:{$set: true},
                    pageLoadingPerc:{ $set: 100 }
                });
            }
            return updater(global, {
                pageLoadingPerc:{$set:action.perc }
            });
        case 'GLOBAL_LOADING_ON_RESET':
            return updater(global, {
                isPageLoaded:{ $set:false },
                pageLoadingPerc:{ $set: 0 }
            });
    }

    return global;
};

const usersReducer = (users = [], action) =>{

    switch ( action.type ){
        case 'USERS_SET':
            return action.users;
        case 'USERS_APPEND':
            return updater( users, {
                $push:action.users
            });
        case 'USERS_CLEAR':
            return [];
    }

    return users;
}

const userReducer = (user = {}, action) =>{

    switch ( action.type ){
        case 'USER_LOGIN':
            return action.user;
        case 'USER_LOGOUT':
            return null;
    }

    return user;

}

const filterReducer = (filters = {}, action)=>{

    switch ( action.type ){
        case 'FILTERS_UPDATE':
            return updater( filters , {
                changed:{$set:action.changed || false},
                [action.field]:{ $set:action.value }
            });
        case 'USERS_SET':
        case 'USERS_APPEND':
            return updater( filters , {
                total:{ $set:action.total },
                cursor:{ $set:action.cursor },
                hasNext:{ $set:action.hasNext }
            });
    }

    return filters;
}

const loggedUser = localStorage.getItem('user');

const initialStates = {
    user:loggedUser === null ? null:JSON.parse( loggedUser ),
    global:{
        isPageLoaded:false,
        pageLoadingPerc:0,
        onLoadFinished:false
    },
    users:[],
    filters:{
        page:1,
        perPage:100,
        cursor:'',
        total:0,
        hasNext:false,
        changed:false,
        direction:'after'
    }
};

export default {
    reducers:{
        global:globalReducer,
        user:userReducer,
        users:usersReducer,
        filters:filterReducer
    },
    initialStates
};