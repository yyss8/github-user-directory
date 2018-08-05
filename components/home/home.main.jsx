import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

class HomeView extends React.Component{

    render(){

        return (
            <div className='home-wrapper'>
                <div>
                    <Link to='/users' className='btn btn-gh'>View Users</Link>
                </div>
                <div>
                    <Link to="/login" className='btn btn-gh'>Login</Link>
                </div>
            </div>
        );
    }
}

export default connect( state => ({ user:state.user }) )( HomeView );