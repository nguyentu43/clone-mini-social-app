import React, {useEffect, useState} from 'react';
import {Alert, FlatList} from 'react-native';
import {View, Colors} from 'react-native-ui-lib';
import ConversationInputBar from '../components/SendTextBar';
import MessageItem from '../components/MessageItem';
import firestore from '@react-native-firebase/firestore';
import {getUser} from '../repositories/user';
import {useSelector} from 'react-redux';
import {addMessage, revokeMessage} from '../repositories/chat';
import {setRouteState} from '../redux/routeStateSlider';
import {setReadActivitiesConversation} from '../repositories/activity';

export default function ChatModal({route, navigation}) {
  const [messages, setMessages] = useState(null);
  const user = useSelector(state => state.user);

  async function onSnapshot(querySnap) {
    const messages = await Promise.all(
      querySnap.docs.map(async doc => {
        const msg = doc.data();
        msg.id = doc.id;
        msg.owner = await getUser(msg.owner);
        return msg;
      }),
    );
    setMessages(messages);
  }

  useEffect(() => {
    if (!user) return;
    const conversation = route.params.conversation;
    const unsubcribe = firestore()
      .collection('conversations')
      .doc(conversation.id)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .onSnapshot(onSnapshot);
    return unsubcribe;
  }, [user]);

  useEffect(() => {
    const conversation = route.params.conversation;
    setRouteState({route: 'ChatModal', data: {id: conversation.id}});
    return () => {
      setRouteState({route: '', data: null});
    };
  }, []);

  useEffect(() => {
    const conversation = route.params.conversation;
    setReadActivitiesConversation(conversation.id, user.uid);
  }, []);

  function renderItem({item}) {
    const rightButtons = [
      {
        text: 'Revoke',
        background: Colors.red50,
        onPress: async () => {
          await revokeMessage(route.params.conversation, item);
        },
      },
    ];
    return (
      <MessageItem
        message={item}
        rightButtons={item.owner.uid === user?.uid ? rightButtons : []}
        right={item.owner.uid === user?.uid}
      />
    );
  }

  async function onPressSend(text) {
    try {
      await addMessage(route.params.conversation, user?.uid, text);
    } catch (e) {
      if (e.code === 'firestore/not-found') {
        Alert.alert('Not found', 'Conversation has been deleted');
        navigation.goBack();
      }
    }
  }

  if (!messages) return null;

  return (
    <View flex-1 bg-white>
      <FlatList
        inverted
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
      />
      <ConversationInputBar onPressSend={onPressSend} />
    </View>
  );
}
