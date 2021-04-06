import React, {useEffect, useState} from 'react';
import {
  Picker,
  Text,
  TextField,
  View,
  Button,
  Avatar,
  Colors,
} from 'react-native-ui-lib';
import {useForm, Controller} from 'react-hook-form';
import {useSelector} from 'react-redux';
import {getUser} from '../repositories/user';
import _ from 'lodash';
import {addConversation} from '../repositories/chat';

export default function AddConversationModal({navigation}) {
  const {errors, control, handleSubmit} = useForm();
  const user = useSelector(state => state.user);
  const [friends, setFriends] = useState({});

  async function fetchData() {
    const result = await Promise.all(
      user.friends.map(async uid => await getUser(uid)),
    );
    const mapFriends = {};
    for (const f of result) {
      mapFriends[f.uid] = f;
    }
    setFriends(mapFriends);
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function onSubmit(data) {
    const conversation = await addConversation(
      user.uid,
      data.participants,
      data.title,
    );
    conversation.owner = user;
    conversation.participants = data.participants.map(p => friends[p]);
    navigation.replace('ChatModal', {conversation});
  }

  return (
    <View flex-1>
      <View marginB-10 padding-10 bg-white>
        <Text text40H>Add Conversation</Text>
      </View>
      <View padding-10 bg-white>
        <Controller
          control={control}
          name="title"
          defaultValue=""
          rules={{required: 'Title required'}}
          render={({onChange, value}) => (
            <TextField
              value={value}
              placeholder="Enter title"
              onChangeText={text => onChange(text)}
              title="Title"
              error={errors.title?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="participants"
          defaultValue={[]}
          rules={{
            validate: v => v.length > 0,
          }}
          render={({onChange, value}) => (
            <>
              <Picker
                value={value}
                onChange={onChange}
                placeholder="Pick some participants"
                getLabel={items =>
                  items.map(uid => friends[uid].displayName).join(', ')
                }
                mode={Picker.modes.MULTI}>
                {Object.entries(friends).map(([uid, item], index) => (
                  <Picker.Item
                    key={index}
                    value={uid}
                    label={item.label}
                    renderItem={(uid, props) => {
                      return (
                        <View
                          padding-10
                          row
                          centerV
                          style={{
                            borderBottomWidth: 1,
                            backgroundColor: props.isSelected
                              ? Colors.grey60
                              : 'white',
                            borderColor: Colors.dark80,
                          }}>
                          <Avatar
                            size={50}
                            containerStyle={{marginRight: 10}}
                            source={{uri: friends[uid].photoURL}}
                          />
                          <Text black text70L>
                            {friends[uid].displayName}
                          </Text>
                        </View>
                      );
                    }}
                  />
                ))}
              </Picker>
              {errors.participants && (
                <Text red10 marginB-10>
                  Participants not empty
                </Text>
              )}
            </>
          )}
        />

        <Button
          label="Create a conversation"
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </View>
  );
}
