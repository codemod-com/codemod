const List = ({ items = [], renderItem = item => <li key={item}>{item}</li> }) => {
    return (
        <ul>
            {items.map(renderItem)}
        </ul>
    );
}