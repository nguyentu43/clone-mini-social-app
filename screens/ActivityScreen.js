import _ from 'lodash';
import React, {useEffect, useState} from 'react';
import {FlatList} from 'react-native';
import {Text, View} from 'react-native-ui-lib';
import {useDispatch, useSelector} from 'react-redux';
import ActivityItem from '../components/ActivityItem';
import {getAllActivities, removeActivity} from '../repositories/activity';
import {onHandleActivity} from '../services/notification';
import {showAlertConfirm} from '../utils/alert';

export default function ActivityScreen({navigation}) {
  const [activities, setActivities] = useState([]);
  const user = useSelector(state => state.user);
  const [refreshing, setRefreshing] = useState(false);
  const [fetching, setFetching] = useState(false);
  const dispatch = useDispatch();

  async function fetchData() {
    setRefreshing(true);
    const result = await getAllActivities(user?.uid, 25);
    setActivities(result);
    setRefreshing(false);
  }

  async function onEndReached() {
    if (fetching) return;
    setFetching(true);
    const result = await getAllActivities(user?.uid, 25, _.last(activities));
    setActivities(activities.concat(result));
    setFetching(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function onDeleteItem(item) {
    showAlertConfirm('Delete activity', 'Do you want to delete', async () => {
      await removeActivity(item.id);
      setActivities(activities.filter(act => act.id != item.id));
    });
  }

  function renderItem({item}) {
    return (
      <ActivityItem
        onDelete={() => onDeleteItem(item)}
        data={item}
        onRead={() => onHandleActivity(item, navigation, user)}
      />
    );
  }

  if (!activities) return null;

  return (
    <FlatList
      refreshing={refreshing}
      onRefresh={fetchData}
      onEndReached={onEndReached}
      style={{flex: 1}}
      data={activities}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      ListHeaderComponent={
        <View bg-white marginB-10 paddingH-10>
          <Text marginV-15 text40BL>
            Activities
          </Text>
        </View>
      }
    />
  );
}
