import {createSlice} from '@reduxjs/toolkit';

const slider = createSlice({
  name: 'noti',
  initialState: {
    activities: 0,
    conversations: 0,
  },
  reducers: {
    updateActivities(state, action) {
      return {...state, activities: action.payload};
    },
    updateConversations(state, action) {
      return {...state, conversations: action.payload};
    },
  },
});

export const {
  addActivity,
  updateActivities,
  addConversation,
  updateConversations,
} = slider.actions;
export default slider.reducer;
