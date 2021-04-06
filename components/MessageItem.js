import moment from 'moment';
import React from 'react';
import {Avatar, Drawer, Text, View} from 'react-native-ui-lib';

export default function MessageItem({
  message,
  right = false,
  showSenderName = false,
  rightButtons = [],
}) {
  return (
    <Drawer rightItems={rightButtons}>
      <View
        padding-10
        style={{flexDirection: right ? 'row-reverse' : 'row'}}
        bg-white>
        <Avatar size={40} source={{uri: message.owner.photoURL}} />
        <View
          flex-1
          style={{marginLeft: right ? 0 : 10, marginRight: right ? 10 : 0}}>
          {showSenderName && (
            <Text text70 marginB-10 grey20>
              {message.owner.displayName}
            </Text>
          )}
          <Text
            bg-blue20
            text70L
            white
            style={{
              padding: 10,
              borderRadius: 10,
              textAlign: right ? 'right' : 'left',
              fontStyle: message.revoked ? 'italic' : 'normal',
            }}>
            {message.content}
          </Text>
          {message.createdAt && (
            <Text
              grey20
              marginT-5
              style={{textAlign: right ? 'right' : 'left'}}>
              {moment.unix(message.createdAt.seconds).fromNow()}
            </Text>
          )}
        </View>
      </View>
    </Drawer>
  );
}
