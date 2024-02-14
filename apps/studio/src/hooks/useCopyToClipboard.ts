import { useState } from 'react';

interface useCopyToClipboardProps {
	timeout?: number;
}

export const useCopyToClipboard = ({
	timeout = 2000,
}: useCopyToClipboardProps) => {
	const [isCopied, setIsCopied] = useState(false);

	const copy = (value: string) => {
		if (
			typeof window === 'undefined' ||
			!navigator.clipboard?.writeText ||
			!value
		) {
			return;
		}

		navigator.clipboard.writeText(value).then(() => {
			setIsCopied(true);

			setTimeout(() => {
				setIsCopied(false);
			}, timeout);
		});
	};

	return { isCopied, copy };
};
