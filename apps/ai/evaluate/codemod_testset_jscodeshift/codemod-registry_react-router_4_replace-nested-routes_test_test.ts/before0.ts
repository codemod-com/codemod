import React from 'react';
import { Route, BrowserRouter as Router } from 'react-router-dom';

const App = () => {
    return (
        <Router>
        <Route path= "/parent" component = { Parent } >
            <Route path="/parent/child1" component = { Child1 } />
                <Route path="/parent/child2" component = { Child2 } />
                    <Route path="/parent/child3" component = { Child3 } />
                        </Route>
                        < /Router>
		  );
		};