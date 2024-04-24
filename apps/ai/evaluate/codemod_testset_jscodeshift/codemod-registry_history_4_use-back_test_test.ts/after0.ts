history.back();

const Component = () => {
    const handleChange = () => {
        history.back();
    };

    useEffect(() => {
        history.back();
    }, []);

    return (
        <div>
        <Select
				  onChange= { handleChange }
        />
        </div>
			);
		  };