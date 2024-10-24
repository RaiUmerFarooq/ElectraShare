import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{title:"Home"}} />
      <Stack.Screen name="Signup/index" options={{title: "Sign Up"}} />
      <Stack.Screen name="Signin/index" options={{title: "Sign In"}} />
      <Stack.Screen name="Post/index" options={{title: "Add Post",headerShown:true}}/>
    </Stack>
  );
}
