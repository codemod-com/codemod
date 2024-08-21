function Foo(props) {
  const count = props.children.length;
  return < div > I have { count } children < /div>;
}