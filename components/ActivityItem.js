import React, {useState} from 'react';
import {TouchableOpacity} from 'react-native';
import {View, Avatar, Text, Drawer, Colors} from 'react-native-ui-lib';
import Divider from './Divider';
import moment from 'moment';

function ActivityItem({data, onRead, onDelete}) {
  const [hasRead, setHasRead] = useState(data.hasRead);
  if (!data.source) return null;
  return (
    <Drawer
      rightItems={[
        {onPress: onDelete, text: 'Delete', background: Colors.red50},
      ]}>
      <TouchableOpacity
        onPress={() => {
          setHasRead(true);
          onRead();
        }}>
        <View
          row
          padding-10
          centerV
          style={{
            color: hasRead ? 'black' : 'white',
            backgroundColor: hasRead ? 'white' : Colors.blue80,
          }}>
          {data.source ? (
            <>
              <Avatar size={40} source={{uri: data.source.photoURL}} />
              <View flex-1>
                <Text marginL-10>{data.source.displayName}</Text>
                <Text text70L marginL-10>
                  {data.message}
                </Text>
                <Text marginL-10 grey40>
                  {moment.unix(data.createdAt.seconds).fromNow()}
                </Text>
              </View>
            </>
          ) : (
            <Text marginV-10 style={{fontStyle: 'italic'}}>
              Source account has been delete
            </Text>
          )}
        </View>
      </TouchableOpacity>
      <Divider color={hasRead ? Colors.grey60 : Colors.white} />
    </Drawer>
  );
}

export default ActivityItem;
