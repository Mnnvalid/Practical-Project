import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
   collection,
   doc,
   getDoc,
   getDocs,
   query,
   setDoc,
   where,
} from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { useEffect, useState } from "react";
import {
   FlatList,
   Image,
   ScrollView,
   StyleSheet,
   Text,
   TouchableOpacity,
   View,
} from "react-native";
import { auth, db } from "../../firebase";

type Checkin = {
   id: string;
   imageUrl: string;
   createdAt: any;
   type: "checkin";
   status: "approved" | "pending";
};

export default function Passport() {
   const user = auth.currentUser;

   const [checkins, setCheckins] = useState<Checkin[]>([]);
   const [approvedMissions, setApprovedMissions] = useState(0);
   const [missions, setMissions] = useState<any[]>([]);
   const [userData, setUserData] = useState<any>(null);

   const columns = 2;

   useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
         if (user) {
            loadUserData(user.uid);
         } else {
            setUserData(null);
            setCheckins([]);
         }
      });

      return unsubscribe;
   }, []);

   useEffect(() => {
      fetchApproved();
   }, []);
   const fetchApproved = async () => {
      const q = query(
         collection(db, "checkins"),
         where("status", "==", "approved"),
         where("userId", "==", user?.uid),
      );

      const snapshot = await getDocs(q);

      const results: Checkin[] = snapshot.docs.map((doc) => {
         const data = doc.data();

         return {
            id: doc.id,
            imageUrl: data.imageUrl,
            status: data.status,
            createdAt: data.createdAt,
            type: data.type,
         };
      });

      setCheckins(results);
   };

   useEffect(() => {
      const fetchApprovedMissions = async () => {
         const q = query(
            collection(db, "missionSubmissions"),
            where("status", "==", "approved"),
            where("userId", "==", user?.uid),
         );

         const snapshot = await getDocs(q);
         setApprovedMissions(snapshot.size);
      };

      fetchApprovedMissions();
   }, []);

   const approvedCheckins = checkins.filter((c) => c.status === "approved");

   const totalProgress = approvedCheckins.length + missions.length;
   const allBadges = [...checkins, ...missions];

   useEffect(() => {
      const fetchMissions = async () => {
         const q = query(
            collection(db, "missionSubmissions"),
            where("status", "==", "approved"),
            where("userId", "==", user?.uid),
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

   const handleLogout = async () => {
      try {
         await signOut(auth);
         router.replace("/(auth)/Login");
      } catch (error) {
         console.log("Logout error:", error);
      }
   };

   const loadUserData = async (uid: string) => {
      const userDoc = await getDoc(doc(db, "users", uid));

      if (userDoc.exists()) {
         setUserData(userDoc.data());
      } else {
         await setDoc(doc(db, "users", uid), {
            email: auth.currentUser?.email,
            photoURL: "",
         });

         setUserData({ photoURL: "" });
      }
   };

   const pickImage = async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
         mediaTypes: ImagePicker.MediaTypeOptions.Images,
         allowsEditing: true,
         aspect: [1, 1],
         quality: 0.8,
      });

      if (!result.canceled) {
         uploadImage(result.assets[0].uri);
      }
   };

   const uploadImage = async (uri: string) => {
      try {
         const user = auth.currentUser;
         if (!user) return;

         const response = await fetch(uri);
         const blob = await response.blob();

         const storage = getStorage();
         const storageRef = ref(storage, `profileImages/${user.uid}.jpg`);

         await uploadBytes(storageRef, blob);

         const downloadURL = await getDownloadURL(storageRef);

         await setDoc(
            doc(db, "users", user.uid),
            { photoURL: downloadURL },
            { merge: true },
         );

         setUserData((prev: any) => ({
            ...prev,
            photoURL: downloadURL,
         }));
      } catch (error) {
         console.log("Upload error:", error);
      }
   };

   return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
         <View style={styles.header}>
            <Text style={styles.topic}>Passport</Text>

            <TouchableOpacity onPress={handleLogout}>
               <Ionicons name="log-out-outline" size={24} color="#e53935" />
            </TouchableOpacity>
         </View>

         {/* ===== PROFILE CARD ===== */}
         <View style={styles.profileCard}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
               <View style={{ position: "relative" }}>
                  <Image
                     source={{
                        uri:
                           userData?.photoURL ||
                           "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                     }}
                     style={styles.avatar}
                  />

                  {/* ปุ่มแก้ไข */}
                  <TouchableOpacity style={styles.editIcon} onPress={pickImage}>
                     <Ionicons name="pencil" size={16} color="#fff" />
                  </TouchableOpacity>
               </View>

               <View style={{ marginLeft: 15 }}>
                  <Text style={styles.username}>{user?.email}</Text>
                  <Text style={styles.subTag}>{getLevel(checkins.length)}</Text>
               </View>
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
                     { width: `${(approvedCheckins.length / 15) * 100}%` },
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
            scrollEnabled={false}
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
      </ScrollView>
   );
}

const styles = StyleSheet.create({
   container: { flex: 1, padding: 15, backgroundColor: "#fff" },
   title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
   count: {
      fontSize: 16,
      marginBottom: 5,
   },

   header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
   },

   topic: {
      fontSize: 22,
      fontWeight: "bold",
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
      justifyContent: "space-between",
   },

   avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: "#e0f2e9",
      justifyContent: "center",
      alignItems: "center",
   },

   editIcon: {
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: "#16a34a",
      width: 22,
      height: 22,
      borderRadius: 11,
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
