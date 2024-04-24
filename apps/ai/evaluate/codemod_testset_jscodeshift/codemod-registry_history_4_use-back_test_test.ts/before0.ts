history.goBack();

const Component = () => {
    const handleChange = () => {
        history.goBack();
    };

    useEffect(() => {
        history.goBack();
    }, []);

    return (
        <div>
        <Select
				  onChange= { handleChange }
        />
        </div>
			);
		  };