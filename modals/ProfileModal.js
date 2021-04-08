import React, {useEffect, useMemo, useState} from 'react';
import {Dimensions, FlatList, TouchableOpacity, Alert} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import prompt from 'react-native-prompt-android';
import {
  Avatar,
  Button,
  ProgressiveImage,
  Text,
  View,
} from 'react-native-ui-lib';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useDispatch, useSelector} from 'react-redux';
import Divider from '../components/Divider';
import ImageViewer from '../components/ImageViewer';
import PostList from '../components/PostList';
import TabBarWithView from '../components/TabBarWithView';
import {hideLoading, showLoading} from '../redux/loaderSlider';
import {setUser} from '../redux/userSlider';
import {getAllPosts} from '../repositories/post';
import {getAllPhotos, uploadFile} from '../repositories/storage';
import {
  requestAddFriend,
  getUser,
  unFriend,
  updateUser,
} from '../repositories/user';
import _ from 'lodash';
import moment from 'moment';

export default function ProfileModal({route, navigation}) {
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState(null);
  const [photoData, setPhotoData] = useState(null);
  const [visibleImageView, setVisibleImageView] = useState(false);
  const [indexImage, setIndexImage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const limit = 15;

  const isOwner = useMemo(() => route.params.uid === user?.uid, [user, route]);

  async function fetchData() {
    dispatch(showLoading('Loading Profile'));
    const profile = await getUser(route.params.uid);
    setProfile(profile);
    const photoData = await getAllPhotos(profile.uid);
    setPhotoData(photoData);
    dispatch(hideLoading());
    const posts = await getAllPosts(profile.uid, limit);
    setPosts(posts);
  }

  async function changePhoto() {
    if (!isOwner) return;
    try {
      const image = await ImagePicker.openPicker({mediaType: 'photo'});
      dispatch(showLoading('Upload Photo'));
      const file = await uploadFile(profile.uid, image.path, profile.photo);
      const user = await updateUser({
        ...profile,
        photo: file.filename,
        photoURL: file.uri,
      });
      setProfile(user);
      setUser(user);
      dispatch(hideLoading());
    } catch (error) {
      if (['E_PICKER_CANCELLED'].indexOf(error.code) === -1) {
        throw error;
      }
    }
  }

  async function changeDisplayName() {
    if (!isOwner) return;
    prompt(
      'Edit name',
      'Enter name',
      async message => {
        if (message.trim() === '') return;
        const user = await updateUser({
          ...profile,
          displayName: message.trim(),
        });
        setProfile(user);
        setUser(user);
      },
      {
        defaultValue: profile.displayName,
      },
    );
  }

  async function onEndReachedPosts() {
    if (loading) return;
    setLoading(true);
    const result = await getAllPosts(profile.uid, limit, _.last(posts));
    setPosts(posts.concat(result));
    setLoading(false);
  }

  async function onEndReachedPhotos() {
    if (!photoData?.pageToken) return;
    if (loadingPhoto) return;
    setLoadingPhoto(true);
    const result = await getAllPhotos(profile.uid, photoData.pageToken);
    const items = photoData.items.concat(result.items);
    setPhotoData({
      items,
      pageToken: result.pageToken,
    });
    setLoadingPhoto(false);
  }

  const tabItems = useMemo(
    () => [
      {
        label: 'Posts',
        getView: () => (
          <PostList
            data={posts}
            onEndReached={onEndReachedPosts}
            navigation={navigation}
          />
        ),
      },
      {
        label: 'Photos',
        getView: () => {
          const renderItem = ({item, index}) => {
            const width = Dimensions.get('window').width / 3;
            return (
              <TouchableOpacity
                onPress={() => {
                  setVisibleImageView(true);
                  setIndexImage(index);
                }}>
                <ProgressiveImage
                  style={{width, height: width, resizeMode: 'cover'}}
                  source={{uri: item.uri}}
                />
              </TouchableOpacity>
            );
          };
          return (
            <FlatList
              listKey={(_, index) => index}
              numColumns={3}
              horizontal={false}
              keyExtractor={item => item.filename}
              data={photoData && photoData.items}
              onEndReached={onEndReachedPhotos}
              renderItem={renderItem}
            />
          );
        },
      },
    ],
    [posts, photoData],
  );

  useEffect(() => {
    fetchData();
  }, []);

  const images = useMemo(() => {
    if (!photoData) return null;
    return photoData.items.map(item => ({url: item.uri}));
  }, [photoData]);

  const isFriend = useMemo(() => {
    if (user && profile) {
      return user.friends.indexOf(profile?.uid) > -1;
    }
    return false;
  }, [user, profile]);

  function onClose() {
    setVisibleImageView(false);
  }

  async function syncUserInfo() {
    dispatch(setUser(await getUser(user.uid)));
    Alert.alert('Sync info', 'Sync info has completed');
  }

  async function onPressFriendButton() {
    if (isFriend) {
      await unFriend(user.uid, profile.uid);
      dispatch(
        setUser({
          ...user,
          friends: user.friends.filter(f => f !== profile.uid),
        }),
      );
    } else {
      await requestAddFriend(user.uid, profile.uid);
      Alert.alert('Send request', 'Have sent make friends');
    }
  }

  function onPressFriendList() {
    if (isOwner) {
      navigation.push('UserListModal', {data: user.friends});
    }
  }

  if (!profile) return null;

  return (
    <>
      <ImageViewer
        index={indexImage}
        images={images}
        visible={visibleImageView}
        onClose={onClose}
      />
      <FlatList
        ListHeaderComponent={
          <View marginB-10>
            <View center paddingV-10 bg-white>
              <Avatar
                ribbonLabel={isOwner ? 'Change photo' : ''}
                source={{uri: profile.photoURL}}
                size={100}
                onPress={changePhoto}
              />
              <TouchableOpacity
                style={{flexDirection: 'row'}}
                onPress={changeDisplayName}>
                <Text text40 marginT-10 marginH-10>
                  {profile.displayName}
                </Text>
                {isOwner && <Ionicons name="create-outline" size={20} />}
              </TouchableOpacity>
              {isOwner && (
                <Button
                  onPress={syncUserInfo}
                  marginV-10
                  label="Sync user info"
                  size={Button.sizes.medium}
                />
              )}
              {!isOwner &&
                (isFriend ? (
                  <Button
                    marginT-5
                    onPress={onPressFriendButton}
                    size={Button.sizes.medium}
                    iconSource={() => (
                      <Ionicons
                        style={{marginRight: 10}}
                        size={20}
                        color="white"
                        name="person-remove-outline"
                      />
                    )}
                    label="Unfriend"
                  />
                ) : (
                  <Button
                    marginT-5
                    onPress={onPressFriendButton}
                    size={Button.sizes.medium}
                    iconSource={() => (
                      <Ionicons
                        style={{marginRight: 10}}
                        size={20}
                        color="white"
                        name="person-add-outline"
                      />
                    )}
                    label="Add friend"
                  />
                ))}
            </View>
            <Divider />
            <View
              row
              paddingV-10
              bg-white
              style={{justifyContent: 'space-evenly'}}>
              <View centerH>
                <Text text30L>{posts && posts.length}</Text>
                <Text marginT-5>Posts</Text>
              </View>
              <TouchableOpacity onPress={onPressFriendList}>
                <View centerH>
                  <Text text30L>{profile && profile.friends.length}</Text>
                  <Text marginT-5>Friends</Text>
                </View>
              </TouchableOpacity>
              <View centerH>
                <Text text30L>{photoData && photoData.items.length}</Text>
                <Text marginT-5>Photos</Text>
              </View>
            </View>
          </View>
        }
        ListFooterComponent={<TabBarWithView items={tabItems} />}
      />
    </>
  );
}
