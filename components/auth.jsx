import React from 'react';
import { connect } from 'react-redux';

class AuthView extends React.Component{



    render(){


    }
}

export default connect( state => ({ user:state.user }) )( AuthView );