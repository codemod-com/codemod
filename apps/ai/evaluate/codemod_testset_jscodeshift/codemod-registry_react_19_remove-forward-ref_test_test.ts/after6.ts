const MyInput = function MyInput(props) {
    const { ref } = props;
    return <input ref={ ref } onChange = { props.onChange } />
			};