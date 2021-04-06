import React, {useState} from 'react';
import {TabBar, View} from 'react-native-ui-lib';

export default function TabBarWithView({items = [], ...props}) {
  const [selectedIndex, setIndex] = useState(0);

  return (
    <>
      <TabBar
        selectedIndex={selectedIndex}
        onChangeIndex={index => setIndex(index)}
        {...props}>
        {items.map((item, index) => (
          <TabBar.Item key={index} label={item.label} />
        ))}
      </TabBar>
      {items.map((item, index) => (
        <View
          key={index}
          style={{
            alignSelf: 'stretch',
            display: index === selectedIndex ? 'flex' : 'none',
          }}>
          {item.getView()}
        </View>
      ))}
    </>
  );
}
