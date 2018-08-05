import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';

import { objToQs } from 'u/general'; 


class LoginView extends React.Component{

    state = {
        messageField:{},
        loginForm:{},
        authCode:'',
        loginType:'token',
        isLoading:false
    }

    componentDidMount(){
        if ( this.props.user !== null ){
            this.props.history.push('/users');
        }
    }

    redirectToOAuthPage( e ){

        e.target.innerHTML = "<i class='fas fa-circle-notch fa-spin'></i>";
        const baseUrl = 'https://github.com/login/oauth/authorize';
        const clientId = '3aa8f369491b2bb00780';

        const params = {
            client_id:clientId,
            scope:'user ',
            state:'gh-schen',
            redirect_uri:'http://localhost:3111/auth'
        };

        location.href = baseUrl + objToQs( params );

    }


    render(){

        return (
            <div className='login-wrapper'>
                <div className="form-group action">
                    <h6>Github account is required to view the user list</h6>
                    <button id="login-btn" className="btn btn-gh" onClick={ this.redirectToOAuthPage.bind(this) }>Connect to Github</button>
                </div>
                <Link className='return' to='/'>Return</Link>
                { this.state.messageField !== false && <div className={ `message-field ${this.state.messageField.type ? `text-${this.state.messageField.type}` :''}` }>
                    { this.state.messageField.text || '' }
                </div>}
            </div>
        );
    }
}

export default connect( state => ({ user:state.user }) )( withRouter(LoginView) );