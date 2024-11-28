import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'green' }}>
      <Tabs.Screen
        name="index"  // Should match the HomeScreen filename
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="AddProducer/index"  // Should match the HomeScreen filename
        options={{
          title: 'Request',
          tabBarIcon: ({ color }) => <AntDesign size={28} name="addusergroup" color={color} />,
        }}
      />
      {/* <Tabs.Screen
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
      /> */}
      <Tabs.Screen
        name="profile/index"  // Should match the SettingsScreen filename
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <FontAwesome5 size={28} name="user-circle" color={color} />,
        }}
      />
      <Tabs.Screen
      name="EditProfile/index"
      options={{tile: "Edit Profile",
      headerShown:false,
      tabBarButton: () => null,
      }}
      />
    </Tabs>
  );
}
