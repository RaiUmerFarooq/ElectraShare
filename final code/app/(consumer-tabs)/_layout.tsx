import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'green', tabBarInactiveTintColor: 'gray', tabBarStyle: { backgroundColor: '#fff' } }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="AddProducer/index"
        options={{
          title: 'Request',
          tabBarIcon: ({ color }) => <AntDesign size={28} name="addusergroup" color={color} />,
        }}
      />
      <Tabs.Screen
        name="ViewPost/index"
        options={{
          title: 'Post',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="compost" color={color} />,
        }}
      />
        <Tabs.Screen
          name="profile/index"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <FontAwesome5 size={28} name="user-circle" color={color} />,
          }}
        />
      <Tabs.Screen
        name="EditProfile/index"
        options={{
          title: "Edit Profile",
          headerShown: false,
          tabBarButton: () => null,
        }}
      />
    </Tabs>
  );
}
