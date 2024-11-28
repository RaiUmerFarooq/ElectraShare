import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{title:"Tabs",headerShown:false}}/>
      <Stack.Screen name="(consumer-tabs)" options={{title:"Consumer",headerShown:false}}/>
      <Stack.Screen name="index" options={{title:"Home"}} />
      <Stack.Screen name="(auth)/Signup/index" options={{title: "Sign Up"}} />
      <Stack.Screen name="(auth)/Signin/index" options={{title: "Sign In"}} />
      <Stack.Screen name="Post/index" options={{title: "Add Post",headerShown:true}}/>
      <Stack.Screen name="Dashboard/index" options={{title: "Dashboard",headerShown:true}}/>
    </Stack>
  );
}
