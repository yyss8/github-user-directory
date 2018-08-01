import React from 'react';
import { connect } from 'react-redux';

class UserListView extends React.Component{



    render(){

        return (
            <div className='user-list-wrapper'>
            
            </div>
        );
    }
}

export default connect( state => ({ user:state.user, users:state.users }) )( UserListView );