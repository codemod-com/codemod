import React from 'react';
import { OtherComponent } from "./other-component";

interface Props { text: string }
const WithComponentIntersection: React.FC<Props> & {
    OtherComponent: typeof OtherComponent;
} = (props) => {
    return <span>{ props.text } < /span>
}
WithComponentIntersection.OtherComponent = OtherComponent;