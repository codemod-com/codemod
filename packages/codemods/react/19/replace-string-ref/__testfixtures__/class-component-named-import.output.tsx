import { Component, PureComponent } from "react";

class C extends Component {
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

class C1 extends PureComponent {
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
