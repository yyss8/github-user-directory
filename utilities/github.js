import { postJson, patchJson } from './request';
import { isObjEmpty } from './general';

const GQL_URL       = 'https://api.github.com/graphql';
const RSF_URL        = 'https://api.github.com';

export default class {
    
    constructor( token ){
        this.token = token;
    }

    /**
     * @description
     * fetch current logged user profile
     * Api:v4
     * 
     * @return {Promise} 
     */
    getCurrentUserDetail(){

        return new Promise( (resolve, reject) =>{

            const qry = 'query { viewer { id login avatarUrl }}';

            postJson( {query:qry}, GQL_URL, {
                headers:{
                    Authorization:`Bearer ${this.token}`
                }
            }).then( userRes =>{
                resolve( {
                    avatarUrl:userRes.data.viewer.avatarUrl,
                    username:userRes.data.viewer.login,
                    id:userRes.data.viewer.id,
                    token:this.token
                } );
            }, err =>{
                reject('Error happened while fetching data');
            });
        });
    }

    /**
     * @description
     * fetch user list
     * Api:v4
     * 
     * @param {string} direction used to determine pagination direction
     * @param {string} cursor current pagination cursor
     * 
     * @return {Promise} 
     */
    getUsers( direction = 'after', cursor = null ){
        
        const _direction = direction === 'before' ? 'before':'after';
        const _cursor = cursor && cursor !== 'none' && cursor !== '' ? `, ${_direction}:"${cursor}"`:'';

        const qry = `query {
            search(query: "type:user", ${_direction === 'before' ? 'last':'first'}: 100, type: USER ${_cursor}) {
                userCount
                pageInfo {
                    endCursor
                    startCursor
                    hasPreviousPage 
                    hasNextPage
                }
                edges {
                    node {
                        ... on User {
                            id
                            login
                            avatarUrl
                        }
                    }
                }
            }
        }`;

        return new Promise( (resolve, reject) =>{
            postJson( {query:qry}, GQL_URL, {
                headers:{
                    Authorization:`Bearer ${this.token}`
                }
            }).then(res =>{
    
                const { data } = res;
    
                if ( data === null ){
                    reject(res.errors[0].message);
                    return;
                }

                resolve( data );
            }, () =>{
                reject('Error happened while fetching data');
            });
        });
    }


    /**
     * @description 
     * fetch speicfic user profile
     * Api:v4
     * 
     * @param {string} login github username
     * 
     * @return {Promise} 
     */
    getProfile( login ){

        const qry = `query {
            user(login:"${login}") {    
                bio
                avatarUrl
                company
                email
                location
                login
                url
                name
                websiteUrl
                following{
                    totalCount
                }
                gists{
                    totalCount
                }
                repositories(first:50){
                    totalCount
                    pageInfo {
                        endCursor
                        hasNextPage
                    }
                    nodes {
                        ... on Repository {
                            name
                            description
                            languages(first:1){
                                nodes {
                                    color
                                    name
                                }
                            }
                            url
                            forkCount
                            stargazers{
                                totalCount
                            }
                        }
                    }
                }
            }
        }`;

        return new Promise( (resolve, reject) =>{
            postJson( {query:qry}, GQL_URL ,{
                headers:{
                    Authorization:`Bearer ${this.token}`
                }
            }).then( res =>{
                const { data } = res;
    
                if ( data === null ){
                    reject( res.errors[0].message );
                    return;
                }
    
                resolve( data.user );
    
            }, () =>{
                reject('Error happened while fetching data');
            });
        });

    }

    /**
     * @description
     * fetch user repositories
     * Api:v4
     * 
     * @param {string} login user username
     * @param {int} limit number of repositories to fetch per request
     * @param {string} cursor pagination cursor
     * 
     * @return {Promise} 
     */
    getUserRepositories( login, limit = 100, cursor = ''){

        const _after = cursor && cursor !== '' ? `, after:"${cursor}"`:''; 

        const qry = `query {
            user(login:"${login}") {    
                repositories(first:${limit}${_after}){
                    pageInfo {
                        endCursor
                        hasNextPage
                    }
                    nodes {
                        ... on Repository {
                            name
                            description
                            languages(first:1){
                                nodes {
                                    color
                                    name
                                }
                            }
                            url
                            forkCount
                            stargazers{
                                totalCount
                            }
                        }
                    }
                }
            }
        }`;

        return new Promise( (resolve, reject) =>{
            
            postJson( {query:qry}, GQL_URL ,{
                headers:{
                    Authorization:`Bearer ${this.token}`
                }
            }).then( res =>{
                const { data } = res;
    
                if ( data === null ){
                    reject( res.errors[0].message );
                    return;
                }

                resolve( data );
            }, () =>{
                reject('Error happened while fetching data');
            });
        });
    }

    /**
     * @description 
     * update user profile
     * Api:v3 (related api entry not found for v4)
     * 
     * @return {Promise}
     */
    updateProfile( updating = {} ){
        return new Promise( (resolve, reject) =>{
            
            if ( isObjEmpty( updating ) ){
                reject('Nothing to update');
                return;
            }

            patchJson( updating, `${RSF_URL}/user` ,{
                headers:{
                    Authorization:`Bearer ${this.token}`
                }
            }).then( () =>{
                resolve();
            }, () =>{
                reject('Error happened while updating bio');
            });
        });

    }
}