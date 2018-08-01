import React from 'react';
import { connect } from 'react-redux';
import { Redirect, Switch, Route } from 'react-router-dom';

import asyncComponent from './async-component.jsx';
import '../styles/main.scss';

const HomeView = asyncComponent( () => import( './home/home.main.jsx' ).then( module => module.default ));
const UserListView = asyncComponent( () => import( './users/users.main.jsx' ).then( module => module.default ));
const AuthView = asyncComponent( () => import('./auth.jsx' ).then( module => module.default ));

class App extends React.Component{


    componentDidMount(){
        
        document.querySelector('.loading-cover').style.display = 'none';

    }

    render(){

        const { global } = this.props;
        const progressStyle = {
            width:`${this.props.global.pageLoadingPerc}%` 
        };

        return [
            <header key='header'>
                <h3>Github User Directories</h3>
            </header>,
            <div className='app-wrapper' key='app-wrapper'>
                <div className='page-loading-bar progress'>
                    <div className="progress-bar" role="progressbar" style={ progressStyle }></div>
                </div>
                { !this.props.global.isPageLoaded && <div className='red-loading-view fixed'></div> }
                <Switch>
                    <Route path='/' component={ HomeView } />
                    <Route path='/users' component={ UserListView } />
                    <Route path='/oauth' component={ AuthView } />
                </Switch>
            </div>
        ]
    }

}

export default connect( state => ({global:state.global}) )( App );