import React, {useEffect, useState} from 'react';
import {FlatList} from 'react-native';
import UserItem from '../components/UserItem';
import {getAllUsers} from '../repositories/user';

export default function UserListModal({route, navigation}) {
  const [users, setUsers] = useState([]);

  async function fetchData() {
    const result = await getAllUsers(route.params?.data);
    setUsers(result);
  }

  useEffect(() => {
    fetchData();
  }, []);

  function renderItem({item}) {
    const onPressAvatar = () => {
      navigation.push('ProfileModal', {uid: item.uid});
    };
    return <UserItem profile={item} onPressAvatar={onPressAvatar} />;
  }

  return (
    <FlatList
      data={users}
      renderItem={renderItem}
      keyExtractor={item => item.uid}
    />
  );
}
