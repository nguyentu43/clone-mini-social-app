import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {LoaderScreen} from 'react-native-ui-lib';
import {useSelector} from 'react-redux';
import AddConversationModal from '../modals/AddConversationModal';
import ChatModal from '../modals/ChatModal';
import CommentListModal from '../modals/CommentListModal';
import EditPostModal from '../modals/EditPostModal';
import PostModal from '../modals/PostModal';
import ProfileModal from '../modals/ProfileModal';
import UserListModal from '../modals/UserListModal';
import LoginScreen from '../screens/LoginScreen';
import TabsNavigation from './TabsNavigation';

const Stack = createStackNavigator();

export default function RootNavigation() {
  const loader = useSelector(state => state.loader);
  const user = useSelector(state => state.user);

  return (
    <>
      {loader.show && (
        <LoaderScreen
          overlay
          message={loader.message}
          backgroundColor="white"
        />
      )}
      <NavigationContainer>
        <Stack.Navigator mode="modal" screenOptions={{headerShown: false}}>
          {!user ? (
            <Stack.Screen name="Login" component={LoginScreen} />
          ) : (
            <>
              <Stack.Screen name="TabsNavigation" component={TabsNavigation} />
              <Stack.Screen name="ChatModal" component={ChatModal} />
              <Stack.Screen
                name="AddConversationModal"
                component={AddConversationModal}
              />
              <Stack.Screen
                name="CommentListModal"
                component={CommentListModal}
              />
              <Stack.Screen name="UserListModal" component={UserListModal} />
              <Stack.Screen name="PostModal" component={PostModal} />
              <Stack.Screen name="EditPostModal" component={EditPostModal} />
              <Stack.Screen name="ProfileModal" component={ProfileModal} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
