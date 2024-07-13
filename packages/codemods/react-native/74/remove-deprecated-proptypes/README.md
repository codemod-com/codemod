This codemod removes deprecated **PropTypes** from React Native components (e.g., **Image**, **Text**, **TextInput**), reducing app size and memory overhead, and preparing the codebase for modern type-checking solutions.

## Example

### Before

```ts
const MyComponent = ({ imageSource, labelText, placeholderText }) => (
  <View>
    <Image source={imageSource} />
    <Text>{labelText}</Text>
    <TextInput placeholder={placeholderText} />
  </View>
);

MyComponent.propTypes = {
  imageSource: Image.propTypes.source,
  labelText: PropTypes.string,
  placeholderText: PropTypes.string,
};

export default MyComponent;

```

### After

```ts

const MyComponent = ({ imageSource, labelText, placeholderText }) => (
  <View>
    <Image source={imageSource} />
    <Text>{labelText}</Text>
    <TextInput placeholder={placeholderText} />
  </View>
);

export default MyComponent;

```

