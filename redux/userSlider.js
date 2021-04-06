import {createSlice} from '@reduxjs/toolkit';
import moment from 'moment';

const slider = createSlice({
  name: 'user',
  initialState: null,
  reducers: {
    setUser(_, action) {
      if (!action.payload) return null;
      return {
        ...action.payload,
        lastLogin: moment.unix(action.payload.lastLogin.seconds).format(),
      };
    },
  },
});

export const {setUser} = slider.actions;
export default slider.reducer;
