import React from "react";
import ReactDOM from "react-dom";

import { createStore, combineReducers, applyMiddleware } from "redux";
import { Provider } from 'react-redux';

import createHistory from "history/createBrowserHistory";
import { Route } from "react-router";
import App from './components/App.jsx';

import {
  ConnectedRouter,
  routerReducer,
  routerMiddleware,
} from "react-router-redux";

import storeObj from './store/store';

const history = createHistory();

const middleware = routerMiddleware(history);

const store = createStore(
  combineReducers({
    ...storeObj.reducers,
    router: routerReducer
  }),
  storeObj.initialStates,
  applyMiddleware(middleware)
);


ReactDOM.render(
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <Route path="/" component={ App }></Route>
        </ConnectedRouter>
    </Provider>,
  document.getElementById("ghusers-body")
);