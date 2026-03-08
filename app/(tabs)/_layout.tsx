import {
   DarkTheme,
   DefaultTheme,
   ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";

export const unstable_settings = {
   anchor: "(tabs)",
};

export default function RootLayout() {
   const colorScheme = useColorScheme();

   const [user, setUser] = useState<User | null>(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const auth = getAuth();

      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
         setUser(firebaseUser);
         setLoading(false);
      });

      return unsubscribe;
   }, []);

   // 🔥 รอ auth restore ก่อน render
   if (loading) return null;

   return (
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
         <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
               name="modal"
               options={{ presentation: "modal", title: "Modal" }}
            />
         </Stack>
         <StatusBar style="auto" />
      </ThemeProvider>
   );
}
