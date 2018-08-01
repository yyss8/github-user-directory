import React from 'react';
import { connect } from 'react-redux';

class UserProfileView extends React.Component{



    render(){

        return (
            <div className='user-list-wrapper'>
            
            </div>
        );
    }
}

export default connect( state => ({ user:state.user }) )( UserProfileView );