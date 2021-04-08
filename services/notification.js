import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import {setReadActivity} from '../repositories/activity';
import {showAlertConfirm} from '../utils/alert';
import {addFriend} from '../repositories/user';
import {getConversation} from '../repositories/chat';
import {firebase} from '../configs.json';
import {setUser} from '../redux/userSlider';

export function pushLocalNotification(channelId, message, data = {}) {
  PushNotification.localNotification({
    channelId,
    message,
    userInfo: data,
  });
}

export function createChannelLocalNotification() {
  PushNotification.createChannel({
    channelId: 'activity',
    channelName: 'Activities',
    importance: 4,
    vibrate: true,
  });
}

export function register(onRegister, onCallback) {
  PushNotification.configure({
    onRegister,
    onNotification: async function (notification) {
      console.log('NOTIFICATION:', notification);
      await onCallback(notification);
      notification.finish(PushNotificationIOS.FetchResult.NoData);
    },
    requestPermissions: true,
  });
}

export async function pushRemoteNotification(tokens, message, data) {
  for (const token of tokens) {
    await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `key=${firebase.serverKey}`,
      },
      body: JSON.stringify({
        to: token,
        notification: {
          body: message,
          title: 'Activity',
        },
        data,
      }),
    });
  }
}

export async function onHandleActivity(item, navigation, user) {
  await setReadActivity(item.id);
  switch (item.data.type) {
    case 'post':
      navigation.push('PostModal', {id: item.data.id});
      break;
    case 'conversation':
      const conversation = await getConversation(item.data.id);
      navigation.push('ChatModal', {conversation});
      break;
    case 'add-friend':
      if (item.hasRead) return;
      showAlertConfirm(
        'Request make friends',
        'Do you want to accept?',
        async () => {
          await addFriend(user.uid, item.source.uid);
          Alert.alert(
            'Make friends',
            item.source.displayName + ' has a friend',
          );
        },
      );
      break;
  }
}

export function unregister() {
  PushNotification.unregister();
}
