import { useState } from "react";

export const useModal = (initialState = false) => {
	const [isModalShown, setIsModalShown] = useState(initialState);
	return {
		isModalShown,
		setIsModalShown,
		showModal: () => setIsModalShown(true),
		hideModal: () => setIsModalShown(false),
	};
};
