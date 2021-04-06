import {Alert} from 'react-native';

export function showAlertConfirm(title, message, onPressYes) {
  Alert.alert(title, message, [
    {
      style: 'cancel',
      text: 'No',
    },
    {
      style: 'destructive',
      text: 'Yes',
      onPress: onPressYes,
    },
  ]);
}
