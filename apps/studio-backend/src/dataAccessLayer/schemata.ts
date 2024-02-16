import { coerce, integer, minValue, number } from 'valibot';

export const coercedNumberSchema = coerce(
	number([integer(), minValue(0)]),
	(input) => {
		if (typeof input === 'number') {
			return input;
		}

		return parseInt(String(input), 10);
	},
);
