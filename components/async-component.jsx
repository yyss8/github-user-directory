import React from 'react';
import { modifyLoadingPerc, resetLoadingPerc, addLoadingPerc } from  'a/global';
import { connect } from 'react-redux';

let timer;
export default (loader, collection) => (
    connect( state =>{
      return {global:state.global};
    } )(class AsyncComponent extends React.Component {
      constructor(props) {
        super(props);
 
        this.Component = null;
        this.state = { Component: AsyncComponent.Component };
        this.initTimer.bind(this);
      }
  
      componentWillMount() {
  
        if (!this.state.Component) {

          this.initTimer();
          
    
          loader().then((Component) => {
              clearInterval( timer );
              
              this.props.dispatch( modifyLoadingPerc(100) );
              const progressBar = document.querySelector('.app-wrapper>.progress');
              if ( progressBar ){
                progressBar.classList.add('hidden');
              }

              AsyncComponent.Component = Component;
              this.setState({ Component }, () =>{
                setTimeout(() => {
                  this.props.dispatch( modifyLoadingPerc(0) );
                }, 400);
              });
          });
        }
      }
  
      initTimer(){
          this.props.dispatch( resetLoadingPerc() );
          const progressBar = document.querySelector('div.app-wrapper>.progress');
          
          if ( progressBar ){
              progressBar.classList.remove('hidden');
          }

          let counter = 0;
          timer = setInterval(() =>{
            counter += 0.025;
            if ( counter <= 10 ){
                this.props.dispatch( addLoadingPerc(2) );
            }else{
                this.props.dispatch( addLoadingPerc(0.25) );
            }

            if ( counter >= 100 && progressBar){
                progressBar.classList.add('hidden');
            }
          }, 250);
      }

      render() {
        if (this.state.Component) {
          return (
            <this.state.Component { ...this.props } { ...collection } />
          )
        }
  
        return null;
      }
    })
);