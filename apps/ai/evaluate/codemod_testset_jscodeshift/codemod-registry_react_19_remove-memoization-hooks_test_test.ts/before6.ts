import { type ReactNode, memo } from 'react';

const MyComponent = ({ name }: { name: string }) => {
    return <div>Hello, { name }! < /div>;
};

const MemoizedMyComponent: ReactNode = memo(MyComponent);