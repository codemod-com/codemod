const [b, a] = await Promise.all([
			fnc('b'),
            Promise.resolve('a'),
        ]);

		const d = () => {
			return c() && b;
		}