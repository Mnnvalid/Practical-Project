import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
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

import {
   addDoc,
   collection,
   doc,
   serverTimestamp,
   updateDoc,
} from "firebase/firestore";

import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../../firebase";
import { getAuth } from "firebase/auth";

const auth = getAuth();

const screenWidth = Dimensions.get("window").width;

export default function Home() {
   // ===============================
   // 1️⃣ STATE (ตัวแปรเก็บข้อมูล)
   // ===============================

   const [selectedRegion, setSelectedRegion] = useState("ทั้งหมด");
   const [hasVisited, setHasVisited] = useState(false);
   const [showDetail, setShowDetail] = useState(false);

   const handleUpload = async () => {
      try {
         const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

         if (!permission.granted) {
            alert("ต้องอนุญาตเข้าถึงรูปภาพก่อน");
            return;
         }

         const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
            createdAt: serverTimestamp(),
            userId: auth.currentUser?.uid,
            userEmail: auth.currentUser?.email,
         });

         setHasVisited(true); // ปลดล็อค blur

         alert("อัปโหลดสำเร็จ 🎉");
      } catch (error) {
         console.log(error);
         alert(JSON.stringify(error));
      }
   };

   // false = ยังไม่ไป → ภาพเบลอ
   // true = ไปแล้ว → ภาพชัด

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
   // ===============================
   // 2️⃣ ข้อมูลอุทยาน (Mock data)
   // ===============================

   const park = {
      name: "อุทยานแห่งชาติเขาใหญ่",
      province: "นครราชสีมา - ภาคตะวันออกเฉียงเหนือ",
      quote: "Still First, Still Standing, Still Thriving.",
      bestTime: "สิงหาคม - กุมภาพันธ์",
      highlight:
         "น้ำตกเหวนรก, น้ำตกเหวสุวัต, น้ำตกผากล้วยไม้, จุดชมวิวผาเดียวดาย",
   };

   // ===============================
   // 3️⃣ UI
   // ===============================

   return (
      <View style={styles.container}>
         <ScrollView showsVerticalScrollIndicator={false}>
            {/* 🔍 SEARCH BAR */}
            <TextInput
               placeholder="ค้นหาอุทยาน or จังหวัด..."
               placeholderTextColor={"#b5c8be"}
               style={styles.search}
            />

            {/* 🟢 REGION BUTTONS */}
            <ScrollView
               horizontal
               showsHorizontalScrollIndicator={false}
               contentContainerStyle={styles.regionContainer}
            >
               {["ทั้งหมด", "เหนือ", "ตะวันออกเฉียงเหนือ", "กลาง", "ใต้"].map(
                  (region) => (
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
                  ),
               )}
            </ScrollView>

            {/* 🟢 CAMPAIGN BANNER */}
            <View style={styles.banner}>
               <Text style={styles.hotLabel}>HOT CAMPAIGN</Text>
               <Text style={styles.bannerTitle}>Check-in แลกของที่ระลึก</Text>
               <Text style={styles.bannerSub}>
                  สะสมครบ 5 จุดยอดนิยม รับฟรีสินค้า Limited Edition!
               </Text>
               <TouchableOpacity style={styles.detailButton}>
                  <Text style={{ color: "#1e7f3f", fontWeight: "bold" }}>
                     ดูรายละเอียด
                  </Text>
               </TouchableOpacity>
            </View>

            {/* LIST TITLE */}
            <Text style={styles.sectionTitle}>รายชื่ออุทยานแห่งชาติ</Text>

            {/* PARK CARD */}
            <View style={styles.card}>
               <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
               >
                  <Image
                     source={require("../../assets/images/khaoyai1.jpg")}
                     style={styles.image}
                  />
                  <Image
                     source={require("../../assets/images/khaoyai2.jpg")}
                     style={styles.image}
                  />
                  <Image
                     source={require("../../assets/images/khaoyai3.jpg")}
                     style={styles.image}
                  />
               </ScrollView>

               {/* ยังไม่ไป = เบลอ */}
               {!hasVisited && (
                  <BlurView intensity={40} style={styles.blurOverlay}>
                     <Text style={styles.blurText}>
                        🏆 Challenge: อัปโหลดรูปเพื่อปลดล็อค
                     </Text>
                  </BlurView>
               )}

               <View style={styles.cardContent}>
                  <Text style={styles.parkName}>{park.name}</Text>
                  <Text style={styles.province}>{park.province}</Text>
                  <Text style={styles.quote}>"{park.quote}"</Text>

                  {/* ปุ่มรายละเอียดเพิ่มเติม */}
                  <TouchableOpacity onPress={() => setShowDetail(!showDetail)}>
                     <Text style={styles.moreDetail}>
                        {showDetail
                           ? "ซ่อนรายละเอียด ▲"
                           : "รายละเอียดเพิ่มเติม ▼"}
                     </Text>
                  </TouchableOpacity>

                  {/* กล่องรายละเอียด (จะแสดงเมื่อกดเปิด) */}
                  {showDetail && (
                     <View style={styles.detailBox}>
                        <Text>ช่วงน่าเที่ยว: {park.bestTime}</Text>
                        <Text style={{ marginTop: 5 }}>
                           ไฮไลต์: {park.highlight}
                        </Text>
                     </View>
                  )}

                  {/* ปุ่ม DEMO */}
                  <TouchableOpacity
                     style={styles.uploadButton}
                     onPress={handleUpload}
                  >
                     <Text style={{ color: "#1e7f3f" }}>📷 อัปโหลดรูป</Text>
                  </TouchableOpacity>
               </View>
            </View>
         </ScrollView>

         {/* 📍 BOTTOM TAB MOCK */}
         <View style={styles.bottomTab}>
            <Text>หน้าหลัก</Text>
            <Text>แผนที่</Text>
            <Text>พาสปอร์ต</Text>
         </View>
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: "#f2f2f2",
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
      backgroundColor: "#fff",
      margin: 15,
      borderRadius: 15,
      overflow: "hidden",
   },

   image: {
      width: screenWidth - 30,
      height: 180,
      borderRadius: 15,
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

   quote: {
      marginTop: 5,
      fontStyle: "italic",
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

   bottomTab: {
      flexDirection: "row",
      justifyContent: "space-around",
      padding: 15,
      backgroundColor: "#fff",
      borderTopWidth: 1,
      borderColor: "#ddd",
   },

   moreDetail: {
      color: "#2c9c4b",
      marginTop: 10,
      fontWeight: "bold",
   },
});
