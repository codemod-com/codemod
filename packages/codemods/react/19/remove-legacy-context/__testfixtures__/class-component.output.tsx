import PropTypes from 'prop-types';
import React from 'react';

const Context = React.createContext();

class Parent extends React.Component {
  render() {
    return <Context value={{ foo: 'bar' }}><Child /></Context>;
  }
}