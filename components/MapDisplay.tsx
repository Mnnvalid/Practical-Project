// import React from 'react';
// import { Park } from '../types';

// interface MapDisplayProps {
//   parks: Park[];
// }

// const MapDisplay: React.FC<MapDisplayProps> = ({ parks }) => {
//   return (
//     <div className="flex flex-col h-full bg-blue-50 relative overflow-hidden">
//       <div className="absolute top-0 left-0 w-full p-6 z-10 bg-white/80 backdrop-blur-md shadow-sm">
//         <h2 className="text-2xl font-bold text-gray-800">แผนที่อุทยาน</h2>
//         <div className="flex items-center space-x-4 mt-2 text-sm">
//             <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>ไปแล้ว</div>
//             <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-400 mr-2"></span>ยังไม่ไป</div>
//         </div>
//       </div>

//       <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
//         {/* Simplified Thailand Map Shape Representation */}
//         <div className="relative w-full max-w-md aspect-[3/5] bg-white rounded-3xl shadow-xl border-4 border-white overflow-hidden">
//             {/* Background Texture (Abstract Map) */}
//             <div className="absolute inset-0 bg-gray-100">
//                 {/* Simulated Thailand Shape (Very Abstract for Demo using simple SVG path) */}
//                 <svg viewBox="0 0 100 160" className="w-full h-full text-gray-300 fill-current opacity-50">
//                     <path d="M 20 10 L 60 10 L 70 30 L 90 40 L 95 60 L 80 70 L 60 70 L 50 90 L 30 130 L 20 150 L 10 130 L 15 90 L 10 50 L 20 30 Z" />
//                 </svg>
//             </div>

//             {/* Pins */}
//             {parks.map(park => (
//                 <div 
//                     key={park.id}
//                     className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
//                     style={{ left: `${park.coordinates.x}%`, top: `${park.coordinates.y}%` }}
//                 >
//                     <div className={`relative z-10 w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center ${park.isVisited ? 'bg-green-500' : 'bg-red-400 animate-pulse'}`}>
//                         {park.isVisited && (
//                             <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
//                         )}
//                     </div>
//                     {/* Tooltip on Hover/Tap */}
//                     <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-20">
//                         {park.name}
//                     </div>
//                 </div>
//             ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MapDisplay;