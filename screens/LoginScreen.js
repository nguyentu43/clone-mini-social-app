import {GoogleSignin} from '@react-native-community/google-signin';
import auth from '@react-native-firebase/auth';
import React, {useEffect, useState} from 'react';
import {ToastAndroid} from 'react-native';
import {AccessToken, LoginManager, Settings} from 'react-native-fbsdk-next';
import {ScrollView} from 'react-native-gesture-handler';
import {Button, Colors, Image, Text, View} from 'react-native-ui-lib';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useDispatch, useSelector} from 'react-redux';
import Logo from '../assets/logo.png';
import TabBarWithView from '../components/TabBarWithView';
import LoginForm from '../forms/LoginForm';
import SignupForm from '../forms/SignupForm';
import {hideLoading} from '../redux/loaderSlider';
import {setUser} from '../redux/userSlider';
import {createUser, getUser} from '../repositories/user';

GoogleSignin.configure({
  webClientId:
    '51148535369-p7c9jj1m5860e7t3g01tuqorn71so0vh.apps.googleusercontent.com',
});

Settings.initializeSDK();

export default function LoginScreen() {
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();
  const [signUpName, setSignUpName] = useState('New User');

  const loginWithGoogle = async () => {
    const {idToken} = await GoogleSignin.signIn();
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    try {
      await auth().signInWithCredential(googleCredential);
    } catch (error) {
      if (error.code === 'auth/account-exists-with-different-credential') {
        ToastAndroid.show(error.message, ToastAndroid.LONG);
      } else {
        throw error;
      }
    }
  };
  const loginWithFacebook = async () => {
    const result = await LoginManager.logInWithPermissions([
      'public_profile',
      'email',
    ]);
    if (result.isCancelled) {
      throw 'User cancelled the login process';
    }
    const data = await AccessToken.getCurrentAccessToken();
    if (!data) {
      throw 'Something went wrong obtaining access token';
    }
    const facebookCredential = auth.FacebookAuthProvider.credential(
      data.accessToken,
    );

    try {
      await auth().signInWithCredential(facebookCredential);
    } catch (error) {
      if (error.code === 'auth/account-exists-with-different-credential') {
        ToastAndroid.show(error.message, ToastAndroid.LONG);
      } else {
        throw error;
      }
    }
  };

  const loginWithEmail = async data => {
    try {
      await auth().signInWithEmailAndPassword(data.email, data.password);
    } catch (error) {
      if (
        ['auth/user-not-found', 'auth/wrong-password'].indexOf(error.code) > -1
      ) {
        ToastAndroid.show(error.message, ToastAndroid.LONG);
      } else {
        throw error;
      }
    }
  };

  const signUp = async data => {
    try {
      setSignUpName(data.displayName);
      await auth().createUserWithEmailAndPassword(data.email, data.password);
    } catch (error) {
      if (['auth/email-already-in-use'].indexOf(error.code) > -1) {
        ToastAndroid.show(error.message, ToastAndroid.LONG);
      } else {
        throw error;
      }
    }
  };

  useEffect(() => {
    const unsubcriber = auth().onAuthStateChanged(userData => {
      if (!userData) {
        dispatch(hideLoading());
        return;
      }
      const {displayName, photoURL, uid, email} = userData;
      getUser(uid)
        .then(user => {
          if (user) {
            return user;
          } else {
            return createUser({
              displayName: displayName || signUpName,
              photoURL,
              uid,
              email,
            });
          }
        })
        .then(user => {
          dispatch(setUser(user));
          dispatch(hideLoading());
        });
    });
    return unsubcriber;
  }, [signUpName]);

  const tabBarItems = [
    {
      label: 'Login',
      getView: () => (
        <View marginH-30 marginT-20>
          <LoginForm onSubmit={loginWithEmail} />
          <Button
            bg-red10
            marginT-20
            label="Login with Google"
            onPress={loginWithGoogle}
            iconSource={() => (
              <Ionicons
                name="logo-google"
                size={20}
                color="white"
                style={{marginRight: 10}}
              />
            )}
          />
          <Button
            marginT-20
            bg-blue10
            label="Login with Facebook"
            onPress={loginWithFacebook}
            iconSource={() => (
              <Ionicons
                name="logo-facebook"
                size={20}
                color="white"
                style={{marginRight: 10}}
              />
            )}
          />
        </View>
      ),
    },
    {
      label: 'Sign Up',
      getView: () => (
        <View marginH-30 marginT-20>
          <SignupForm onSubmit={signUp} />
        </View>
      ),
    },
  ];

  if (user) return null;

  return (
    <ScrollView
      contentContainerStyle={{alignItems: 'center', paddingVertical: 30}}>
      <Image source={Logo} style={{width: 150, height: 150}} />
      <Text text60L marginT-20 marginB-10>
        Join us
      </Text>
      <TabBarWithView
        backgroundColor={Colors.transparent}
        items={tabBarItems}
      />
    </ScrollView>
  );
}
