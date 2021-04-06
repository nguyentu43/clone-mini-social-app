import React, {useEffect, useState} from 'react';
import {View, Colors} from 'react-native-ui-lib';
import {useSelector} from 'react-redux';
import AvatarList from '../components/AvatarList';
import PostList from '../components/PostList';
import {getAllUsers} from '../repositories/user';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {TouchableOpacity} from 'react-native';
import _ from 'lodash';
import {getAllPostsByF} from '../repositories/post';

export default function HomeScreen({navigation}) {
  const [posts, setPosts] = useState(null);
  const [friends, setFriends] = useState([]);
  const user = useSelector(state => state.user);
  const [refreshing, setRefreshing] = useState(false);
  const [lastPostList, setLastPostList] = useState([]);
  const [loading, setLoading] = useState(false);
  const limit = 10;

  async function fetchData() {
    setRefreshing(true);
    const friendChunks = _.chunk([user?.uid].concat(user?.friends), 5);
    const lastList = [];
    const result = await getAllPostsByF(friendChunks, limit, lastList);
    setPosts(result.posts);
    if (result.posts.length > 0) lastList[result.index] = _.last(result.posts);
    setLastPostList([...lastList]);
    setFriends(await getAllUsers(user?.friends));
    setRefreshing(false);
  }

  async function onEndReached() {
    if (loading || !user) return;
    setLoading(true);
    const friendChunks = _.chunk([user?.uid, ...friends.map(f => f.uid)], 5);
    const result = await getAllPostsByF(friendChunks, limit, lastPostList);
    setPosts(posts.concat(result.posts));
    if (result.posts.length > 0)
      lastPostList[result.index] = _.last(result.posts);
    setLastPostList([...lastPostList]);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  const headerComponent = () => {
    return (
      <AvatarList
        onPressAvatar={item => {
          navigation.push('ProfileModal', {uid: item.uid});
        }}
        onPressMore={() => {
          navigation.push('UserListModal', {
            data: friends.map(item => item.uid),
          });
        }}
        data={friends.slice(0, 16)}
      />
    );
  };

  return (
    <View flex-1>
      <PostList
        onRefresh={fetchData}
        data={posts}
        navigation={navigation}
        headerComponent={headerComponent}
        refreshing={refreshing}
        onEndReached={onEndReached}
      />
      <TouchableOpacity
        onPress={() =>
          navigation.push('EditPostModal', {post: {content: '', images: []}})
        }
        style={{
          position: 'absolute',
          bottom: 10,
          right: 10,
        }}>
        <Ionicons color={Colors.blue10} name="add-circle" size={65} />
      </TouchableOpacity>
    </View>
  );
}
