import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React, {useEffect} from 'react';
import {AppState} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useDispatch, useSelector} from 'react-redux';
import {updateActivities, updateConversations} from '../redux/notiSlider';
import {removeActivity} from '../repositories/activity';
import {getUser, setUserStatus, updateFCMTokens} from '../repositories/user';
import ActivityScreen from '../screens/ActivityScreen';
import ConversationScreen from '../screens/ConversationScreen';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import SettingScreen from '../screens/SettingScreen';
import * as NotificationService from '../services/notification';

const Tabs = createBottomTabNavigator();

export default function TabsNavigation({navigation}) {
  const notifications = useSelector(state => state.notifications);
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();
  const routeState = useSelector(state => state.routeState);
  const limit = 25;

  async function onSnapshotLocalNotifications(querySnap) {
    if (!querySnap) return;

    const result = await AsyncStorage.getItem('receivedActivities');
    const receivedActivities = result ? JSON.parse(result) : [];

    for (const doc of querySnap.docs) {
      if (receivedActivities.indexOf(doc.id) === -1) {
        const activity = doc.data();
        activity.id = doc.id;
        activity.source = await getUser(activity.source);
        if (
          activity.data.type === 'conversation' &&
          routeState.route === 'ChatModal' &&
          routeState.data?.id === activity.data.id
        ) {
          await removeActivity(activity.id);
          return;
        }

        switch (activity) {
          case 'update-user':
            dispatch(setUser(await getUser(user?.uid)));
            break;
        }

        NotificationService.pushLocalNotification(
          'activity',
          activity.source.displayName + ': ' + activity.message,
          {activity},
        );
        receivedActivities.push(activity.id);
        await AsyncStorage.setItem(
          'receivedActivities',
          JSON.stringify(receivedActivities),
        );
      }
    }
  }

  useEffect(() => {
    if (!user) return;
    const unsubcribe = firestore()
      .collection('activities')
      .where('target', '==', user.uid)
      .where('local', '==', true)
      .where('hasRead', '==', false)
      .limit(limit)
      .onSnapshot(onSnapshotLocalNotifications);
    return unsubcribe;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsubcribe = firestore()
      .collection('activities')
      .where('target', '==', user?.uid)
      .where('hasRead', '==', false)
      .onSnapshot(querySnap => {
        if (!querySnap) return;
        dispatch(updateActivities(querySnap.docs.length));
      });
    return unsubcribe;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsubcribe = firestore()
      .collection('activities')
      .where('target', '==', user?.uid)
      .where('data.type', '==', 'conversation')
      .where('hasRead', '==', false)
      .onSnapshot(querySnap => {
        if (!querySnap) return;
        dispatch(updateConversations(querySnap.docs.length));
      });
    return unsubcribe;
  }, [user]);

  async function handleAppStateChange(appState) {
    console.log('appstate', appState);
    if (appState === 'active') {
      await setUserStatus(user?.uid, 'online');
    } else {
      await setUserStatus(user?.uid, 'offline');
    }
  }

  useEffect(() => {
    if (!user) return;
    AppState.addEventListener('change', handleAppStateChange);
    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    };
  }, [user]);

  async function onCallbackNotification(notification) {
    let activity = notification.data.activity;
    if (!notification.foreground) {
      activity = JSON.parse(activity);
    }
    if (activity) {
      await NotificationService.onHandleActivity(activity, navigation, user);
    }
  }

  async function onRegister({token}) {
    await updateFCMTokens(user.uid, token);
  }

  useEffect(() => {
    if (!user) return;
    NotificationService.register(onRegister, onCallbackNotification);
    return NotificationService.unregister;
  }, [user]);

  return (
    <Tabs.Navigator
      tabBarOptions={{activeTintColor: 'black'}}
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;
          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Search':
              iconName = focused ? 'search' : 'search-outline';
              break;
            case 'Activities':
              iconName = focused ? 'notifications' : 'notifications-outline';
              break;
            case 'Conversations':
              iconName = focused
                ? 'chatbox-ellipses'
                : 'chatbox-ellipses-outline';
              break;
            case 'Setting':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}>
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Search" component={SearchScreen} />
      <Tabs.Screen
        name="Activities"
        options={{tabBarBadge: notifications.activities}}
        component={ActivityScreen}
      />
      <Tabs.Screen
        name="Conversations"
        options={{tabBarBadge: notifications.conversations}}
        component={ConversationScreen}
      />
      <Tabs.Screen name="Setting" component={SettingScreen} />
    </Tabs.Navigator>
  );
}
