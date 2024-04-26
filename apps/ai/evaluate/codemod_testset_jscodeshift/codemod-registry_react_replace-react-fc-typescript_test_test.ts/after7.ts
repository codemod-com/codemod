import { observer } from 'mobx-react-lite';
import React from 'react';

type Props = { id: number };
const functionAcceptsComponent = observer((props: Props) => {
    return <span>{ props.id } < /span>;
});