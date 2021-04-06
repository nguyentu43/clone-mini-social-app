import firestore from '@react-native-firebase/firestore';
import React, {useEffect, useMemo, useState} from 'react';
import {Alert, FlatList} from 'react-native';
import prompt from 'react-native-prompt-android';
import {Colors, View} from 'react-native-ui-lib';
import {useSelector} from 'react-redux';
import MessageItem from '../components/MessageItem';
import PostInfoBar from '../components/PostInfoBar';
import SendTextBar from '../components/SendTextBar';
import {addComment, deleteComment, updateComment} from '../repositories/post';
import {getUser} from '../repositories/user';

export default function CommentListModal({route, navigation}) {
  const [comments, setComments] = useState([]);
  const user = useSelector(state => state.user);
  const post = useMemo(() => route.params?.post, [route]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = firestore()
      .collection('posts')
      .doc(post.id)
      .collection('comments')
      .orderBy('createdAt', 'desc')
      .onSnapshot(async snap => {
        const data = [];
        for (const doc of snap.docs) {
          const comment = doc.data();
          comment.id = doc.id;
          comment.owner = await getUser(comment.owner);
          data.push(comment);
        }
        setComments(data);
      });
    return unsubscribe;
  }, [user]);

  async function onEditItem(comment) {
    prompt(
      'Edit comment',
      'Enter comment content',
      async text => {
        if (text.trim() === '') return;
        await updateComment(post, comment.id, text);
      },
      {defaultValue: comment.content},
    );
  }

  async function onDeleteItem(comment) {
    Alert.alert('Delete comment', 'Do you want to delete this comment?', [
      {
        text: 'Yes',
        onPress: async () => await deleteComment(post, comment.id),
      },
      {text: 'No', style: 'cancel'},
    ]);
  }

  async function onPressBar() {
    navigation.push('UserListModal', {data: post.likes});
  }

  const renderItem = ({item}) => {
    const rightButtons = [
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
      <MessageItem
        message={item}
        showSenderName={true}
        rightButtons={user?.uid === item.owner.uid ? rightButtons : []}
      />
    );
  };

  async function onPressSend(text) {
    if (text.trim() === '') return;
    await addComment(post, user?.uid, text);
  }

  return (
    <View flex-1 bg-white top>
      <FlatList
        keyExtractor={item => item.id}
        data={comments}
        renderItem={renderItem}
        ListHeaderComponent={
          <PostInfoBar
            numOfLikes={post.likes.length}
            numOfComments={post.comments}
            onPressBar={onPressBar}
          />
        }
      />
      <SendTextBar onPressSend={onPressSend} />
    </View>
  );
}
