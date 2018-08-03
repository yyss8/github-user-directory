export const updatePaging = (cursor, direction) =>{

    return {
        type:'FILTERS_UPDATE_PAGING',
        cursor,
        direction
    };
}