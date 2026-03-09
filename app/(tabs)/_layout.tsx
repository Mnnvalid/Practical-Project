import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
   return (
      <Tabs>
         <Tabs.Screen
            name="Home"
            options={{
               title: "Home",
               tabBarIcon: ({ color, size }) => (
                  <Ionicons name="home" size={size} color={color} />
               ),
            }}
         />

         <Tabs.Screen
            name="Map"
            options={{
               title: "Map",
               tabBarIcon: ({ color, size }) => (
                  <Ionicons name="map" size={size} color={color} />
               ),
            }}
         />

         <Tabs.Screen
            name="Passport"
            options={{
               title: "Passport",
               tabBarIcon: ({ color, size }) => (
                  <Ionicons name="book" size={size} color={color} />
               ),
            }}
         />

         <Tabs.Screen
            name="Profile"
            options={{
               title: "Profile",
               tabBarIcon: ({ color, size }) => (
                  <Ionicons name="person" size={size} color={color} />
               ),
            }}
         />
      </Tabs>
   );
}