import React from "react";

class C extends React.Component {
  render() {
    return (
      <div
        ref={(ref) => {
          if(ref === null) {
            delete this.refs.refName;
          } else {
            this.refs.refName = ref;
          }
        }}
      />
    );
  }
}

class C1 extends React.PureComponent {
  render() {
    return (
      <div
        ref={(ref) => {
          if(ref === null) {
            delete this.refs.refName;
          } else {
            this.refs.refName = ref;
          }
        }}
      />
    );
  }
}
