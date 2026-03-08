import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { View, Image } from "react-native";
import { auth, db } from "../../firebase";

export default function MapPage() {
   const [parks, setParks] = useState<any[]>([]);
   const [approvedParks, setApprovedParks] = useState<string[]>([]);

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
      <View style={{flex:1, alignItems:"center", justifyContent:"center"}}>
         <Image
            source={require("../../assets/images/th_map.png")}
            style={{width:350, height:500}}
         />

         {/* marker */}
         <View style={{
            position:"absolute",
            top:120,
            left:180,
            width:12,
            height:12,
            borderRadius:10,
            backgroundColor:"gray"
         }}/>
      </View>
   );
}
