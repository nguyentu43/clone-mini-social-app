import {createSlice} from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'loader',
  initialState: {
    show: true,
    message: 'Loading...',
  },
  reducers: {
    showLoading(state, action) {
      return {...state, show: true, message: action.payload};
    },
    hideLoading(state, action) {
      return {...state, show: false};
    },
  },
});

export const {showLoading, hideLoading} = slice.actions;
export default slice.reducer;
