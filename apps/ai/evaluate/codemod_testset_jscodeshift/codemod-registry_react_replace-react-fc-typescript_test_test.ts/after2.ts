type GenericsProps<T extends any> = { config: T }
export const MyComponentWithGenerics = (props: GenericsProps<string>) => <span>{ props.config } < /span>
export const MyComponentWithGenerics2 = (
    {
        config: { text }
    }: GenericsProps<{ text: string }>
) => <span>{ text } < /span>