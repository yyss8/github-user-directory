import React from 'react';
import { connect } from 'react-redux';
import qs from 'qs';
import { withRouter } from 'react-router-dom';

import GithubApi from 'u/github';
import { userLogin } from 'a/user';
import { postJson } from 'u/request';

class AuthView extends React.Component{


    componentWillMount(){

        const parsed = qs.parse( location.search.replace('?','') );

        if ( !parsed.code ){
            this.props.history.push('/');
            return;
        }

        const params = {
            code:parsed.code
        };

        postJson( params, '/auth' ).then(  res =>{

            if ( res.access_token ){
                const githubApi = new GithubApi(res.access_token);
                githubApi.getCurrentUserDetail( res.access_token ).then( userObj =>{
                    localStorage.setItem('user', JSON.stringify(userObj));
                    this.props.dispatch(userLogin(userObj));
                    this.props.history.push('/users');
                }, rejected =>{
                    alert('error happened while fetching user data');
                });
                return;
            }

            
            if ( confirm(res.error_description) ){
                this.props.history.push('/login');
            }else{
                this.props.history.push('/login');
            }
        });
    }

    render(){

        return (
            <div className='auth-wrapper text-center'>
                <h4>Authorizing</h4>
            </div>
        );
    }
}

export default connect( state => ({ user:state.user }) )( withRouter( AuthView ) );