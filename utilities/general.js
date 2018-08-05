/**
 * @description
 * stringify obj into querystring
 */
export const objToQs = obj => {
    return '?' + 
        Object.keys(obj).map(function(key) {
            return encodeURIComponent(key) + '=' +
                encodeURIComponent(obj[key]);
        }).join('&');
}

/**
 * @description
 * determine is object is empty
 */
export const isObjEmpty = obj => {
    for (let x in obj) { return false; }
    return true;
}