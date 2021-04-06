import React from 'react';
import {ScrollView} from 'react-native';
import {View, Text, Avatar} from 'react-native-ui-lib';

export default function AvatarList({data, onPressMore, onPressAvatar}) {
  if (!data || data.length === 0) return null;
  return (
    <View bg-white marginB-10 paddingV-10 paddingH-10>
      <Text marginT-5 marginB-10 text40BL>
        Your friends
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {data.slice(0, 5).map(item => (
          <Avatar
            onPress={() => onPressAvatar(item)}
            key={item.uid}
            containerStyle={{marginRight: 10}}
            size={70}
            source={{uri: item.photoURL}}
          />
        ))}
        {data.length > 5 && (
          <Avatar
            onPress={onPressMore}
            containerStyle={{marginRight: 10}}
            size={70}
            label="More"
          />
        )}
      </ScrollView>
    </View>
  );
}
