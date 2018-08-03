import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { userLogout } from 'a/user';

class UserBar extends React.Component{


    onSignOut(){
        localStorage.removeItem('user');
        this.props.dispatch( userLogout() );
        this.props.history.push('/');
    }

    render(){

        const { user } = this.props;

        return(
            <div className='user-bar'>
                <img src={ user.avatarUrl }  height="30"/> Welcome, {user.username} | <a className='signout-btn' onClick={ this.onSignOut.bind(this) }>Sign Out</a>
            </div>
        );
    }
}

export default connect( state => ({ user:state.user }) )( withRouter( UserBar ) );