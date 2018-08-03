import React from 'react';
import { connect } from 'react-redux';
import { Redirect, Switch, Route } from 'react-router-dom';

import asyncComponent from './async-component.jsx';
import UserBar from 'c/user-bar.jsx';
import '../styles/main.scss';

const HomeView = asyncComponent( () => import( './home/home.main.jsx' ).then( module => module.default ));
const UserListView = asyncComponent( () => import( './users/users.main.jsx' ).then( module => module.default ));
const LoginView = asyncComponent( () => import('./login.jsx').then( module => module.default ));
const Auth = asyncComponent( () => import('./auth.jsx').then( module => module.default ));

class App extends React.Component{


    componentDidMount(){
        
        document.querySelector('.loading-cover').style.display = 'none';

    }

    render(){

        const { global, user } = this.props;
        const progressStyle = {
            width:`${this.props.global.pageLoadingPerc}%` 
        };

        return [,
            <div className='app-wrapper' key='app-wrapper'>
                <div className='page-loading-bar progress'>
                    <div className="progress-bar" role="progressbar" style={ progressStyle }></div>
                </div>
                { !global.isPageLoaded && <div className='red-loading-view fixed'></div> }
                <header>
                    <h3><i className='fab fa-github'></i> Github User Directories</h3>
                    { user !== null && <UserBar /> }
                </header>
                <Switch>
                    <Route path='/' exact component={ HomeView } />
                    <Route path='/users/:direction?/:cursor?' component={ UserListView } />
                    <Route path='/login' component={ LoginView } />
                    <Route path='/auth' component={ Auth } />
                </Switch>
            </div>
        ]
    }

}

export default connect( state => ({global:state.global, user:state.user}) )( App );