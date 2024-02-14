'use client';

import { Toaster } from 'react-hot-toast';
import { Tooltip } from 'react-tooltip';
import { MainPage } from '~/pageComponents';

export default function Page() {
	return (
		<>
			<MainPage />
			<Tooltip
				className="z-50 w-40 bg-gray-light text-center text-xs text-gray-text-dark-title dark:bg-gray-lighter dark:text-gray-text-title "
				closeOnEsc
				delayHide={0}
				delayShow={200}
				id="button-tooltip"
			/>
			<Toaster />
		</>
	);
}

export const dynamic = 'force-dynamic';
