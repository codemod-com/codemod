interface UserProps {
  imageUrl: string;
  name: string;
}

export const User: React.FC<UserProps> = ({ imageUrl, name }) => {
  return (
    <div className="flex items-center">
      <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
        <img
          src={imageUrl}
          alt={`${name}'s avatar`}
          className="w-full h-full object-cover"
        />
      </div>
      <span className="text-sm font-medium">{name}</span>
    </div>
  );
};
