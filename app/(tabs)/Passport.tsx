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
   const [approvedMissions, setApprovedMissions] = useState(0);
   const [missions, setMissions] = useState<any[]>([]);

   const columns = 2;

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

   useEffect(() => {
      const fetchApprovedMissions = async () => {
         const q = query(
            collection(db, "missionSubmissions"),
            where("status", "==", "approved"),
         );

         const snapshot = await getDocs(q);
         setApprovedMissions(snapshot.size);
      };

      fetchApprovedMissions();
   }, []);

   const totalProgress = checkins.length + approvedMissions;
   const allBadges = [...checkins, ...missions];

   useEffect(() => {
      const fetchMissions = async () => {
         const q = query(
            collection(db, "missionSubmissions"),
            where("status", "==", "approved"),
         );

         const snapshot = await getDocs(q);

         const results = snapshot.docs.map((doc) => {
            const data = doc.data();

            return {
               id: doc.id,
               createdAt: data.approvedAt,
               missionTitle: data.missionTitle,
               type: "mission",
            };
         });

         setMissions(results);
      };

      fetchMissions();
   }, []);

   return (
      <View style={styles.container}>
         {/* ===== PROFILE CARD ===== */}
         <View style={styles.profileCard}>
            <View style={styles.avatar}>
               <Text style={{ fontSize: 30 }}>👤</Text>
            </View>

            <View style={{ marginLeft: 15 }}>
               <Text style={styles.username}>Guest User</Text>
               <Text style={styles.subTag}>{getLevel(checkins.length)}</Text>
            </View>
         </View>
         {/* ===== JOURNEY CARD ===== */}
         <View style={styles.journeyCard}>
            <Text style={styles.journeyTitle}>เส้นทางนักผจญภัย</Text>

            <Text style={styles.bigNumber}>
               {totalProgress}
               <Text style={{ fontSize: 16 }}>/15</Text>
            </Text>

            <View style={styles.progressBar}>
               {/* Check-in */}
               <View
                  style={[
                     styles.checkinProgress,
                     { width: `${(checkins.length / 15) * 100}%` },
                  ]}
               />

               {/* Mission */}
               <View
                  style={[
                     styles.missionProgress,
                     { width: `${(approvedMissions / 15) * 100}%` },
                  ]}
               />
            </View>

            <View style={{ flexDirection: "row", marginTop: 10 }}>
               <Text style={{ color: "#f97316", marginRight: 15 }}>
                  ● Check-in
               </Text>
               <Text style={{ color: "#facc15" }}>● Mission</Text>
            </View>
         </View>
         {/* ===== STAMP SECTION ===== */}
         <Text style={styles.sectionTitle}>
            🚩 ตราประทับของคุณ ({totalProgress})
         </Text>

         <FlatList
            key={columns}
            numColumns={columns}
            data={allBadges}
            keyExtractor={(item) => item.id}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item }) => {
               const visitDate = item.createdAt?.toDate?.();

               return (
                  <View style={styles.verticalStamp}>
                     <Image
                        source={
                           item.type === "mission"
                              ? require("../../assets/images/mission_stamp.png")
                              : require("../../assets/images/checkin_stamp.png")
                        }
                        style={styles.verticalBadge}
                     />

                     <Text style={styles.verticalParkName}>
                        {item.missionTitle || "อุทยานแห่งชาติเขาใหญ่"}
                     </Text>

                     <Text style={styles.verticalDate}>
                        📅 {visitDate?.toLocaleDateString("th-TH")}
                     </Text>
                  </View>
               );
            }}
         />
      </View>
   );
}

const styles = StyleSheet.create({
   container: { flex: 1, padding: 20, backgroundColor: "#fff" },
   title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
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
   profileCard: {
      backgroundColor: "#f4f4f4",
      borderRadius: 20,
      padding: 15,
      flexDirection: "row",
      alignItems: "center",
   },

   avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: "#e0f2e9",
      justifyContent: "center",
      alignItems: "center",
   },

   username: {
      fontSize: 18,
      fontWeight: "bold",
   },

   subTag: {
      marginTop: 5,
      color: "#2e7d32",
   },

   journeyCard: {
      backgroundColor: "#1e7f3f",
      borderRadius: 20,
      padding: 20,
      marginTop: 20,
   },

   journeyTitle: {
      color: "#fff",
      fontWeight: "bold",
   },

   bigNumber: {
      color: "#fff",
      fontSize: 30,
      fontWeight: "bold",
      marginTop: 10,
   },

   progressBar: {
      flexDirection: "row",
      height: 8,
      backgroundColor: "#dfe3e1",
      borderRadius: 10,
      marginTop: 10,
      overflow: "hidden",
   },
   
   checkinProgress: {
      height: 8,
      backgroundColor: "#f97316", // orange
   },

   missionProgress: {
      height: 8,
      backgroundColor: "#facc15", // yellow
   },

   sectionTitle: {
      marginTop: 25,
      marginBottom: 15,
      fontWeight: "bold",
      fontSize: 16,
   },

   verticalStamp: {
      backgroundColor: "#f4f8f5",
      borderRadius: 30,
      padding: 15,
      marginBottom: 15,
      alignItems: "center",
      width: "48%", // สำคัญมาก สำหรับ 2 คอลัมน์
      elevation: 3,
   },

   verticalBadge: {
      width: 80,
      height: 80,
   },

   verticalParkName: {
      marginTop: 10,
      fontSize: 14,
      fontWeight: "bold",
      textAlign: "center",
   },

   verticalDate: {
      marginTop: 5,
      fontSize: 12,
      color: "#666",
      textAlign: "center",
   },
});

const getLevel = (count: number) => {
   if (count >= 10) return "Explorer 🏕️";
   if (count >= 5) return "Adventurer 🌲";
   if (count >= 1) return "Beginner 🌱";
   return "No Rank";
};
