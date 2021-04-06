import React from 'react';
import {FlatList} from 'react-native';
import PostItem from './PostItem';

export default function PostList({
  data,
  headerComponent = null,
  footerComponent = null,
  navigation,
  onRefresh,
  refreshing,
  onEndReached,
}) {
  const renderItem = ({item}) => {
    return <PostItem data={item} navigation={navigation} />;
  };

  return (
    <FlatList
      data={data}
      onRefresh={onRefresh}
      refreshing={refreshing}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      ListHeaderComponent={headerComponent}
      ListFooterComponent={footerComponent}
      onEndReached={onEndReached}
    />
  );
}
