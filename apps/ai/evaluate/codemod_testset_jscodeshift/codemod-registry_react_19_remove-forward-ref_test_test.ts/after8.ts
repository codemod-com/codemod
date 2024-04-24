const MyComponent = function Component(
    myProps: Props & { ref: React.RefObject<HTMLButtonElement>; }
) {
    const { ref: myRef } = myProps;
    return null;
};