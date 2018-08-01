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
    }

    return users;
}

const userReducer = (users = {}, action) =>{

    switch ( action.type ){
        case 'USER_LOGIN':
            return action.users;
    }

    return users;

}

const initialStates = {
    user:null,
    global:{
        isPageLoaded:false,
        pageLoadingPerc:0,
        onLoadFinished:false
    },
    users:[]
};

export default {
    reducers:{
        global:globalReducer,
        user:userReducer,
        users:usersReducer
    },
    initialStates
};