import React from 'react';
import updater from 'immutability-helper';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import { withRouter } from 'react-router-dom';
import Grid from 'react-virtualized/dist/es/Grid';
import AutoSizer from 'react-virtualized/dist/es/AutoSizer';

import UserBar from 'c/user-bar.jsx';
import UserList from './users.list.jsx';

import { postJson, patchJson } from 'u/request';

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
        viewingUser:null,
        isRepLoading:false
    };

    constructor(props){
        super(props);

        this.fetchUsers.bind(this);
    }

    componentWillMount() {
        Modal.setAppElement('body');
    }

    componentDidUpdate( prevProps ){
        if ( (prevProps.match.params.cursor !== this.props.match.params.cursor) || (prevProps.match.params.direction !== this.props.match.params.direction) ){
            this.fetchUsers( this.props.match.params.direction, this.props.match.params.cursor );
        }
    }

    componentDidMount(){

        if ( !this.props.user ){
            this.props.history.push('/login');
            return;
        }

        const { match } = this.props;

        if ( typeof match.params.login !== 'undefined' ){
            this.onUserProfile( match.params.login );
        }

        this.fetchUsers(  match.params.direction, match.params.cursor );
    }

    /**
     * @description
     * fetch user list
     * 
     * @param {string} direction used to determine pagination direction
     * @param {string} cursor current pagination cursor
     */
    fetchUsers(direction = 'after', cursor = null){

        this.setState({ users:[], isLoading:true }, () =>{
            const _direction = direction === 'before' ? 'before':'after';
            const _cursor = cursor && cursor !== 'none' && cursor !== '' && !cursor.startsWith('login:') ? `, ${_direction}:"${cursor}"`:'';

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

    /**
     * @description 
     * handle clicked user profile fetching
     * 
     * @param {string} login github username
     */
    onUserProfile(login){

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

            const { match } = this.props;

            const url = `/users/${match.params.direction || 'after'}/${match.params.cursor || 'none'}/${login}`;

            this.props.history.push( url );

            this.setState({
                isProfileLoading:false,
                isModalShowed:true,
                viewingUser:data.user
            });

        });

    }

    /**
     * @description
     * handle additonal repositories fetching for current viewing user
     */
    fetchMoreUserRepositories( ){
        
        this.setState({ isRepLoading:true }, () =>{

            const { viewingUser } = this.state;

            const qry = `query {
                user(login:"${viewingUser.login}") {    
                    repositories(first:50, after:"${viewingUser.repositories.pageInfo.endCursor}"){
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
    
            postJson( {query:qry}, GQL_URL ,{
                headers:{
                    Authorization:`Bearer ${this.props.user.token}`
                }
            }).then( res =>{
                const { data } = res;
    
                if ( data === null ){
                    alert(res.errors[0].message);
                    //give it 10 secs to load again if sensor is still in screen view
                    setTimeout(() => {
                        this.setState({ isRepLoading:false} );
                    }, 10 * 1000);
                    return;
                }
    
                const newUser = updater( viewingUser , {
                    repositories:{
                        pageInfo:{
                            endCursor:{ $set:data.user.repositories.pageInfo.endCursor },
                            hasNextPage:{ $set:data.user.repositories.pageInfo.hasNextPage }
                        },
                        nodes:{
                            $push:data.user.repositories.nodes
                        }
                    }
                });

                this.setState({ viewingUser:newUser, isRepLoading:false });
    
            });
    

        });
    }

    /**
     * @description 
     * handle current user bio updating
     */
    onAddBio(){

        const { user } = this.props;
        const { viewingUser } = this.state;

        if ( user === null || user.username !== viewingUser.login ){
            alert('You aren\'t authorized to perform this action');
            return;
        }

        const newBio = prompt( 'Enter new bio', viewingUser.bio);

        if ( newBio === null){
            return;
        }

        patchJson( {bio:newBio}, `${RSF_URL}/user` ,{
            headers:{
                Authorization:`Bearer ${this.props.user.token}`
            }
        }).then( () =>{
            const newUser = updater( viewingUser, {
                bio:{ $set:newBio }
            });

            this.setState({ viewingUser:newUser }, () =>{
                alert('Bio updated');
            });
        }, () =>{
            alert('Error happened while updating bio');
        });

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
                { user !== null && <UserBar onProfileClicked={this.onUserProfile.bind(this)} /> }
               <UserList {...listParams} />
               {viewingUser !== null && <Modal isOpen={ this.state.isModalShowed } onRequestClose={  () => this.setState({ isModalShowed:false, viewingUser:null }) } className="user-profile-modal" >
                    <div className='modal-container'>
                        <div className='modal-header'>
                            <a onClick={ () => this.setState({ isModalShowed:false, viewingUser:null }) }>Return</a>
                        </div>
                        <div className='modal-body'>
                            <div className='user-profile'>
                                <img src={ viewingUser.avatarUrl } width="229" height="230" />
                                <h4>{ viewingUser.name }</h4>
                                <h6>{ viewingUser.login }</h6>
                                { viewingUser.login === user.username ? (
                                    viewingUser.bio === '' ? <button className='btn btn-gh' onClick={ this.onAddBio.bind(this) }>Add Bio</button>:(<h6 className='bio'>{ viewingUser.bio } <a className='edit-btn' onClick={ this.onAddBio.bind(this) }><i className='fas fa-edit'></i></a></h6>)
                                ):<h6 className='bio'>{viewingUser.bio}</h6> }
                                { viewingUser.location !== '' && <p><i className='fas fa-location-arrow'></i> { viewingUser.location }</p> }
                                { viewingUser.email !== '' && <p><i className="fas fa-envelope"></i> { viewingUser.email }</p> }
                                { viewingUser.company !== '' &&  <p><i className="fas fa-building"></i> { viewingUser.company }</p> }
                                { viewingUser.websiteUrl !== '' && <p><i className="fas fa-link"></i> <a href={ viewingUser.websiteUrl }>{ viewingUser.websiteUrl }</a></p> }
                            </div>
                            <div className='user-counter-repositories'>
                                <div className='counter-info'>
                                    <p>Repositories: {viewingUser.repositories.totalCount}</p>
                                    <p>Following: {viewingUser.following.totalCount}</p>
                                    <p>Gist: {viewingUser.gists.totalCount}</p>
                                </div>
                                <div className='user-repositories'>
                                    <h5>{viewingUser.login}'s repositories</h5>
                                    <AutoSizer disableHeight>
                                        {({width}) => (
                                            <Grid
                                            cellRenderer={({columnIndex, key, rowIndex, style})=>{
                                                const repository = viewingUser.repositories.nodes[rowIndex + columnIndex];
                                            
                                                return repository ? (
                                                    <div className='user-repository' key={ key } style={ style }>
                                                        <a href={ repository.url } target='_blank'>{repository.name}</a>
                                                        <p>{ repository.description }</p>
                                                        <p>
                                                            { repository.languages.nodes[0] && <span><i style={ {color:repository.languages.nodes[0].color} } className="fas fa-circle"></i> {repository.languages.nodes[0].name}</span> }&nbsp;&nbsp;
                                                            <span><i className="fas fa-star"></i> {repository.stargazers.totalCount}</span>&nbsp;&nbsp;
                                                            <span><i className="fas fa-code-branch"></i> {repository.forkCount}</span>
                                                        </p>
                                                    </div>
                                                ):<div></div>;
                                            }}
                                            columnWidth={300}
                                            columnCount={2}
                                            height={450}
                                            noContentRenderer={() => <div>No repositories found</div>}
                                            overscanColumnCount={0}
                                            overscanRowCount={100}
                                            rowHeight={180}
                                            rowCount={viewingUser.repositories.nodes.length / 2}
                                            width={width}
                                            />
                                        )}
                                    </AutoSizer>
                                    { viewingUser.repositories.pageInfo.hasNextPage && 
                                        <div className='rep-load-more'>
                                            { this.state.isRepLoading ? <i className='fas fa-circle-notch fa-spin'></i>:<a onClick={ this.fetchMoreUserRepositories.bind(this) } className='btn btn-gh'>More Repositories</a> }
                                        </div> }
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