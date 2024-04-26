import { observer } from "mobx-react-lite";
import React from 'react';

type Props = { id: number };
const functionAcceptsComponent: React.FC<Props> = observer((props) => {
    return <span>{ props.id } < /span>
})