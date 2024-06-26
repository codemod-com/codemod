Removes legacy context methods `childContextTypes` and `getChildContext` from react class component. 
Wraps rendered children with Context. 


## Example

### Before

```tsx
import PropTypes from 'prop-types';
import React from 'react';

class Parent extends React.Component {
  static childContextTypes = {
    foo: PropTypes.string.isRequired,
  };

  getChildContext() {
    return { foo: 'bar' };
  }

  render() {
    return <Child />;
  }
}
```

### After

```tsx
import PropTypes from 'prop-types';
import React from 'react';

const Context = React.createContext();

class Parent extends React.Component {
  render() {
    return <Context value={{ foo: 'bar' }}><Child /></Context>;
  }
}
```

