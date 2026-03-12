import { View, Text, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import * as Location from "expo-location";

export default function ParkDetail() {

   const [canCheckin, setCanCheckin] = useState(false);

   useEffect(() => {
      checkLocation();
   }, []);

   const checkLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
         alert("ต้องอนุญาต location");
         return;
      }

      const location = await Location.getCurrentPositionAsync({});
      
      console.log(location.coords);
   };

   const handleCheckin = () => {
      alert("Check-in สำเร็จ 🎉");
   };

   return (
      <View style={{ padding: 20 }}>

         <Text style={{ fontSize: 20 }}>
            Park Detail
         </Text>

         {canCheckin ? (
            <TouchableOpacity onPress={handleCheckin}>
               <Text>Check-in 📍</Text>
            </TouchableOpacity>
         ) : (
            <Text>คุณต้องอยู่ในอุทยานเพื่อ Check-in</Text>
         )}

      </View>
   );
}