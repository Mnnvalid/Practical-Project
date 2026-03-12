import { getAuth } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { db } from "../../firebase";

const auth = getAuth();

export default function MapPage() {
   const user = auth.currentUser
   const [parks, setParks] = useState<any[]>([]);
   const [approvedParks, setApprovedParks] = useState<string[]>([]);
   const [selectedPark, setSelectedPark] = useState<any>(null);

   useEffect(() => {
      fetchParks();
      fetchCheckins();
   }, []);

   const fetchParks = async () => {
      const snapshot = await getDocs(collection(db, "parks"));

      const data = snapshot.docs.map((doc) => ({
         id: doc.id,
         ...doc.data(),
      }));

      setParks(data);
   };

   const fetchCheckins = async () => {
      const user = auth.currentUser;

      const q = query(
         collection(db, "checkins"),
         where("userId", "==", user?.uid),
         where("status", "==", "approved"),
      );

      const snapshot = await getDocs(q);

      const parkIds = snapshot.docs.map((doc) => doc.data().parkId);

      setApprovedParks(parkIds);
   };

   return (
      <TouchableOpacity
         style={{ flex: 1 }}
         activeOpacity={1}
         onPress={() => setSelectedPark(null)}
      >
         <View
            style={{
               flex: 1,
               alignItems: "center",
               justifyContent: "center",
               backgroundColor: "white",
            }}
         >
            <Image
               source={require("../../assets/images/th2_map.png")}
               style={{ width: 650, height: 600 }}
               resizeMode="contain"
            />

            {parks.map((park) => {
               const checked = approvedParks.includes(park.id);

               return (
                  <TouchableOpacity
                     key={park.id}
                     onPress={() => setSelectedPark(park)}
                     style={{
                        position: "absolute",
                        top: park.top,
                        left: park.left,
                        alignItems: "center",
                     }}
                  >
                     <Text style={{ fontSize: 20 }}>
                        {checked ? "⭐" : "🌳"}
                     </Text>
                  </TouchableOpacity>
               );
            })}

            {selectedPark && (
               <View
                  style={{
                     position: "absolute",
                     top: selectedPark.top - 35,
                     left: selectedPark.left - 40,
                     backgroundColor: "white",
                     paddingHorizontal: 10,
                     paddingVertical: 6,
                     borderRadius: 15,
                     shadowColor: "#000",
                     shadowOpacity: 0.3,
                     shadowRadius: 4,
                     elevation: 4,
                  }}
               >
                  <Text style={{ fontWeight: "bold" }}>
                     {selectedPark.name}
                  </Text>
               </View>
            )}
         </View>
      </TouchableOpacity>
   );
}
