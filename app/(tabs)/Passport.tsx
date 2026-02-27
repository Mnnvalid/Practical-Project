import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import { db } from "../../firebase";

type Checkin = {
   id: string;
   imageUrl: string;
   status: string;
   createdAt: any;
};

export default function Passport() {
   const [checkins, setCheckins] = useState<Checkin[]>([]);

   useEffect(() => {
      fetchApproved();
   }, []);

   const fetchApproved = async () => {
      const q = query(
         collection(db, "checkins"),
         where("status", "==", "approved"),
      );

      const snapshot = await getDocs(q);

      const results: Checkin[] = snapshot.docs.map((doc) => {
         const data = doc.data();

         return {
            id: doc.id,
            imageUrl: data.imageUrl,
            status: data.status,
            createdAt: data.createdAt,
         };
      });

      setCheckins(results);
   };

   return (
      <View style={styles.container}>
         <Text style={styles.title}>My Passport</Text>
         <Text style={styles.count}>Total Stamps: {checkins.length}</Text>
         <Text style={styles.level}>Level: {getLevel(checkins.length)}</Text>

         <FlatList
            data={checkins}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
               <Text style={{ textAlign: "center", marginTop: 40 }}>
                  No approved stamps yet 🌿
               </Text>
            }
            renderItem={({ item }) => (
               <Image source={{ uri: item.imageUrl }} style={styles.image} />
            )}
         />
      </View>
   );
}

const styles = StyleSheet.create({
   container: { flex: 1, padding: 20, backgroundColor: "#fff" },
   title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
   image: {
      width: 120,
      height: 120,
      marginBottom: 15,
      borderRadius: 10,
   },
   count: {
      fontSize: 16,
      marginBottom: 5,
   },

   level: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 20,
      color: "#2e7d32",
   },
});

const getLevel = (count: number) => {
   if (count >= 10) return "Explorer 🏕️";
   if (count >= 5) return "Adventurer 🌲";
   if (count >= 1) return "Beginner 🌱";
   return "No Rank";
};
