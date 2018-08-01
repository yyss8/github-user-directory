
export const modifyLoadingPerc = perc =>{
    return {
        type:'GLOBAL_LOADING_ON_CHANGE',
        perc
    };
};

export const addLoadingPerc = perc =>{
    return {
        type:'GLOBAL_LOADING_ON_ADD',
        perc
    };
};

export const resetLoadingPerc = () =>{
    return {
        type:'GLOBAL_LOADING_ON_RESET'
    };
}

export const onLoadFinished = () =>{
    return {
        type:'GLOBAL_ON_LOAD_FINISHED'
    };
}