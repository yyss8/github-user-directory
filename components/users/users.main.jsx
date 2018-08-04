import React from 'react';
import updater from 'immutability-helper';
import { connect } from 'react-redux';
import Modal from 'react-modal';
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
        endCursor:'',
        isModalShowed:false,
        isProfileLoading:false,
        viewingUser:null
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
                                id
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
                    alert(res.errors[0].message);
                    this.setState({isLoading:false});
                    return;
                }

                const state = updater( this.state,{
                    users:{ $set:data.search.edges.map( userObj => userObj.node ) },
                    total:{ $set:data.search.userCount },
                    startCursor:{ $set:data.search.pageInfo.startCursor },
                    endCursor:{ $set: data.search.pageInfo.endCursor },
                    isLoading:{ $set:false },
                    hasNextPage:{ $set:data.search.pageInfo.hasNextPage },
                    hasPreviousPage:{ $set: data.search.pageInfo.hasPreviousPage}
                });

                this.setState(state);
            });
        });
    }

    onUserProfile(index){

        const { users } = this.state;

        const qry = `query {
                user(login:"${users[index].login}") {    
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
                    repositories(first:100){
                        totalCount
                        pageInfo {
                            endCursor
                            startCursor
                            hasPreviousPage 
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
                                projectsUrl
                                forkCount
                                stargazers{
                                    totalCount
                                }
                            }
                        }
                    }
                }
            }`;

        postJson( {query:qry}, GQL_URL ,{
            headers:{
                Authorization:`Bearer ${this.props.user.token}`
            }
        }).then( res =>{
            const { data } = res;

            if ( data === null ){
                alert(res.errors[0].message);
                this.setState({isProfileLoading:false});
                return;
            }

            this.setState({
                isProfileLoading:false,
                isModalShowed:true,
                viewingUser:data.user
            });

        });

    }

    getUserRepositories(){

    }

    onSaveBio(){

        if ( this.props.user.login !== this.state.viewingUser.login ){
            return;
        }

        const qry = ``;

    }

    onAddBio(){

    }

    componentWillMount() {
        Modal.setAppElement('body');
    }

    render(){

        const { users, total, startCursor, endCursor, hasNextPage, hasPreviousPage, isLoading, viewingUser } = this.state;
        const { user } = this.props;

        const listParams = {
            users, total, startCursor,endCursor, hasNext:hasNextPage, hasPrevious:hasPreviousPage, isLoading,
            fetchUsers:this.fetchUsers.bind(this), onProfileClicked:this.onUserProfile.bind(this)
        };

        return (
            <div className='user-list-wrapper'>
               <div className='filters text-right'>
                    <a onClick={ this.fetchUsers.bind(this) }><i className="fas fa-sync-alt"></i></a>
               </div>
               <UserList {...listParams} />
               {viewingUser !== null && <Modal isOpen={ this.state.isModalShowed } onRequestClose={  () => this.setState({ isModalShowed:false, viewingUser:null }) } className="user-profile-modal" >
                    <div className='modal-container'>
                        <div className='modal-header'>
                            <a onClick={ () => this.setState({ isModalShowed:false, viewingUser:null }) }>Cancel</a>
                            <a>{ viewingUser.login === user.login ? 'Save':'' }</a>
                        </div>
                        <div className='modal-body'>
                            <div className='user-profile'>
                                <img src={ viewingUser.avatarUrl } width="229" height="230" />
                                <h4>{ viewingUser.name }</h4>
                                <h6>{ viewingUser.login }</h6>
                                { viewingUser.login === user.login ? (
                                    viewingUser.bio === '' ? <button onClick={ this.onAddBio.bind(this) }>Add Bio</button>:(<h6>{ viewingUser.bio } <a onClick={ this.onAddBio.bind(this) }><i className='fas fa-edit'></i></a></h6>)
                                ):viewingUser.bio }
                                <p><i className='fas fa-location-arrow'></i> { viewingUser.location }</p>
                                { viewingUser.email !== '' && <p><i className="fas fa-envelope"></i> { viewingUser.email }</p> }
                                <p><i className="fas fa-link"></i> <a href={ viewingUser.websiteUrl }>{ viewingUser.websiteUrl }</a></p>
                            </div>
                            <div className='user-counter-repositories'>
                                <div className='counter-info'>
                                    <p>Repositories: {viewingUser.repositories.totalCount}</p>
                                    <p>Following: {viewingUser.following.totalCount}</p>
                                    <p>Gist: {viewingUser.gists.totalCount}</p>
                                </div>
                                <div className='user-repositories'>
                                    <h5>{viewingUser.login}'s repositories</h5>
                                    { viewingUser.repositories.nodes.map( (node, index) =>{
                                        return (
                                            <div className='user-repository' key={ `user-repository-${index}` }>
                                                <a href={ node.projectsUrl } target='_blank'>{node.name}</a>
                                                <p>{ node.description }</p>
                                                <p>
                                                    { node.languages.nodes[0] && <span><i style={ {color:node.languages.nodes[0].color} } className="fas fa-circle"></i> {node.languages.nodes[0].name}</span> }&nbsp;&nbsp;
                                                    <span><i className="fas fa-star"></i> {node.stargazers.totalCount}</span>&nbsp;&nbsp;
                                                    <span><i className="fas fa-code-branch"></i> {node.forkCount}</span>
                                                </p>
                                            </div>
                                        );
                                    }) }
                                </div>
                            </div> 
                        </div>
                    </div>
               </Modal>}
            </div>
        );
    }
}

export default connect( state => ({ user:state.user, users:state.users, filters:state.filters }) )( withRouter(UserListView) );