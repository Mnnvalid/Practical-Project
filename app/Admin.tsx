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
   const [pendingCheckins, setPendingCheckins] = useState<Checkin[]>([]);

   useEffect(() => {
      const q = query(
         collection(db, "checkins"),
         where("status", "==", "pending"),
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
         const results: Checkin[] = snapshot.docs.map((doc) => {
            const data = doc.data();

            return {
               id: doc.id,
               imageUrl: data.imageUrl,
               status: data.status,
               createdAt: data.createdAt,
               userEmail: data.userEmail,
            };
         });

         setPendingCheckins(results);
      });

      return () => unsubscribe();
   }, []);

   const approveCheckin = async (docId: string) => {
      const ref = doc(db, "checkins", docId);

      await updateDoc(ref, {
         status: "approved",
      });
   };

   const rejectCheckin = async (docId: string) => {
      const ref = doc(db, "checkins", docId);

      await updateDoc(ref, {
         status: "rejected",
      });
   };

   return (
      <View style={styles.container}>
         <Text style={styles.title}>Admin Approval</Text>

         <FlatList
            data={pendingCheckins}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={<Text>No pending checkins 🎉</Text>}
            renderItem={({ item }) => (
               <View style={styles.card}>
                  <Image source={{ uri: item.imageUrl }} style={styles.image} />

                  <Text>Uploaded by: {item.userEmail}</Text>

                  <Text>
                     Date:{" "}
                     {item.createdAt?.toDate
                        ? item.createdAt.toDate().toLocaleString()
                        : "No date"}
                  </Text>

                  <View style={{ marginTop: 10 }}>
                     <Button
                        title="Approve"
                        onPress={() => approveCheckin(item.id)}
                     />
                     <View style={{ height: 10 }} />
                     <Button
                        title="Reject"
                        onPress={() => rejectCheckin(item.id)}
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
      marginBottom: 20,
   },
   image: {
      width: "100%",
      height: 200,
      marginBottom: 10,
      borderRadius: 10,
   },
});
