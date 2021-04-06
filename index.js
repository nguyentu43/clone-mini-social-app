/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import * as NotificationService from './services/notification';
import * as Sentry from '@sentry/react-native';
import configs from './configs.json';

AppRegistry.registerComponent(appName, () => App);
NotificationService.createChannelLocalNotification();

Sentry.init({
  dsn: configs.sentry.dsn,
});
