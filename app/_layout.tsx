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

   if (loading) return null;

   return (
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
         <Stack screenOptions={{ headerShown: false }}>
            {user ? (
               // ถ้า login แล้ว
               <Stack.Screen name="(tabs)" />
            ) : (
               // ถ้ายังไม่ login
               <Stack.Screen name="Login" />
            )}
         </Stack>

         <StatusBar style="auto" />
      </ThemeProvider>
   );
}