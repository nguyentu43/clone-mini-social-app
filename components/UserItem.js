import React from 'react';
import {TouchableOpacity} from 'react-native';
import {Avatar, Drawer, Text, View} from 'react-native-ui-lib';
import Divider from './Divider';

export default function UserItem({profile, rightButtons = [], onPressAvatar}) {
  return (
    <Drawer rightItems={rightButtons}>
      <TouchableOpacity onPress={onPressAvatar}>
        <View row padding-10 bg-white center>
          <Avatar source={{uri: profile.photoURL}} size={40} />
          <View flex-1>
            <Text marginL-10 text70L>
              {profile.displayName}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      <Divider />
    </Drawer>
  );
}
