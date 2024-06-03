import type { Icon } from "@phosphor-icons/react";
import React, { useEffect, useState } from "react";
import { blinkTime, blinkingColor } from "./";

export const BlinkingIcon = ({
  Icon,
  baseColor,
}: { Icon: Icon; baseColor?: "black" }) => {
  const [isBlinking, setIsBlinking] = useState(true);
  const [color, setColor] = useState(baseColor);

  useEffect(() => {
    if (isBlinking) {
      const interval = setInterval(() => {
        setColor((prevColor) =>
          prevColor === baseColor ? blinkingColor : baseColor,
        );
      }, blinkTime);
      return () => clearInterval(interval);
    }
  }, [isBlinking]);

  const handleMouseEnter = () => {
    setIsBlinking(false);
    setColor(baseColor);
  };

  return (
    <Icon
      weight="fill"
      color={color}
      size={18}
      onMouseEnter={handleMouseEnter}
    />
  );
};
