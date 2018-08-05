import qs from 'qs';

export const getJson = (body, url, params = {}) =>{
    return fetchJson( body, url, 'GET', params );
}

export const postJson = (body, url, params = {}) =>{
    return fetchJson(body, url, 'POST', params);
}

export const putJson = (body, url, params = {}) =>{
    return fetchJson( body, url, 'PUT', params );
}

export const deleteJson = (body, url, params = {}) =>{
    return fetchJson(body, url, 'DELETE', params);
}

export const patchJson = (body, url, params = {}) => {
    return fetchJson(body, url, 'PATCH', params);
}

/**
 * @description 
 * general JSON fetch function
 * @param {object} body
 * @param {string} url
 * @param {string} method - GET|POST|PUT|DELETE
 * @param {object} params - optional fetch parameters
 * @return {Promise} parsed JSON object
 */
const fetchJson = (body = {}, url = '', method = 'GET', params = {}) =>{

    let headers = {
        "Content-Type": "application/json; charset=utf-8"
    };
    if ( params.headers ){
        headers = Object.assign({}, headers, params.headers);
        delete params.headers;
    }
    const _url = method === 'GET' ? `${url}?${qs.stringify( body )}` : url;
    let fetchParams = {
        method,
        headers,
        ...params
    };

    //fetch is not allowing data to be stored in body for GET requests
    if ( method !== 'GET' ){
        fetchParams.body = JSON.stringify( body );
    }

    return fetch(_url, fetchParams).then( res=>res.json() );
}