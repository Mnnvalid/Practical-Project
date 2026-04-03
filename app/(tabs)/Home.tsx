import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
   addDoc,
   collection,
   doc,
   onSnapshot,
   query,
   serverTimestamp,
   updateDoc,
   where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useState } from "react";
import {
   Dimensions,
   Image,
   ScrollView,
   StyleSheet,
   Text,
   TextInput,
   TouchableOpacity,
   View,
} from "react-native";
import { db, storage } from "../../firebase";

const auth = getAuth();
const screenWidth = Dimensions.get("window").width;

export default function Home() {
   // ===============================
   // 1️⃣ STATE (ตัวแปรเก็บข้อมูล)
   // ===============================
   const [selectedRegion, setSelectedRegion] = useState("ทั้งหมด");
   const [myCheckins, setMyCheckins] = useState<Record<string, any>>({});
   const [showCampaignDetail, setShowCampaignDetail] = useState(false);
   const [selectedMission, setSelectedMission] = useState<any>(null);
   const [approvedMissions, setApprovedMissions] = useState<string[]>([]);
   const [nearbyParkId, setNearbyParkId] = useState<string | null>(null);
   const [searchText, setSearchText] = useState("");
   const [expandedParkId, setExpandedParkId] = useState<string | null>(null);

   // ===============================
   // 2️⃣ DATA (ข้อมูล)
   // ===============================
   type Park = {
      id: string;
      name: string;
      province: string;
      region: string;
      lat: number;
      lng: number;
      quote: string;
      bestTime: string;
      highlight: string;
      checkinRequirement: string;
      images: any[];
   };

   const parks: Park[] = [
      {
         id: "khaoyai",
         name: "อุทยานแห่งชาติเขาใหญ่",
         province: "นครราชสีมา",
         region: "ตะวันออกเฉียงเหนือ",
         lat: 14.311,
         lng: 101.53,
         quote: "Still First, Still Standing, Still Thriving.",
         bestTime: "สิงหาคม - กุมภาพันธ์",
         highlight:
            "น้ำตกเหวนรก, น้ำตกเหวสุวัต, น้ำตกผากล้วยไม้, จุดชมวิวผาเดียวดาย",
         checkinRequirement: "รูปชูนิ้วโป้งที่จุดชมวิวผาเดียวดาย",
         images: [
            require("../../assets/images/khaoyai1.jpg"),
            require("../../assets/images/khaoyai2.jpg"),
            require("../../assets/images/khaoyai3.jpg"),
         ],
      },
      {
         id: "doi_inthanon",
         name: "อุทยานแห่งชาติดอยอินทนนท์",
         province: "เชียงใหม่",
         region: "เหนือ",
         lat: 18.588,
         lng: 98.487,
         quote: "The Roof of Thailand.",
         bestTime: "พฤศจิกายน - กุมภาพันธ์",
         highlight:
            "กิ่วแม่ปาน, พระมหาธาตุนภเมทนีดล, น้ำตกวชิรธาร, จุดสูงสุดแดนสยาม",
         checkinRequirement: "รูปพระมหาธาตุฯ พร้อมวิวภูเขา",
         images: [
            require("../../assets/images/inthanon1.jpg"),
            require("../../assets/images/inthanon2.jpg"),
            require("../../assets/images/inthanon3.jpg"),
         ],
   },
   ];

   const filteredParks = parks.filter((park) => {
      const matchRegion =
         selectedRegion === "ทั้งหมด" || park.region === selectedRegion;

      const keyword = searchText.trim().toLowerCase();

      const matchSearch =
         keyword === "" ||
         park.name.toLowerCase().includes(keyword) ||
         park.province.toLowerCase().includes(keyword);

      return matchRegion && matchSearch;
   });

   const campaign = {
      id: "camp_khaoyai_01",
      parkId: "khaoyai",
      location: "อุทยานแห่งชาติเขาใหญ่",
      missions: [
         { id: "m1", title: "รูปจุดชมวิวผาเดียวดาย" },
         { id: "m2", title: "รูปน้ำตกเหวสุวัต" },
      ],
   };

   const allMissionApproved =
      approvedMissions.length === campaign.missions.length;

   // ===============================
   // 3️⃣ EFFECTS (ดึงข้อมูล)
   // ===============================
   useEffect(() => {
      const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
         if (!user) return;

         const q = query(
            collection(db, "checkins"),
            where("userId", "==", user.uid),
            where("status", "==", "approved"),
         );

         const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
            const checkinMap: Record<string, any> = {};

            snapshot.docs.forEach((doc) => {
               const data = doc.data();
               checkinMap[data.parkId] = data;
            });

            setMyCheckins(checkinMap);
         });

         return unsubscribeSnapshot;
      });

      return unsubscribeAuth;
   }, []);

   useEffect(() => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
         collection(db, "missionSubmissions"),
         where("userId", "==", user.uid),
         where("campaignId", "==", "camp_khaoyai_01"),
         where("status", "==", "approved"),
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
         const missions = snapshot.docs.map((doc) => doc.data().missionId);
         setApprovedMissions(missions);
      });

      return unsubscribe;
   }, []);

   useEffect(() => {
      checkLocation();
   }, []);

   // ===============================
   // 4️⃣ FUNCTIONS (การทำงาน)
   // ===============================
   const handleUpload = async (parkId: string) => {
      const user = auth.currentUser;
      if (!user) {
         alert("กรุณา login ก่อนอัปโหลด");
         return;
      }

      try {
         const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
         if (!permission.granted) {
            alert("ต้องอนุญาตเข้าถึงรูปภาพก่อน");
            return;
         }

         const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 1,
         });

         if (result.canceled) return;

         const imageUri = result.assets[0].uri;
         const response = await fetch(imageUri);
         const blob = await response.blob();
         const storageRef = ref(storage, `checkins/${Date.now()}.jpg`);

         await uploadBytes(storageRef, blob);
         const downloadURL = await getDownloadURL(storageRef);

         await addDoc(collection(db, "checkins"), {
            imageUrl: downloadURL,
            status: "pending",
            parkId: parkId,
            createdAt: serverTimestamp(),
            userId: user.uid,
            userEmail: user.email,
         });

         alert("Upload success 🎉");
      } catch (error) {
         console.log("UPLOAD ERROR:", error);
         alert(JSON.stringify(error));
      }
   };

   const approveCheckin = async (docId: string) => {
      try {
         const ref = doc(db, "checkins", docId);
         await updateDoc(ref, {
            status: "approved",
         });
         console.log("Approved!");
      } catch (error) {
         console.log("Error approving:", error);
      }
   };

   const handleAutoCheckin = async (parkId: string) => {
      const user = auth.currentUser;
      if (!user) {
         alert("กรุณา login ก่อน");
         return;
      }

      try {
         await addDoc(collection(db, "checkins"), {
            parkId: parkId,
            userId: user.uid,
            userEmail: user.email,
            status: "approved",
            type: "location",
            createdAt: serverTimestamp(),
         });

         alert("📍 Check-in สำเร็จ!");
      } catch (error) {
         console.log("AUTO CHECKIN ERROR:", error);
      }
   };

   const handleCampaignUpload = async () => {
      if (!selectedMission) {
         alert("กรุณาเลือก mission");
         return;
      }
      uploadMission(selectedMission);
   };

   const markMissionComplete = async (missionId: string) => {
      const mission = campaign.missions.find((m) => m.id === missionId);
      if (!mission) {
         alert("ไม่พบ mission");
         return;
      }
      uploadMission(mission);
   };

   const uploadMission = async (mission: any) => {
      const user = auth.currentUser;
      if (!user) {
         alert("กรุณา login ก่อน");
         return;
      }
      try {
         const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
         if (!permission.granted) {
            alert("ต้องอนุญาตเข้าถึงรูปภาพก่อน");
            return;
         }

         const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 1,
         });

         if (result.canceled) return;

         const imageUri = result.assets[0].uri;
         const response = await fetch(imageUri);
         const blob = await response.blob();
         const storageRef = ref(storage, `missions/${Date.now()}.jpg`);

         await uploadBytes(storageRef, blob);
         const downloadURL = await getDownloadURL(storageRef);

         await addDoc(collection(db, "missionSubmissions"), {
            imageUrl: downloadURL,
            status: "pending",
            parkId: "khaoyai",
            campaignId: "camp_khaoyai_01",
            missionId: mission.id,
            missionTitle: mission.title,
            userId: user.uid,
            userEmail: user.email,
            createdAt: serverTimestamp(),
            approvedAt: null,
         });

         alert("ส่งภารกิจสำเร็จ 🎉");
         setSelectedMission(null);
      } catch (error) {
         console.log("MISSION UPLOAD ERROR:", error);
      }
   };

   const checkLocation = async () => {
   const { status } = await Location.requestForegroundPermissionsAsync();

   if (status !== "granted") {
      alert("ต้องอนุญาต location ก่อน");
      return;
   }

      // ตำแหน่งจำลอง: ใกล้เขาใหญ่
      const myLat = 14.311;
      const myLng = 101.53;

      console.log("Mock location for demo:", myLat, myLng);

      // const location = await Location.getCurrentPositionAsync({});
      // const myLat = location.coords.latitude;
      // const myLng = location.coords.longitude;

      // console.log("My real location:", myLat, myLng);

      let matchedParkId: string | null = null;

      for (const park of parks) {
         const distance = getDistance(myLat, myLng, park.lat, park.lng);
         console.log(`Distance to ${park.name}:`, distance, "km");

         if (distance < 0.5) {
            matchedParkId = park.id;
            break;
         }
      }

      setNearbyParkId(matchedParkId);
   };

   const getDistance = (
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number,
   ) => {
      const R = 6371; // radius of earth (km)
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
         Math.sin(dLat / 2) * Math.sin(dLat / 2) +
         Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // distance in km
   };

   // ===============================
   // 5️⃣ UI (การแสดงผล)
   // ===============================
   return (
      <ScrollView showsVerticalScrollIndicator={false}>
         <View style={styles.container}>
            <Text style={styles.header}>Explore National Parks</Text>
            {/* 🔍 SEARCH BAR */}
            <TextInput
               placeholder="ค้นหาอุทยาน or จังหวัด..."
               placeholderTextColor={"#b5c8be"}
               style={styles.search}
               value={searchText}
               onChangeText={setSearchText}
            />

            {/* 🟢 REGION BUTTONS */}
            <View>
               <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.regionContainer}
               >
                  {[
                     "ทั้งหมด",
                     "เหนือ",
                     "ตะวันออกเฉียงเหนือ",
                     "กลาง",
                     "ใต้",
                  ].map((region) => (
                     <TouchableOpacity
                        key={region}
                        style={[
                           styles.regionButton,
                           selectedRegion === region && styles.activeRegion,
                        ]}
                        onPress={() => setSelectedRegion(region)}
                     >
                        <Text
                           style={
                              selectedRegion === region
                                 ? styles.activeText
                                 : styles.regionText
                           }
                        >
                           {region}
                        </Text>
                     </TouchableOpacity>
                  ))}
               </ScrollView>
            </View>

            {/* 🟢 CAMPAIGN BANNER */}
            {!allMissionApproved ? (
               <View style={styles.banner}>
                  <Text style={styles.hotLabel}>HOT CAMPAIGN</Text>
                  <Text style={styles.bannerTitle}>
                     ทำภารกิจ แลกของที่ระลึก
                  </Text>
                  <Text style={styles.bannerSub}>
                     ทำภารกิจสำเร็จ รับฟรีของที่ระลึก Limited Edition!
                  </Text>

                  <TouchableOpacity
                     style={styles.detailButton}
                     onPress={() => {
                        if (showCampaignDetail) {
                           setSelectedMission(null);
                        }
                        setShowCampaignDetail(!showCampaignDetail);
                     }}
                  >
                     <Text style={{ color: "#1e7f3f", fontWeight: "bold" }}>
                        ดูรายละเอียด
                     </Text>
                  </TouchableOpacity>

                  {showCampaignDetail && (
                     <View style={styles.campaignDetailBox}>
                        <Text style={styles.campaignTitle}>📍 Location</Text>
                        <Text style={styles.campaignText}>
                           {campaign.location}
                        </Text>

                        <Text style={[styles.campaignTitle, { marginTop: 10 }]}>
                           🎯 Missions
                        </Text>
                        {campaign.missions.map((mission) => {
                           const isApproved = approvedMissions.includes(
                              mission.id,
                           );
                           return (
                              <TouchableOpacity
                                 key={mission.id}
                                 onPress={() =>
                                    !isApproved && setSelectedMission(mission)
                                 }
                                 style={{
                                    marginTop: 8,
                                    padding: 8,
                                    backgroundColor: isApproved
                                       ? "#c8f7dc"
                                       : "#eee",
                                    borderRadius: 8,
                                 }}
                              >
                                 <Text>
                                    {isApproved ? "✅ " : ""}🎯 {mission.title}
                                 </Text>
                              </TouchableOpacity>
                           );
                        })}
                     </View>
                  )}

                  {selectedMission &&
                     !approvedMissions.includes(selectedMission.id) && (
                        <TouchableOpacity
                           style={{
                              backgroundColor: "#1e7f3f",
                              padding: 12,
                              borderRadius: 10,
                              marginTop: 15,
                              alignItems: "center",
                           }}
                           onPress={handleCampaignUpload}
                        >
                           <Text style={{ color: "white", fontWeight: "bold" }}>
                              📷 แนบรูปภารกิจนี้
                           </Text>
                        </TouchableOpacity>
                     )}
               </View>
            ) : (
               <View style={styles.emptyCampaign}>
                  <Text style={{ marginTop: 3, color: "#aaa" }}>
                     ยังไม่มี Campaign ใหม่ในตอนนี้
                  </Text>
               </View>
            )}

            {/* LIST TITLE */}
            <Text style={styles.sectionTitle}>รายชื่ออุทยานแห่งชาติ</Text>

            {/* PARK CARDS */}
            {filteredParks.map((park) => (
               <View key={park.id} style={styles.card}>
                  <ScrollView
                     horizontal
                     pagingEnabled
                     showsHorizontalScrollIndicator={false}
                  >
                     {park.images.map((img, index) => (
                        <Image key={index} source={img} style={styles.image} />
                     ))}
                  </ScrollView>

                  {/* ยังไม่ไป = เบลอ */}
                  {myCheckins[park.id]?.status !== "approved" && (
                     <BlurView intensity={40} style={styles.blurOverlay}>
                        <Text style={styles.blurText}>
                           🏆 Challenge: อัปโหลดรูปเพื่อปลดล็อค
                        </Text>
                     </BlurView>
                  )}

                  <View style={styles.cardContent}>
                     <Text style={styles.parkName}>{park.name}</Text>
                     <Text style={styles.province}>
                        {park.province}{" "}
                        <Text style={styles.region}>• {park.region}</Text>
                     </Text>
                     <Text style={{ marginTop: 15, marginBottom: 5, fontStyle: "italic", textAlign: "center" }}>
                        "{park.quote}"
                     </Text>

                     {/* ปุ่มรายละเอียดเพิ่มเติม */}
                     <TouchableOpacity
                        onPress={() =>
                           setExpandedParkId(expandedParkId === park.id ? null : park.id)
                        }
                     >
                        <Text style={styles.moreDetail}>
                           {expandedParkId === park.id
                              ? "ซ่อนรายละเอียด ▲"
                              : "รายละเอียดเพิ่มเติม ▼"}
                        </Text>
                     </TouchableOpacity>

                     {/* กล่องรายละเอียด */}
                     {expandedParkId === park.id && (
                        <View style={styles.detailBox}>
                           <Text>
                              ช่วงน่าเที่ยว: {park.bestTime}
                           </Text>
                           <Text style={{ marginTop: 5 }}>
                              ไฮไลต์: {park.highlight}
                           </Text>
                           <Text style={{ marginTop: 5 }}>
                              เงื่อนไข Check-in 📸 : {park.checkinRequirement}
                           </Text>
                        </View>
                     )}

                     {/* ปุ่ม Check-in */}
                     {nearbyParkId === park.id && !myCheckins[park.id] && (
                        <TouchableOpacity
                           style={{
                              backgroundColor: "#1e7f3f",
                              padding: 10,
                              borderRadius: 10,
                              marginTop: 10,
                              alignItems: "center",
                           }}
                           onPress={() => handleAutoCheckin(park.id)}
                        >
                           <Text style={{ color: "white", fontWeight: "bold" }}>
                              📍 Auto Check-in
                           </Text>
                        </TouchableOpacity>
                     )}

                     {myCheckins[park.id]?.status !== "approved" && (
                        <TouchableOpacity
                           style={styles.uploadButton}
                           onPress={() => handleUpload(park.id)}
                        >
                           <Text style={{ color: "#1e7f3f" }}>
                              📷 อัปโหลดรูป Check-in
                           </Text>
                        </TouchableOpacity>
                     )}
                  </View>
               </View>
            ))}
         </View>
      </ScrollView>
   );
}

