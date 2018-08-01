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

/**
 * @description 
 * general JSON fetch function
 * @param {string} body
 * @param {string} url
 * @param {string} method - GET|POST|PUT|DELETE
 * @param {object} params - optional fetch parameters
 * @return {Promise} parse JSON object
 */
const fetchJson = (body = '', url = '', method = 'GET', params = {}) =>{

    let headers;
    if ( params.headers ){
        headers = Object.assign({}, {
            "Content-Type": "application/json; charset=utf-8"
        }, params.headers);
        delete params.headers;
    }

    return fetch(url, {
        method,
        headers,
        body:JSON.stringify(body),
        ...params
    }).then( res=>res.json() );
}