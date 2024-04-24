import React from 'react'

interface Props { text: string }
const HelloWorld: React.SFC<Props> = function HelloWorld(props) {
    return <div>Hi { props.someValue } </div>
}