// ===============================
// 6️⃣ STYLES (สไตล์)
// ===============================
const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: "#ffffff",
   },
   header: {
      fontSize: 22,
      fontWeight: "bold",
      paddingHorizontal: 15,
      paddingTop: 15, // ปรับให้พ้น Notch
      paddingBottom: 3,
   },
   search: {
      backgroundColor: "#fff",
      margin: 15,
      padding: 12,
      borderRadius: 25,
      borderWidth: 1,
      borderColor: "#2c9c4b",
   },
   regionContainer: {
      paddingHorizontal: 15,
      paddingBottom: 5,
   },
   regionButton: {
      backgroundColor: "#e0e0e0",
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 10,
   },
   activeRegion: {
      backgroundColor: "#2c9c4b",
   },
   regionText: {
      color: "#333",
   },
   activeText: {
      color: "#fff",
   },
   banner: {
      backgroundColor: "#1e7f3f",
      margin: 15,
      padding: 20,
      borderRadius: 15,
   },
   hotLabel: {
      backgroundColor: "#ffc107",
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
      fontSize: 12,
      fontWeight: "bold",
   },
   bannerTitle: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "bold",
      marginTop: 10,
   },
   bannerSub: {
      color: "#fff",
      marginTop: 5,
   },
   detailButton: {
      backgroundColor: "#fff",
      marginTop: 10,
      padding: 10,
      borderRadius: 20,
      alignSelf: "flex-start",
   },
   sectionTitle: {
      marginLeft: 15,
      marginTop: 10,
      fontWeight: "bold",
      fontSize: 16,
   },
   card: {
      backgroundColor: "#f5f6f4",
      margin: 15,
      borderRadius: 15,
      overflow: "hidden",
      elevation: 3, // เพิ่มเงาสำหรับ Android
      shadowColor: "#000", // เพิ่มเงาสำหรับ iOS
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
   },
   image: {
      width: screenWidth - 30,
      height: 180,
   },
   blurOverlay: {
      position: "absolute",
      width: "100%",
      height: 180,
      justifyContent: "center",
      alignItems: "center",
   },
   blurText: {
      color: "#fff",
      fontWeight: "bold",
      textAlign: "center",
      paddingHorizontal: 20,
   },
   cardContent: {
      padding: 15,
   },
   parkName: {
      fontSize: 18,
      fontWeight: "bold",
   },
   province: {
      color: "gray",
      marginTop: 3,
   },
   region: {
      color: "#6c8874",
      fontWeight: "bold",
   },
   detailBox: {
      backgroundColor: "#e7f5ec",
      padding: 10,
      borderRadius: 10,
      marginTop: 10,
   },
   uploadButton: {
      borderWidth: 1,
      borderColor: "#2c9c4b",
      borderStyle: "dashed",
      padding: 10,
      borderRadius: 10,
      marginTop: 15,
      alignItems: "center",
   },
   moreDetail: {
      color: "#2c9c4b",
      marginTop: 10,
      fontWeight: "bold",
   },
   campaignDetailBox: {
      backgroundColor: "#e7f5ec",
      marginTop: 15,
      padding: 15,
      borderRadius: 10,
   },
   campaignTitle: {
      fontWeight: "bold",
      color: "#1e7f3f",
   },
   campaignText: {
      marginTop: 5,
   },
   emptyCampaign: {
      margin: 15,
      padding: 45,
      borderRadius: 15,
      borderWidth: 2,
      borderStyle: "dashed",
      borderColor: "#d1e7d6",
      alignItems: "center",
      backgroundColor: "#f3fdf2",
   },
});
