import { type RefObject, useEffect, useRef, useState } from "react";

type RefType<T> = RefObject<T | null>;

interface Options {
  useKeyDown?: boolean;
  useClickOutside?: boolean;
}

let optionDefaults: Options = {
  useKeyDown: true,
  useClickOutside: true,
};

function useUniversalClosing<T extends HTMLElement>(
  refs: RefType<T>[],
  options: Options = {},
): [boolean, React.Dispatch<React.SetStateAction<boolean>>] {
  let currentOptions = { ...optionDefaults, ...options };
  let [isMenuOpen, setIsMenuOpen] = useState(false);
  let isOpen = useRef(false);

  useEffect(() => {
    isOpen.current = isMenuOpen;
  }, [isMenuOpen]);

  let handleKeyDown = (ev: KeyboardEvent) => {
    if (ev.code === "Escape") {
      setIsMenuOpen(false);
      isOpen.current = false;
    }
  };

  let handleClick = (ev: MouseEvent) => {
    let isClickOutside = true;

    refs.forEach((ref) => {
      if (!ref.current) {
        return;
      }

      if (ref.current?.contains(ev.target as Node)) {
        isClickOutside = false;
      }
    });

    if (isClickOutside) {
      setIsMenuOpen(false);
      isOpen.current = false;
    }
  };

  useEffect(() => {
    if (currentOptions.useKeyDown) {
      document.addEventListener("keydown", handleKeyDown);
    }

    if (currentOptions.useClickOutside) {
      document.addEventListener("click", handleClick);
    }

    return () => {
      if (currentOptions.useKeyDown) {
        document.removeEventListener("keydown", handleKeyDown);
      }

      if (currentOptions.useClickOutside) {
        document.removeEventListener("click", handleClick);
      }
    };
  }, []);

  return [isMenuOpen, setIsMenuOpen];
}

export default useUniversalClosing;
