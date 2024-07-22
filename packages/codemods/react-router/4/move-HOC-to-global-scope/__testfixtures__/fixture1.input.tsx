<Router history={browserHistory}>
    <Switch>
        <Route
            path='/'
            render={(props) => (
                <Route
                    exact
                    path='/a'
                    component={HOC(PageComponent)}
                />
            )}
        />
    </Switch>
</Router>;
