import React from 'react';
import {Text, Colors, View} from 'react-native-ui-lib';
import {useDispatch, useSelector} from 'react-redux';
import {setUser} from '../redux/userSlider';
import auth from '@react-native-firebase/auth';
import {FlatList, TouchableOpacity} from 'react-native';
import Divider from '../components/Divider';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {updateActivities, updateConversations} from '../redux/notiSlider';
import {showAlertConfirm} from '../utils/alert';

export default function SettingScreen({navigation}) {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);

  const goToProfile = () => {
    navigation.push('ProfileModal', {uid: user?.uid});
  };

  const logOut = () => {
    showAlertConfirm('Logout', 'Do you want to logout?', async () => {
      await auth().signOut();
      dispatch(setUser(null));
      dispatch(updateActivities(0));
      dispatch(updateConversations(0));
    });
  };

  const menuItems = [
    {
      name: 'My Profile',
      icon: 'person-circle-outline',
      color: Colors.blue10,
      onPress: goToProfile,
    },
    {
      name: 'Log Out',
      icon: 'log-out-outline',
      color: Colors.red10,
      onPress: logOut,
    },
  ];

  function renderItem({item}) {
    return (
      <TouchableOpacity onPress={item.onPress ? item.onPress : () => {}}>
        <View row centerV paddingH-10 bg-white>
          <Ionicons name={item.icon} size={30} color={item.color} />
          <Text style={{color: item.color}} text70L margin-10>
            {item.name}
          </Text>
        </View>
        <Divider />
      </TouchableOpacity>
    );
  }

  return (
    <FlatList
      data={menuItems}
      keyExtractor={item => item.name}
      renderItem={renderItem}
      ListHeaderComponent={
        <View bg-white marginB-10 paddingH-10>
          <Text marginV-15 text40BL>
            Settings
          </Text>
        </View>
      }
    />
  );
}
