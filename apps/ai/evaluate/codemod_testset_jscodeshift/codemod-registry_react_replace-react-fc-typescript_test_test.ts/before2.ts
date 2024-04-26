type GenericsProps<T extends any> = { config: T }
export const MyComponentWithGenerics: React.FC<GenericsProps<string>> = (props) => <span>{ props.config } < /span>
export const MyComponentWithGenerics2: React.FC<GenericsProps<{ text: string }>> = ({ config: { text } }) => <span>{ text } < /span>