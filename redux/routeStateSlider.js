import {createSlice} from '@reduxjs/toolkit';

const slider = createSlice({
  name: 'routeState',
  initialState: {
    route: '',
    data: null,
  },
  reducers: {
    setRouteState(state, action) {
      return action.payload;
    },
  },
});

export const {setRouteState} = slider.actions;
export default slider.reducer;
