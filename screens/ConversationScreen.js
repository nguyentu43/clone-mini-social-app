import _ from 'lodash';
import React, {useEffect, useState} from 'react';
import {FlatList, TouchableOpacity} from 'react-native';
import {Colors, Text, View} from 'react-native-ui-lib';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSelector} from 'react-redux';
import ConversationItem from '../components/ConversationItem';
import {
  getAllConversations,
  removeConversation,
  updateTitleConversation,
} from '../repositories/chat';
import {showAlertConfirm} from '../utils/alert';
import prompt from 'react-native-prompt-android';

export default function ConversationScreen({navigation}) {
  const [conversations, setConversations] = useState([]);
  const user = useSelector(state => state.user);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  async function fetchData() {
    setRefreshing(true);
    const result = await getAllConversations(user?.uid, 25);
    setConversations(result);
    setRefreshing(false);
  }

  async function onEndReached() {
    if (loading) return;
    setLoading(true);
    const result = await getAllConversations(
      user?.uid,
      25,
      _.last(conversations),
    );
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  function onOpen(item) {
    navigation.push('ChatModal', {conversation: item});
  }

  async function onDeleteItem(item) {
    showAlertConfirm(
      'Delete Conversation',
      'Do you want to delete?',
      async () => {
        await removeConversation(item.id);
        setConversations(conversations.filter(cov => cov.id != item.id));
      },
    );
  }

  async function onEditItem(item) {
    prompt(
      'Edit title',
      'Enter title',
      async text => {
        if (text.trim() === '') return;
        await updateTitleConversation(item.id, text);
      },
      {defaultValue: item.title},
    );
  }

  function renderItem({item}) {
    const rightItems = [
      {
        text: 'Edit',
        background: Colors.green50,
        onPress: () => onEditItem(item),
      },
      {
        text: 'Delete',
        background: Colors.red50,
        onPress: () => onDeleteItem(item),
      },
    ];

    return (
      <ConversationItem
        onOpen={() => onOpen(item)}
        data={item}
        rightItems={user?.uid === item.owner ? rightItems : []}
      />
    );
  }

  if (!conversations) return null;

  return (
    <View flex-1>
      <FlatList
        data={conversations}
        refreshing={refreshing}
        onRefresh={fetchData}
        keyExtractor={item => item.id}
        onEndReached={onEndReached}
        renderItem={renderItem}
        ListHeaderComponent={
          <View bg-white marginB-10 paddingH-10>
            <Text marginV-15 text40BL>
              Conversations
            </Text>
          </View>
        }
      />
      <TouchableOpacity
        onPress={() => navigation.push('AddConversationModal')}
        style={{
          position: 'absolute',
          bottom: 15,
          right: 15,
        }}>
        <Ionicons color={Colors.blue10} name="chatbubbles" size={55} />
      </TouchableOpacity>
    </View>
  );
}
