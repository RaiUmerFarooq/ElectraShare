import { Stack } from "expo-router";
import Dashboard from "./Dashboard";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{title:"Home"}} />
      <Stack.Screen name="Signup/index" options={{title: "Sign Up"}} />
      <Stack.Screen name="Signin/index" options={{title: "Sign In"}} />
      <Stack.Screen name="Post/index" options={{title: "Add Post",headerShown:true}}/>
      <Stack.Screen name="Dashboard/index" options={{title: "Dashboard",headerShown:true}}/>
    </Stack>
  );
}
