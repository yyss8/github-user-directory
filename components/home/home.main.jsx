import React from 'react';
import updater from 'immutability-helper';
import { connect } from 'react-redux';

class HomeView extends React.Component{

    state = {
        messageField:{},
        loginForm:{},
        authCode:'',
        loginType:'username'
    }

    constructor(props){
        super(props);

        this.formContentOnchange.bind(this);
    }

    handleLoginPress(){

    }

    handleLogin(){

    }

    formContentOnchange( value, field ){
        
        const loginForm = updater( this.state.loginForm, {
            [field]:{ $set:value }
        });
        
        this.setState({
            loginForm
        });
    }


    render(){

        const {  loginForm } = this.state;

        return (
            <div className='home-wrapper'>
                <div className='login-form'>
                    <div className='form-group'>
                        <div className="input-group">
                            <span className="input-group-addon"><i className="fas fa-user"></i></span>
                            <input id='login-form-username' onKeyPress={this.handleLoginPress.bind(this)} type="text" className="form-control" value={ loginForm.username || '' } placeholder='Username' onChange={ e => this.formContentOnchange( e.target.value, 'username') } />
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="input-group">
                            <span className="input-group-addon"><i className="fas fa-lock"></i></span>
                            <input id='login-form-password' onKeyPress={this.handleLoginPress.bind(this)} type="password" className="form-control" value={ loginForm.password || '' } placeholder='Password' required="required"  onChange={ e => this.formContentOnchange( e.target.value, 'password') }/>
                        </div>
                    </div>
                </div>
                <div className="form-group action">
                    <button id="login-btn" className="btn btn-rl" onClick={ this.handleLogin.bind(this) }>Login</button>
                </div>
                <a>Or login with Github authorization token</a>
                { this.state.messageField !== false && <div className={ `message-field ${this.state.messageField.type ? `text-${this.state.messageField.type}` :''}` }>
                    { this.state.messageField.text || '' }
                </div>}
            </div>
        );
    }
}

export default connect( state => ({ user:state.user }) )( HomeView );