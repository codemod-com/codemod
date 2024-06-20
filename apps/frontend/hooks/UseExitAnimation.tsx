import { useEffect, useState } from "react";

export let useExitAnimation = (
  trigger: any,
  callback: any = null,
  duration = 300,
) => {
  let [shouldRender, setRender] = useState(trigger);

  useEffect(() => {
    let timeout: string | number | NodeJS.Timeout | undefined;
    if (trigger) {
      setRender(true);
    } else {
      timeout = setTimeout(() => {
        setRender(false);
        if (callback) callback();
      }, duration);
    }
    return () => clearTimeout(timeout);
  }, [trigger, callback, duration]);

  return shouldRender;
};
