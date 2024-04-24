import React from 'react';
import { OtherComponent } from "./other-component";

interface Props { text: string }
const WithComponentIntersection = (props: Props) => {
    return <span>{ props.text } < /span>
}
WithComponentIntersection.OtherComponent = OtherComponent;