import React, {useEffect, useState} from 'react';
import {View, Text, Colors, TextField} from 'react-native-ui-lib';
import {ScrollView, TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {createPost, updatePost} from '../repositories/post';
import {useDispatch, useSelector} from 'react-redux';
import {deleteFile, uploadFile} from '../repositories/storage';
import {hideLoading, showLoading} from '../redux/loaderSlider';
import {Controller, useForm} from 'react-hook-form';
import ImagePicker from '../components/ImagePicker';

export default function EditPostModal({route}) {
  const [lastPost, setLastPost] = useState(null);
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();
  const {errors, control, handleSubmit, setValue} = useForm();

  async function savePost({content, images}) {
    const editPost = {...lastPost, content};
    dispatch(showLoading('Saving Post'));
    editPost.images = [];
    for (const image of images) {
      if (image.status === 'pending') {
        const file = await uploadFile(user?.uid, image.uri);
        editPost.images.push(file.filename);
      } else if (image.status === 'remove') {
        await deleteFile(user?.uid, image.filename);
      } else {
        editPost.images.push(image.filename);
      }
    }
    editPost.owner = user?.uid;

    let savedPost = null;
    if (lastPost.id) {
      savedPost = await updatePost(editPost);
    } else {
      savedPost = await createPost(editPost);
    }
    setValue(
      'images',
      savedPost.images.map(item => ({
        ...item,
        status: 'uploaded',
      })),
    );
    setLastPost(savedPost);
    dispatch(hideLoading());
  }

  useEffect(() => {
    const params = route.params;
    const images = params.post.images.map(item => ({
      ...item,
      status: 'uploaded',
    }));
    setLastPost(params.post);
    setValue('content', params.post.content);
    setValue('images', images);
  }, []);

  return (
    <ScrollView style={{backgroundColor: 'white', paddingHorizontal: 10}}>
      <View row spread paddingV-10 centerV>
        <Text text40H>Post something</Text>
        <TouchableOpacity onPress={handleSubmit(savePost)}>
          <Ionicons
            name="arrow-up-circle-outline"
            size={40}
            color={Colors.green10}
          />
        </TouchableOpacity>
      </View>
      <View>
        <Controller
          name="content"
          control={control}
          defaultValue=""
          rules={{required: 'Content not empty'}}
          render={({value, onChange}) => {
            return (
              <TextField
                title="Content"
                value={value}
                multiline
                errorMessage={errors.content?.message}
                onChangeText={text => onChange(text)}
              />
            );
          }}
        />
        <Controller
          name="images"
          control={control}
          defaultValue={[]}
          render={({value, onChange}) => {
            return <ImagePicker images={value} onChange={onChange} />;
          }}
        />
      </View>
    </ScrollView>
  );
}
