class C extends React.Component {
  render() {
    return (
      <div
        ref={(ref) => {
          this.refs.refName = ref;
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
          this.refs.refName = ref;
        }}
      />
    );
  }
}
