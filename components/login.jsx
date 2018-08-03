import React from 'react';
import updater from 'immutability-helper';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { userLogin } from 'a/user';
import { postJson } from 'u/request';
import { objToQs } from 'u/general'; 


class LoginView extends React.Component{

    state = {
        messageField:{},
        loginForm:{},
        authCode:'',
        loginType:'token',
        isLoading:false
    }

    constructor(props){
        super(props);

        this.formContentOnchange.bind(this);
    }

    componentDidMount(){
        if ( this.props.user !== null ){
            this.props.history.push('/users');
        }
    }

    formContentOnchange( value, field ){
        
        const loginForm = updater( this.state.loginForm, {
            [field]:{ $set:value }
        });
        
        this.setState({
            loginForm
        });
    }

    fetchOAuth( e ){

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
                    <button id="login-btn" className="btn btn-gh" onClick={ this.fetchOAuth.bind(this) }>Connect to Github</button>
                </div>
                <a className='return' onClick={ () => this.props.history.goBack() }>Return</a>
                { this.state.messageField !== false && <div className={ `message-field ${this.state.messageField.type ? `text-${this.state.messageField.type}` :''}` }>
                    { this.state.messageField.text || '' }
                </div>}
            </div>
        );
    }
}

export default connect( state => ({ user:state.user }) )( withRouter(LoginView) );