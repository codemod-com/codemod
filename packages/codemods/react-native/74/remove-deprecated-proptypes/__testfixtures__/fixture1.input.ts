import React from 'react';
import PropTypes from 'prop-types';
import { View, Image, Text, TextInput } from 'react-native';

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
