import React from "react";

export default function Spinner() {
	return (
		<svg
			className="loading animate-spin"
			width="21"
			height="20"
			viewBox="0 0 21 20"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M18 10C18 11.4834 17.5601 12.9334 16.736 14.1668C15.9119 15.4001 14.7406 16.3614 13.3701 16.9291C11.9997 17.4968 10.4917 17.6453 9.03683 17.3559C7.58197 17.0665 6.2456 16.3522 5.1967 15.3033C4.14781 14.2544 3.4335 12.918 3.14411 11.4632C2.85472 10.0083 3.00325 8.50032 3.57091 7.12987C4.13856 5.75943 5.09986 4.58809 6.33323 3.76398C7.5666 2.93987 9.01664 2.5 10.5 2.5"
				stroke="currentColor"
				strokeOpacity="0.6"
				strokeWidth="1.2"
				strokeLinecap="square"
			/>
		</svg>
	);
}
