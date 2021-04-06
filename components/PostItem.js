import React, {useEffect, useMemo, useState} from 'react';
import {
  Avatar,
  View,
  ProgressiveImage,
  Text,
  Button,
  Colors,
  Carousel,
} from 'react-native-ui-lib';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Divider from './Divider';
import moment from 'moment';
import {useSelector} from 'react-redux';
import {
  deletePost,
  getPost,
  getPostFromDoc,
  toggleLikePost,
} from '../repositories/post';
import PostInfoBar from './PostInfoBar';
import ImageViewer from './ImageViewer';
import {TouchableOpacity} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {showAlertConfirm} from '../utils/alert';

export default function PostItem({data, navigation, onCallbackDelete}) {
  const user = useSelector(state => state.user);
  const [post, setPost] = useState(data);
  const [visibleImageView, setVisibleImageView] = useState(false);
  const [indexImage, setIndexImage] = useState(0);

  const isUserLike = useMemo(() => {
    return post?.likes.indexOf(user?.uid) > -1;
  }, [post, user]);

  async function onPressLike() {
    await toggleLikePost(post, user?.uid);
  }

  function onPressComment() {
    navigation.push('CommentListModal', {post});
  }

  function onPressAvatar() {
    navigation.push('ProfileModal', {uid: post?.owner.uid});
  }

  function onPressEdit() {
    navigation.push('EditPostModal', {post});
  }

  async function onPressDelete() {
    showAlertConfirm('Delete this post', 'Do you want to delete', async () => {
      await deletePost(post);
      if (onCallbackDelete) {
        onCallbackDelete();
      }
    });
  }

  const images = useMemo(() => post?.images.map(item => ({url: item.uri})), [
    post,
  ]);

  function onClose() {
    setVisibleImageView(false);
  }

  useEffect(() => {
    if (!user) return;
    return firestore()
      .collection('posts')
      .doc(post.id)
      .onSnapshot(async doc => {
        const result = await getPostFromDoc(doc);
        setPost(result);
      });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    return firestore()
      .collection('posts')
      .doc(post.id)
      .collection('comments')
      .onSnapshot(async querySnap => {
        setPost({...post, comments: querySnap.docs.length});
      });
  }, [user]);

  if (!post) return null;

  return (
    <>
      <ImageViewer
        index={indexImage}
        visible={visibleImageView}
        onClose={onClose}
        images={images}
      />
      <View
        paddingT-10
        marginB-10
        style={{backgroundColor: 'white', width: '100%'}}>
        <View row centerV paddingH-10>
          <Avatar source={{uri: post.owner.photoURL}} onPress={onPressAvatar} />
          <View marginL-10>
            <Text text70L>{post.owner.displayName}</Text>
            <Text grey40>{moment.unix(post.createdAt.seconds).fromNow()}</Text>
          </View>
        </View>

        <Carousel showCounter style={{marginTop: 10}}>
          {post.images.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                setVisibleImageView(true);
                setIndexImage(index);
              }}>
              <ProgressiveImage
                source={{uri: item.uri}}
                style={{height: 250, resizeMode: 'contain'}}
              />
            </TouchableOpacity>
          ))}
        </Carousel>

        <Text text70L margin-10>
          {post.content}
        </Text>
        <Divider />
        <PostInfoBar
          numOfLikes={post.likes.length}
          numOfComments={post.comments}
          onPressBar={onPressComment}
        />
        <View row>
          <Button
            flex-1
            borderRadius={0}
            bg-white
            color={isUserLike ? Colors.blue10 : Colors.black}
            label="Like"
            iconSource={() => (
              <Ionicons
                style={{marginRight: 5}}
                name="thumbs-up-outline"
                size={25}
                color={isUserLike ? Colors.blue10 : Colors.black}
              />
            )}
            onPress={onPressLike}
          />
          <Button
            flex-1
            borderRadius={0}
            bg-white
            color={Colors.black}
            label="Comment"
            iconSource={() => (
              <Ionicons
                style={{marginRight: 5}}
                name="chatbox-outline"
                size={25}
              />
            )}
            onPress={onPressComment}
          />
        </View>
        {user?.uid === post.owner.uid && (
          <View row>
            <Button
              flex-1
              borderRadius={0}
              bg-white
              color={Colors.black}
              label="Edit"
              iconSource={() => (
                <Ionicons
                  style={{marginRight: 5}}
                  name="create-outline"
                  size={25}
                />
              )}
              onPress={onPressEdit}
            />
            <Button
              flex-1
              borderRadius={0}
              bg-white
              color={Colors.black}
              label="Delete"
              iconSource={() => (
                <Ionicons
                  style={{marginRight: 5}}
                  name="trash-outline"
                  size={25}
                />
              )}
              onPress={onPressDelete}
            />
          </View>
        )}
      </View>
    </>
  );
}
