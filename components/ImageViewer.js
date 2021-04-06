import React from 'react';
import {Modal} from 'react-native';
import RNIView from 'react-native-image-zoom-viewer';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ImageViewer({
  index,
  visible,
  images,
  onClose,
  onLastImage,
}) {
  const renderHeader = () => {
    return (
      <Ionicons
        color="white"
        name="close-circle"
        style={{margin: 10}}
        size={30}
        onPress={onClose}
      />
    );
  };

  return (
    <Modal visible={visible} transparent={true}>
      <RNIView
        index={index}
        imageUrls={images}
        saveToLocalByLongPress
        renderHeader={renderHeader}
      />
    </Modal>
  );
}
