import React from 'react'

interface Props { text: string }
const HelloWorld = function HelloWorld(props: Props) {
    return <div>Hi { props.someValue } </div>
}