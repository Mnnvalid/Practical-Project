// import React from 'react';
// import { UserProfile, Park } from '../types';

// interface ProfileProps {
//    user: UserProfile;
//    parks: Park[];
// }

// const Profile: React.FC<ProfileProps> = ({ user, parks }) => {
//    const visitedParks = parks.filter(p => p.isVisited);
//    const progressPercentage = (visitedParks.length / parks.length) * 100;

//    return (
//       <div className="min-h-screen bg-amber-50 pb-20">
//          {/* Header / Passport Cover Feel */}
//          <div className="bg-green-800 text-white p-8 pt-12 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
//          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
//          <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-400 opacity-10 rounded-full -ml-5 -mb-5"></div>
         
//          <div className="flex items-center space-x-6 relative z-10">
//             <div className="w-20 h-20 rounded-full border-4 border-yellow-400 overflow-hidden shadow-lg bg-gray-200">
//                <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
//             </div>
//             <div>
//                <h1 className="text-2xl font-bold">{user.name}</h1>
//                <p className="text-green-200 text-sm tracking-wider uppercase">Level: {user.level}</p>
//             </div>
//          </div>

//          {/* Stats Bar */}
//          <div className="mt-8">
//                <div className="flex justify-between text-xs mb-2 font-medium opacity-90">
//                   <span>ความคืบหน้าการพิชิตอุทยาน</span>
//                   <span>{visitedParks.length} / {parks.length} แห่ง</span>
//                </div>
//                <div className="w-full bg-green-900/50 rounded-full h-3 backdrop-blur-sm">
//                   <div 
//                      className="bg-yellow-400 h-3 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(250,204,21,0.5)]" 
//                      style={{ width: `${progressPercentage}%` }}
//                   ></div>
//                </div>
//          </div>
//          </div>

//          {/* Stamp Collection */}
//          <div className="p-6">
//          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
//                <svg className="w-6 h-6 mr-2 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
//                สมุดบันทึกการเดินทาง
//          </h2>

//          {visitedParks.length === 0 ? (
//                <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-300 rounded-xl">
//                   <p>ยังไม่มีบันทึกการเดินทาง</p>
//                   <p className="text-sm mt-1">ออกไปเที่ยวแล้วกลับมาอัปโหลดรูปกันเถอะ!</p>
//                </div>
//          ) : (
//                <div className="space-y-4">
//                   {visitedParks.map(park => (
//                      <div key={park.id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500 flex items-center justify-between">
//                            <div>
//                               <h3 className="font-bold text-gray-800">{park.name}</h3>
//                               <p className="text-xs text-gray-500 mt-1">{park.province}</p>
//                            </div>
//                            <div className="text-right">
//                               <span className="block text-xs text-gray-400">วันที่ไป</span>
//                               <span className="block text-sm font-medium text-green-700">
//                                  {park.visitedDate || new Date().toLocaleDateString('th-TH')}
//                               </span>
//                            </div>
//                      </div>
//                   ))}
//                </div>
//          )}

//          {/* Locked Stamps Hint */}
//          {parks.length - visitedParks.length > 0 && (
//                <div className="mt-8 text-center">
//                   <p className="text-gray-400 text-sm">อีก {parks.length - visitedParks.length} แห่งที่รอคุณไปสัมผัส</p>
//                </div>
//          )}
//          </div>
//       </div>
//    );
//    };

//    export default Profile;
