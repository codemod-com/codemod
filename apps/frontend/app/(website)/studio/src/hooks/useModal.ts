import { useState } from "react";

export let useModal = (initialState = false) => {
  let [isModalShown, setIsModalShown] = useState(initialState);
  return {
    isModalShown,
    setIsModalShown,
    showModal: () => setIsModalShown(true),
    hideModal: () => setIsModalShown(false),
  };
};
