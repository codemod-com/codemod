export const TextHighlight = ({
  text,
  highlight,
  className,
}: {
  text: string;
  highlight: string;
  className?: string;
}) => {
  const parts = text.split(new RegExp(`(${highlight})`, "gi"));

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} className="bg-accent font-bold dark:text-primary-light">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </span>
  );
};
