import { toChildArray } from "preact";

function Foo(props) {
  const count = toChildArray(props.children).length;
  return < div > I have { count } children < /div>;
}