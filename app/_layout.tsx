import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{title:"Home"}} />
      <Stack.Screen name="Signup/index" options={{title: "Signup"}} />
      <Stack.Screen name="Signin/index" options={{title: "Signin"}} />
    </Stack>
  );
}
