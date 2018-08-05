import React from 'react';
import updater from 'immutability-helper';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import { withRouter } from 'react-router-dom';
import Grid from 'react-virtualized/dist/es/Grid';
import AutoSizer from 'react-virtualized/dist/es/AutoSizer';

import UserBar from 'c/user-bar.jsx';
import UserList from './users.list.jsx';

import GithubApi from 'u/github';

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
            this.handleUserProfileClicked( match.params.login );
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

            const githubApi = new GithubApi( this.props.user.token );

            githubApi.getUsers( direction, cursor ).then( data =>{

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

            }, rejected =>{
                alert(rejected);
            });
        });
    }

    /**
     * @description 
     * handle clicked user profile fetching
     * 
     * @param {string} login github username
     */
    handleUserProfileClicked(login){

        if ( this.state.viewingUser && this.state.viewingUser.login === login ){
            this.setState({ isModalShowed:true })
            return;
        }

        const githubApi = new GithubApi(this.props.user.token);

        githubApi.getProfile( login ).then( user =>{
            const { match } = this.props;

            const url = `/users/${match.params.direction || 'after'}/${match.params.cursor || 'none'}/${login}`;

            this.props.history.push( url );

            this.setState({
                isModalShowed:true,
                viewingUser:user
            });
        }, rejected =>{
            alert(rejected);
        });

    }

    /**
     * @description
     * handle additonal repositories fetching for current viewing user
     */
    fetchMoreUserRepositories( ){
        
        this.setState({ isRepLoading:true }, () =>{

            const { viewingUser } = this.state;
            const githubApi = new GithubApi( this.props.user.token );

            githubApi.getUserRepositories( viewingUser.login, 50 , viewingUser.repositories.pageInfo.endCursor )
                     .then( data =>{
                        
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

                     }, rejected =>{
                        alert(rejected);
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

        const githubApi = new GithubApi( this.props.user.token );

        githubApi.updateProfile( {bio:newBio} )
                 .then( () =>{
                    const newUser = updater( viewingUser, {
                        bio:{ $set:newBio }
                    });
        
                    this.setState({ viewingUser:newUser }, () =>{
                        alert('Bio updated');
                    });
                 }, rejected =>{
                    alert( rejected );
                 });
    }

    render(){

        const { users, total, startCursor, endCursor, hasNextPage, hasPreviousPage, isLoading, viewingUser } = this.state;
        const { user } = this.props;

        const listParams = {
            users, total, startCursor,endCursor, hasNext:hasNextPage, hasPrevious:hasPreviousPage, isLoading,
            fetchUsers:this.fetchUsers.bind(this), onProfileClicked:this.handleUserProfileClicked.bind(this)
        };

        return (
            <div className='user-list-wrapper'>
                { user !== null && <UserBar onProfileClicked={this.handleUserProfileClicked.bind(this)} /> }
               <UserList {...listParams} />
               {viewingUser !== null && <Modal isOpen={ this.state.isModalShowed } onRequestClose={  () => this.setState({ isModalShowed:false }) } className="user-profile-modal" >
                    <div className='modal-container'>
                        <div className='modal-header'>
                            <a onClick={ () => this.setState({ isModalShowed:false }) }>Return</a>
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