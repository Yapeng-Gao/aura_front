import React from 'react';
// @ts-ignore
import { NavigationContainer } from '@react-navigation/native';
// @ts-ignore
import { createStackNavigator } from '@react-navigation/stack';
import { MeetingAIScreen } from '../screens/assistant/MeetingAIScreen';
import HomeScreen from '../screens/home/HomeScreen';

const Stack = createStackNavigator();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f4511e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{
            title: 'Aura 效率助手'
          }}
        />
        <Stack.Screen 
          name="MeetingAI" 
          component={MeetingAIScreen} 
          // @ts-ignore
          options={({ route }) => ({ 
            title: '会议AI分析'
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}; 