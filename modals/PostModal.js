import React, {useEffect, useState} from 'react';
import {Alert} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {onChange} from 'react-native-reanimated';
import PostItem from '../components/PostItem';
import {getPost} from '../repositories/post';

export default function PostModal({route, navigation}) {
  const [post, setPost] = useState(null);

  function onCallbackDelete() {
    navigation.goBack();
  }

  useEffect(() => {
    if (route.params.id) {
      getPost(route.params.id).then(result => {
        if (!result) {
          Alert.alert('Not Fount', 'Post has been deleted');
          navigation.goBack();
          return;
        }
        setPost(result);
      });
    }
  }, []);

  if (!post) return null;

  return (
    <ScrollView>
      <PostItem
        data={post}
        navigation={navigation}
        onCallbackDelete={onCallbackDelete}
      />
    </ScrollView>
  );
}
