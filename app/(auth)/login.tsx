// import { View, Text, TextInput, TouchableOpacity } from "react-native";
// import { useState } from "react";
// import { useRouter } from "expo-router";

// export default function LoginScreen() {
//     const router = useRouter();

//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [error, setError] = useState("");
//     const [isLogin, setIsLogin] = useState(true);
//     const [username, setUsername] = useState("");


//     const handleSubmit = () => {
//     setError("");

//     if (isLogin) {
//         if (!email || !password) {
//         setError("กรุณากรอกข้อมูลให้ครบถ้วน");
//         return;
//         }
//     } else {
//         if (!email || !password || !username) {
//         setError("กรุณากรอกข้อมูลให้ครบถ้วน");
//         return;
//         }
//     }

//     // mock auth ผ่าน
//     router.replace("/");
//     };


//     return (
//         <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
//         <Text
//             style={{
//             fontSize: 28,
//             fontWeight: "bold",
//             textAlign: "center",
//             marginBottom: 8,
//             }}
//         >
//             StampOnIt
//         </Text>

//         <Text
//             style={{
//             textAlign: "center",
//             color: "#e4f8e9",
//             marginBottom: 24,
//             }}
//         >
//             Log-in
//         </Text>

//         <TextInput
//             placeholder="Email"
//             value={email}
//             onChangeText={setEmail}
//             autoCapitalize="none"
//             style={{
//             borderWidth: 1,
//             borderColor: "#e5e7eb",
//             borderRadius: 12,
//             padding: 14,
//             marginBottom: 12,
//             }}
//         />

//         <TextInput
//             placeholder="Password"
//             value={password}
//             onChangeText={setPassword}
//             secureTextEntry
//             style={{
//             borderWidth: 1,
//             borderColor: "#e5e7eb",
//             borderRadius: 12,
//             padding: 14,
//             marginBottom: 12,
//             }}
//         />

//         {!isLogin && (
//             <TextInput
//                 placeholder="Username"
//                 value={username}
//                 onChangeText={setUsername}
//                 style={{
//                 borderWidth: 1,
//                 borderColor: "#e5e7eb",
//                 borderRadius: 12,
//                 padding: 14,
//                 marginBottom: 12,
//                 }}
//             />
// )}



//         {error ? (
//             <Text style={{ color: "red", textAlign: "center", marginBottom: 12 }}>
//             {error}
//             </Text>
//         ) : null}

//     <TouchableOpacity
//         onPress={handleSubmit}
//         style={{
//             backgroundColor: "#16a34a",
//             padding: 16,
//             borderRadius: 12,
//             marginTop: 8,
//         }}
//         >
//         <Text
//             style={{
//             color: "white",
//             textAlign: "center",
//             fontSize: 16,
//             fontWeight: "bold",
//             }}
//         >
//             {isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
//         </Text>
//         </TouchableOpacity>


//         <TouchableOpacity
//     onPress={() => {
//         setIsLogin(!isLogin);
//         setError("");
//     }}
//     >
//     <Text
//         style={{
//         textAlign: "center",
//         marginTop: 16,
//         color: "#16a34a",
//         fontWeight: "bold",
//         }}
//     >
//         {isLogin ? "ยังไม่มีบัญชี? สมัครสมาชิก" : "มีบัญชีแล้ว? เข้าสู่ระบบ"}
//     </Text>
//     </TouchableOpacity>

//     </View>
//     );
// }
