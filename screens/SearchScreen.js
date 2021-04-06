import React, {useMemo, useState} from 'react';
import {FlatList} from 'react-native-gesture-handler';
import {LoaderScreen} from 'react-native-ui-lib';
import PostList from '../components/PostList';
import SearchBar from '../components/SearchBar';
import TabBarWithView from '../components/TabBarWithView';
import UserItem from '../components/UserItem';
import {searchPosts} from '../repositories/post';
import {searchUsers} from '../repositories/user';

export default function SearchScreen({navigation}) {
  const [keyword, setKeyword] = useState('');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  async function onSearchUsers() {
    const result = await searchUsers(keyword);
    setUsers(result);
  }

  async function onSearchPosts() {
    const result = await searchPosts(keyword);
    setPosts(result);
  }

  async function onSearch() {
    setLoading(true);
    await onSearchPosts();
    await onSearchUsers();
    setLoading(false);
  }

  const tabItems = useMemo(
    () => [
      {
        label: `Posts (${posts.length})`,
        getView() {
          return <PostList data={posts} navigation={navigation} />;
        },
      },
      {
        label: `Users (${users.length})`,
        getView() {
          const renderItem = ({item}) => {
            return (
              <UserItem
                profile={item}
                onPressAvatar={() =>
                  navigation.push('ProfileModal', {uid: item.uid})
                }
              />
            );
          };
          return (
            <FlatList
              renderItem={renderItem}
              listKey={(_, index) => index}
              keyExtractor={item => item.uid}
              data={users}
            />
          );
        },
      },
    ],
    [posts, users],
  );

  return (
    <FlatList
      ListHeaderComponent={
        <SearchBar
          text={keyword}
          onSearch={onSearch}
          onChangeText={text => setKeyword(text)}
        />
      }
      ListFooterComponent={
        loading ? <LoaderScreen /> : <TabBarWithView items={tabItems} />
      }
    />
  );
}
