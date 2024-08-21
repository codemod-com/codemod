import Tooltip from "@studio/components/Tooltip/Tooltip";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface TitleProps {
  title: string;
  onChange: (newTitle: string) => void;
}
export const Title: React.FC<TitleProps> = ({ title, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onChange(currentTitle);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTitle(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      onChange(currentTitle);
    }
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div>
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={currentTitle}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="border-b border-blue-600 focus:outline-none"
        />
      ) : (
        <Tooltip
          trigger={
            <h3
              onDoubleClick={handleDoubleClick}
              className="text-lg font-semibold cursor-pointer"
            >
              {currentTitle}
            </h3>
          }
          content="Doubleclick to change title"
        />
      )}
    </div>
  );
};
