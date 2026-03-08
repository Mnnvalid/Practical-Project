import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
   createUserWithEmailAndPassword,
   getAuth,
   signInWithEmailAndPassword,
} from "firebase/auth";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
   const router = useRouter();
   const auth = getAuth();

   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [error, setError] = useState("");
   const [isLogin, setIsLogin] = useState(true);
   const [showPassword, setShowPassword] = useState(false);

   const handleSubmit = async () => {
      setError("");

      if (!email || !password) {
         setError("กรุณากรอกข้อมูลให้ครบถ้วน");
         return;
      }

      try {
         if (isLogin) {
            // 🔥 LOGIN
            await signInWithEmailAndPassword(auth, email, password);
         } else {
            // 🔥 REGISTER
            await createUserWithEmailAndPassword(auth, email, password);
         }

         router.replace("/"); // ไปหน้า Home
      } catch (err: any) {
         setError(err.message);
      }
   };

   return (
      <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
         <Text
            style={{
               fontSize: 28,
               fontWeight: "bold",
               textAlign: "center",
               marginBottom: 24,
            }}
         >
            StampOnIt
         </Text>
         <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            style={{
               borderWidth: 1,
               borderColor: "#e5e7eb",
               borderRadius: 12,
               padding: 14,
               marginBottom: 12,
            }}
         />

         <View style={{ position: "relative", marginBottom: 12 }}>
            <TextInput
               placeholder="Password"
               value={password}
               onChangeText={setPassword}
               secureTextEntry={!showPassword}
               style={{
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                  borderRadius: 12,
                  padding: 14,
                  paddingRight: 45, // เว้นที่ให้ไอคอน
               }}
            />

            <TouchableOpacity
               onPress={() => setShowPassword(!showPassword)}
               style={{
                  position: "absolute",
                  right: 15,
                  top: 15,
               }}
            >
               <Ionicons
                  name={showPassword ? "eye" : "eye-off"}
                  size={22}
                  color="gray"
               />
            </TouchableOpacity>
         </View>

         {error ? (
            <Text
               style={{ color: "red", textAlign: "center", marginBottom: 12 }}
            >
               {error}
            </Text>
         ) : null}
         <TouchableOpacity
            onPress={handleSubmit}
            style={{
               backgroundColor: "#16a34a",
               padding: 16,
               borderRadius: 12,
               marginTop: 8,
            }}
         >
            <Text
               style={{
                  color: "white",
                  textAlign: "center",
                  fontSize: 16,
                  fontWeight: "bold",
               }}
            >
               {isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
            </Text>
         </TouchableOpacity>

         <TouchableOpacity
            onPress={() => {
               setIsLogin(!isLogin);
               setError("");
            }}
         >
            <Text
               style={{
                  textAlign: "center",
                  marginTop: 16,
                  color: "#16a34a",
                  fontWeight: "bold",
               }}
            >
               {isLogin
                  ? "ยังไม่มีบัญชี? สมัครสมาชิก"
                  : "มีบัญชีแล้ว? เข้าสู่ระบบ"}
            </Text>
         </TouchableOpacity>
      </View>
   );
}
