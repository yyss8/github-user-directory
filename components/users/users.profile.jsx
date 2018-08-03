import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { postJson } from 'u/request';

class UserProfileView extends React.Component{

    state = {
        repStartCursor:'',
        repEndCursor:'',
        user:{}
    };
    
    componentWillMount(){
        document.title = `${ this.props.match.params.login} - Profile`;

        const cover = document.createElement('div');
        cover.setAttribute('id', 'modal-overlay');
        cover.classList.add('active');
        document.body.appendChild( cover );
    }

    componentDidMount(){
        this.fetchUser();
    }

    componentWillUnmount(){
        document.querySelector('#modal-overlay').remove();
    }

    fetchUser(){

        const { login } = this.props.match.params;

    }

    render(){

        return (
            <div className='user-profile-wrapper'>
                <div className='modal-header'>

                </div>
                <div className='modal-body'>
    
                </div>
            </div>
        );
    }
}

export default connect( state => ({ user:state.user }) )( UserProfileView );