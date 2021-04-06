import React, {useEffect, useState} from 'react';
import {TouchableOpacity} from 'react-native';
import {View, Avatar, Text, Drawer, Colors, Chip} from 'react-native-ui-lib';
import Divider from './Divider';
import moment from 'moment';
import firestore from '@react-native-firebase/firestore';
import {getConversationFromDoc} from '../repositories/chat';
import {useSelector} from 'react-redux';

export default function ConversationItem({data, onOpen, rightItems}) {
  const [numOfNotis, setNumOfNotis] = useState(0);
  const [conversation, setConversation] = useState(data);
  const user = useSelector(state => state.user);

  useEffect(() => {
    if (!user) return;
    return firestore()
      .collection('conversations')
      .doc(conversation.id)
      .onSnapshot(doc => {
        getConversationFromDoc(doc).then(result => setConversation(result));
      });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (!conversation) return;
    return firestore()
      .collection('activities')
      .where('target', '==', user?.uid)
      .where('data.type', '==', 'conversation')
      .where('data.id', '==', conversation.id)
      .where('hasRead', '==', false)
      .onSnapshot(querySnap => {
        if (!querySnap) return;
        setNumOfNotis(querySnap.docs.length);
      });
  }, [user, conversation]);

  if (!conversation) return null;

  return (
    <Drawer rightItems={rightItems}>
      <TouchableOpacity onPress={onOpen}>
        <View padding-10 bg-white>
          <Text text60BO marginB-10>
            {conversation.title}
          </Text>
          <View row>
            {conversation.participants.slice(0, 5).map(p => (
              <Avatar
                key={p.uid}
                source={{uri: p.photoURL}}
                containerStyle={{marginRight: 5}}
                size={50}
              />
            ))}
            {conversation.participants.length > 6 && (
              <Avatar label="6+" size={50} />
            )}
          </View>
          {conversation.lastMessageAt && (
            <Text marginT-10 grey40>
              Last message:{' '}
              {moment.unix(conversation.lastMessageAt.seconds).fromNow()}
            </Text>
          )}
          {numOfNotis > 0 && (
            <View row marginT-10>
              <Chip
                labelStyle={{color: Colors.white}}
                containerStyle={{borderColor: Colors.white}}
                backgroundColor={Colors.blue10}
                label={numOfNotis > 99 ? '99+' : numOfNotis.toString()}
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
      <Divider />
    </Drawer>
  );
}
