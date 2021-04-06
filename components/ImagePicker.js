import React from 'react';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {
  Button,
  Chip,
  Text,
  View,
  ProgressiveImage,
  Colors,
} from 'react-native-ui-lib';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ImageCropPicker from 'react-native-image-crop-picker';

export default function ImagePicker({images, onChange}) {
  async function pickImages() {
    try {
      const result = await ImageCropPicker.openPicker({
        mediaType: 'photo',
        multiple: true,
      });
      const newImages = result.map(item => ({
        uri: item.path,
        status: 'pending',
      }));
      onChange([...images, ...newImages]);
    } catch (error) {
      if (['E_PICKER_CANCELLED'].indexOf(error.code) === -1) {
        throw error;
      }
    }
  }

  function toggleImage(index) {
    if (images[index].status === 'remove') {
      images[index].status = 'uploaded';
    } else if (images[index].status !== 'uploaded') {
      images.splice(index, 1);
    } else {
      images[index].status = 'remove';
    }
    onChange([...images]);
  }

  return (
    <>
      <TouchableOpacity onPress={pickImages}>
        <View marginV-10 padding-10 br20 center>
          <Text text60 blue30 marginB-10>
            Add images
          </Text>
          <Ionicons color={Colors.blue30} size={40} name="images-outline" />
        </View>
      </TouchableOpacity>
      <View>
        {images.map((item, index) => {
          return (
            <View key={index} row spread centerV paddingV-5>
              <ProgressiveImage
                source={{
                  uri: item.uri,
                }}
                width={120}
                height={120}
                resizeMode="contain"
              />
              <Chip label={item.status} />
              <Button
                style={{
                  backgroundColor:
                    item.status === 'remove' ? Colors.blue10 : Colors.red10,
                }}
                label={item.status === 'remove' ? 'Undo' : 'Remove'}
                size={Button.sizes.xSmall}
                onPress={() => toggleImage(index)}
              />
            </View>
          );
        })}
      </View>
    </>
  );
}
