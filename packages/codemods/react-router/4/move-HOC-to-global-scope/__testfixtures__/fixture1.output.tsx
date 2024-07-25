const HOCPageComponent = HOC(PageComponent);
<Router history={browserHistory}>
    <Switch>
        <Route
            path='/'
            render={(props) => (
                <Route
                    exact
                    path='/a'
                    component={HOCPageComponent}
                />
            )}
        />
    </Switch>
</Router>;
