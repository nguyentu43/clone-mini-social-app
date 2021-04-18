import {createSlice} from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'loader',
  initialState: {
    show: true,
    message: 'Loading...',
  },
  reducers: {
    showLoading(state, action) {
      state.show = true;
      state.message = action.payload;
    },
    hideLoading(state, action) {
      state.show = false;
    },
  },
});

export const {showLoading, hideLoading} = slice.actions;
export default slice.reducer;
