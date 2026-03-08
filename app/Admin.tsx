import {
   collection,
   doc,
   onSnapshot,
   query,
   updateDoc,
   where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { Button, FlatList, Image, StyleSheet, Text, View } from "react-native";
import { db } from "../firebase";

type Checkin = {
   id: string;
   imageUrl: string;
   status: string;
   createdAt: any;
   userEmail: string;
};

export default function AdminScreen() {
   const [pendingItems, setPendingItems] = useState<any[]>([]);

   useEffect(() => {
      const q1 = query(
         collection(db, "checkins"),
         where("status", "==", "pending")
      );

      const q2 = query(
         collection(db, "missionSubmissions"),
         where("status", "==", "pending")
      );

      const unsub1 = onSnapshot(q1, (snapshot) => {
         const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            type: "checkin",
            ...doc.data(),
         }));

         setPendingItems((prev) => [...data, ...prev]);
      });

      const unsub2 = onSnapshot(q2, (snapshot) => {
         const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            type: "mission",
            ...doc.data(),
         }));

         setPendingItems((prev) => [...prev, ...data]);
      });

      return () => {
         unsub1();
         unsub2();
      };
   }, []);

   const approveItem = async (item: any) => {
      const ref = doc(
         db,
         item.type === "checkin" ? "checkins" : "missionSubmissions",
         item.id
      );

      await updateDoc(ref, {
         status: "approved",
         approvedAt: new Date(),
      });
   };

   const rejectItem = async (item: any) => {
      const ref = doc(
         db,
         item.type === "checkin" ? "checkins" : "missionSubmissions",
         item.id
      );

      await updateDoc(ref, {
         status: "rejected",
      });
   };

   return (
      <View style={styles.container}>
         <Text style={styles.title}>Admin Approval</Text>

         <FlatList
            data={pendingItems}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={<Text>No pending items 🎉</Text>}
            renderItem={({ item }) => (
               <View style={styles.card}>
                  <Image source={{ uri: item.imageUrl }} style={styles.image} />

                  <Text>
                     {item.type === "mission"
                        ? "🎯 Mission Submission"
                        : "📷 Park Check-in"}
                  </Text>

                  <Text>User: {item.userEmail}</Text>

                  {item.missionTitle && (
                     <Text>Mission: {item.missionTitle}</Text>
                  )}

                  <View style={{ marginTop: 10 }}>
                     <Button
                        title="Approve"
                        onPress={() => approveItem(item)}
                     />
                     <View style={{ height: 10 }} />
                     <Button
                        title="Reject"
                        onPress={() => rejectItem(item)}
                     />
                  </View>
               </View>
            )}
         />
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      padding: 20,
      backgroundColor: "#fff",
   },
   title: {
      fontSize: 22,
      fontWeight: "bold",
      marginBottom: 20,
   },
   card: {
      marginBottom: 25,
   },
   image: {
      width: "100%",
      height: 200,
      borderRadius: 10,
      marginBottom: 10,
   },
});