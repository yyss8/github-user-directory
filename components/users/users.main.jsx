import React from 'react';
import updater from 'immutability-helper';
import { connect } from 'react-redux';
import { withRouter, Switch, Route } from 'react-router-dom';

import UserList from './users.list.jsx';
import UserProfile from './users.profile.jsx';

import { postJson } from 'u/request';

class UserListView extends React.Component{

    state = {
        isLoading:false,
        users:[],
        startCursor:'',
        hasNextPage:false,
        hasPreviousPage :false,
        endCursor:''
    };

    constructor(props){
        super(props);

        this.fetchUsers.bind(this);
    }

    componentDidUpdate( prevProps ){
        if ( (prevProps.match.params.cursor !== this.props.match.params.cursor) || (prevProps.match.params.direction !== this.props.match.params.direction) ){
            this.fetchUsers( this.props.match.params.direction, this.props.match.params.cursor );
        }
    }

    componentDidMount(){

        if ( !this.props.user ){
            this.props.history.push('/');
            return;
        }

        this.fetchUsers(  this.props.match.params.direction, this.props.match.params.cursor );
    }

    fetchUsers(direction = 'after', cursor = null){

        this.setState({ users:[], isLoading:true }, () =>{
            const _cursor = cursor && cursor !== '' ? `, ${direction}:"${cursor}"`:'';
            const qry = `query {
                search(query: "type:user", ${direction === 'after' ? 'first':'last'}: 100, type: USER ${_cursor}) {
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
                                login
                                avatarUrl
                            }
                        }
                    }
                }
            }`;

            postJson( {query:qry}, GQL_URL, {
                headers:{
                    Authorization:`Bearer ${this.props.user.token}`
                }
            }).then(res =>{

                const { data } = res;

                if ( data === null ){
                    alert(data.errors[0]);
                    this.setState({isLoading:false});
                    return;
                }

                const state = updater( this.state,{
                    users:{ $set:data.search.edges.map( userObj => userObj.node ) },
                    total:{ $set:data.search.userCount },
                    startCursor:{ $set:data.search.pageInfo.startCursor },
                    endCursor:{ $set: data.search.pageInfo.endCursor },
                    isLoading:{ $set:true },
                    hasNextPage:{ $set:data.search.pageInfo.hasNextPage },
                    hasPreviousPage:{ $set: data.search.pageInfo.hasPreviousPage}
                });

                this.setState(state);
            });
        });
    }

    render(){

        const { users, total, startCursor, endCursor, hasNextPage, hasPreviousPage, isLoading  } = this.state;

        const listParams = {
            users, total, startCursor,endCursor, hasNext:hasNextPage, hasPrevious:hasPreviousPage, isLoading,
            fetchUsers:this.fetchUsers.bind(this)
        };

        return (
            <div className='user-list-wrapper'>
               <div className='filters text-right'>
                    <a onClick={ this.fetchUsers.bind(this) }><i className="fas fa-sync-alt"></i></a>
               </div>
               <UserList {...listParams} />
            </div>
        );
    }
}

export default connect( state => ({ user:state.user, users:state.users, filters:state.filters }) )( withRouter(UserListView) );