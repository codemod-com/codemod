import React from 'react';
import { View, Image, Text, TextInput } from 'react-native';

const MyComponent = ({ imageSource, labelText, placeholderText }) => (
  <View>
    <Image source={imageSource} />
    <Text>{labelText}</Text>
    <TextInput placeholder={placeholderText} />
  </View>
);

export default MyComponent;
