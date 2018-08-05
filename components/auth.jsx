import React from 'react';
import { connect } from 'react-redux';
import qs from 'qs';
import { withRouter } from 'react-router-dom';

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
            code:parsed.code,
        };

        postJson( params, '/auth' ).then(  res =>{
            if ( res.access_token ){

                const qry = 'query { viewer { id login avatarUrl }}';

                postJson( {query:qry}, GQL_URL, {
                    headers:{
                        Authorization:`Bearer ${res.access_token}`
                    }
                }).then( userRes =>{
                    const userObj = {
                        avatarUrl:userRes.data.viewer.avatarUrl,
                        username:userRes.data.viewer.login,
                        id:userRes.data.viewer.id,
                        token:res.access_token
                    };

                    localStorage.setItem('user', JSON.stringify(userObj));
                    this.props.dispatch(userLogin(userObj));
                    this.props.history.push('/users');
                })
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
            <div className='auth-wrapper' style={ {textAlign:'center'} }>
                <h4>Authorizing</h4>
            </div>
        );
    }
}

export default connect( state => ({ user:state.user }) )( withRouter( AuthView ) );