import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'green' }}>
      <Tabs.Screen
        name="Dashboard/index"  // Should match the HomeScreen filename
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="Post/index"  // Should match the SettingsScreen filename
        options={{
          title: 'Add Post',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="electric-bolt" color={color} />,
        }}
      />
      <Tabs.Screen
        name="addNeighbour/index"  // Should match the SettingsScreen filename
        options={{
          title: 'Add Friends',
          tabBarIcon: ({ color }) => <FontAwesome5 size={28} name="user-friends" color={color} />,
        }}
      />
      <Tabs.Screen
        name="ProducerPost/index"  // New screen for producer posts
        options={{
          title: 'My Posts',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="list-alt" color={color} />,
        }}
      />
      <Tabs.Screen
        name="ProProfile/index"  // Should match the SettingsScreen filename
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome5 size={28} name="user-circle" color={color} />,
        }}
      />
       
      <Tabs.Screen
        name="EditProfile/index"
        options={{
          title: "Edit Profile",  // Corrected 'tile' to 'title'
          headerShown: false,
          tabBarButton: () => null,  // Hides the tab button
        }}
      />
     
       <Tabs.Screen
        name="ProducerPost/styles"
        options={{
          title: "Edit Profile",  // Corrected 'tile' to 'title'
          headerShown: false,
          tabBarButton: () => null,  // Hides the tab button
        }}
      />
      <Tabs.Screen
        name="ProducerPost/components/Loading"
        options={{
          title: "Edit Profile",  // Corrected 'tile' to 'title'
          headerShown: false,
          tabBarButton: () => null,  // Hides the tab button
        }}
      />
      <Tabs.Screen
        name="ProducerPost/components/PostItem"
        options={{
          title: "Edit Profile",  // Corrected 'tile' to 'title'
          headerShown: false,
          tabBarButton: () => null,  // Hides the tab button
        }}
      />
    </Tabs>
  );
}