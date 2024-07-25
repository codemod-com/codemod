Moves HOC calls to the global scope

## Example

### Before

```ts
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

```

### After

```ts
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
```

