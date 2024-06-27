const Card = ({ user: { name, age } = {
    name: 'Unknown',
    age: 0
} }) => {
    return (
        <div>
            <p>{name}</p>
            <p>{age}</p>
        </div>
    );
}