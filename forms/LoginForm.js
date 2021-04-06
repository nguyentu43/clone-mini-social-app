import React from 'react';
import {useForm, Controller} from 'react-hook-form';
import {TextField, Button} from 'react-native-ui-lib';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function LoginForm({onSubmit}) {
  const {errors, control, handleSubmit} = useForm();

  return (
    <>
      <Controller
        name="email"
        control={control}
        defaultValue=""
        rules={{
          required: 'Email is required',
          pattern: {
            value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
            message: 'Email not valid',
          },
        }}
        render={({onChange, value}) => {
          return (
            <TextField
              title="Email"
              value={value}
              onChangeText={text => onChange(text)}
              textContentType="emailAddress"
              error={errors.email?.message}
            />
          );
        }}
      />

      <Controller
        name="password"
        control={control}
        defaultValue=""
        rules={{
          required: 'Password is required',
          minLength: {value: 6, message: 'Password Length 6-25'},
          maxLength: {value: 25, message: 'Password Length 6-25'},
        }}
        render={({onChange, value}) => {
          return (
            <TextField
              title="Password"
              value={value}
              onChangeText={text => onChange(text)}
              secureTextEntry
              error={errors.password?.message}
            />
          );
        }}
      />
      <Button
        bg-white
        outline
        label="Login with email"
        marginT-10
        onPress={handleSubmit(onSubmit)}
        iconSource={() => (
          <Ionicons
            name="log-in-outline"
            size={20}
            color="blue"
            style={{marginRight: 10}}
          />
        )}
      />
    </>
  );
}
