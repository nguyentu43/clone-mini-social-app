import React from 'react';
import {Colors, Text, View} from 'react-native-ui-lib';
import simplur from 'simplur';
import Divider from './Divider';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {TouchableOpacity} from 'react-native';

export default function PostInfoBar({numOfLikes, numOfComments, onPressBar}) {
  if (numOfLikes === 0 && numOfComments === 0) return null;
  return (
    <TouchableOpacity onPress={onPressBar}>
      <View row spread centerV padding-10>
        {numOfLikes > 0 && (
          <View row centerH>
            <Ionicons
              name="thumbs-up-outline"
              backgroundColor="white"
              color={Colors.blue10}
              size={20}
            />
            <Text text70L black marginL-10>
              {simplur`${numOfLikes} like[|s]`}
            </Text>
          </View>
        )}
        <Text text70L style={{alignSelf: 'flex-end'}}>
          {numOfComments === 0 ? '' : simplur`${numOfComments} comment[|s]`}
        </Text>
      </View>
      <Divider />
    </TouchableOpacity>
  );
}
