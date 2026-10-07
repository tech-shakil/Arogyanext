import { useState } from 'react';
import { db } from './firebase';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';

export default function HospitalAdmin({ hospitalId }) {
  const [isExporting, setIsExporting] = useState(false);
  const [hospitalName] = useState("ArogyaNext City Hospital");

  const stats = [
    { title: "Patients Today", value: "142", trend: "+12%", icon: "👨‍⚕️" },
    { title: "Pharmacy Revenue", value: "₹45,200", trend: "+5%", icon: "💊" },
    { title: "Avg Wait Time", value: "14 mins", trend: "-2 mins", icon: "⏱️" },
    { title: "Active Doctors", value: "8", trend: "Online", icon: "🩺" }
  ];

  // --- CSV EXPORT LOGIC ---
  const handleExportData = async (timeframeDays, timeframeLabel) => {
    if (!hospitalId) {
      alert("Error: Hospital ID is missing.");
      return;
    }

    setIsExporting(true);
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timeframeDays);

      const q = query(
        collection(db, 'appointments'), 
        where("hospitalId", "==", hospitalId),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      let exportData = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        let recordDate = new Date();
        if (data.timestamp?.toDate) {
            recordDate = data.timestamp.toDate();
        } else if (data.timestamp) {
            recordDate = new Date(data.timestamp);
        } else if (data.createdAt?.toDate) {
            recordDate = data.createdAt.toDate();
        }

        if (recordDate >= cutoffDate) {
          exportData.push({
            "Appointment ID": doc.id,
            "Date": recordDate.toLocaleDateString('en-IN'),
            "Time": recordDate.toLocaleTimeString('en-IN'),
            "Patient Name": data.patientName || "N/A",
            "Token": data.tokenNumber || "N/A",
            "Department": data.department || "General",
            "Doctor": data.doctorName || "N/A",
            "Status": data.status || "Unknown",
            "Medicines Prescribed": data.prescription ? "Yes" : "No",
            "Pharmacy Status": data.pharmacyStatus || "N/A"
          });
        }
      });

      if (exportData.length === 0) {
        alert(`No data found for the last ${timeframeLabel}.`);
        setIsExporting(false);
        return;
      }

      const headers = Object.keys(exportData[0]).join(",") + "\n";
      const rows = exportData.map(obj => 
        Object.values(obj).map(value => `"${value}"`).join(",")
      ).join("\n");
      const csvContent = headers + rows;

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${hospitalId}_Report_${timeframeLabel.replace(/ /g, '_')}_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert(`✅ Successfully exported ${exportData.length} records!`);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data. Check console for details.");
    }
    setIsExporting(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 p-3 sm:p-6 md:p-8 font-sans text-slate-300">
      
      <div className="mb-6 sm:mb-8 border-b border-slate-800 pb-4 sm:pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
        <div>
          <p className="text-blue-500 font-bold uppercase tracking-widest text-xs sm:text-sm mb-0.5 sm:mb-1">Director's Hub</p>
          <h1 className="text-2xl sm:text-4xl font-black text-white">{hospitalName}</h1>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-slate-500 text-xs sm:text-sm mb-1">Status: <span className="text-emerald-500 font-bold">● Secure</span></p>
          <span className="bg-slate-800 text-slate-400 px-2.5 py-1 rounded text-[10px] sm:text-xs font-bold uppercase tracking-widest border border-slate-700">
             Workspace: {hospitalId}
          </span>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-slate-950 border border-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg">
            <div className="flex justify-between items-start mb-2 sm:mb-4">
              <span className="text-2xl sm:text-3xl">{stat.icon}</span>
              <span className={`text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg ${stat.trend.includes('+') ? 'bg-emerald-500/10 text-emerald-400' : stat.trend === 'Online' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'}`}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-0.5 sm:mb-1">{stat.title}</h3>
            <p className="text-xl sm:text-3xl font-black text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* --- CLINICAL EFFICIENCY & DEPARTMENT BREAKDOWN --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
        
        {/* Department Footfall Progress Bars */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 p-5 sm:p-7 rounded-2xl sm:rounded-3xl shadow-lg">
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">OPD Footfall by Department</h3>
              <p className="text-xs text-slate-400">Real-time consultation load distribution across specialty clinics</p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
              Live Triage Data
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-200">🩺 General Medicine & Chest</span>
                <span className="text-blue-400">42% (60 Patients)</span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full" style={{ width: '42%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-200">👶 Pediatrics & Child Care</span>
                <span className="text-purple-400">24% (34 Patients)</span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full" style={{ width: '24%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-200">🦴 Orthopedics & Joint Care</span>
                <span className="text-emerald-400">18% (26 Patients)</span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full" style={{ width: '18%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-200">👂 ENT & Ophthalmology</span>
                <span className="text-amber-400">16% (22 Patients)</span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full" style={{ width: '16%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quality & SLA Benchmarks */}
        <div className="bg-slate-950 border border-slate-800 p-5 sm:p-7 rounded-2xl sm:rounded-3xl shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white mb-1">Hospital Quality Score</h3>
            <p className="text-xs text-slate-400 mb-5">Measured by patient reviews and queue adherence</p>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">⭐</span>
                  <div>
                    <p className="text-xs font-bold text-white">Patient Rating</p>
                    <p className="text-[10px] text-slate-400">Post-visit SMS feedback</p>
                  </div>
                </div>
                <span className="text-sm font-black text-amber-400">4.9 / 5.0</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">⚡</span>
                  <div>
                    <p className="text-xs font-bold text-white">Zero Wait SLA</p>
                    <p className="text-[10px] text-slate-400">Seen within 15 mins</p>
                  </div>
                </div>
                <span className="text-sm font-black text-emerald-400">92.4%</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🇮🇳</span>
                  <div>
                    <p className="text-xs font-bold text-white">ABDM Digital Compliance</p>
                    <p className="text-[10px] text-slate-400">National Health ID Sync</p>
                  </div>
                </div>
                <span className="text-sm font-black text-blue-400">100% Ready</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-4 text-center font-medium">
            Automated compliance audits updated continuously.
          </p>
        </div>

      </div>

      {/* Export Section */}
      <div className="bg-slate-950 border border-slate-800 p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-lg">
        <h2 className="text-xl sm:text-2xl font-black text-white mb-2 flex items-center">
          <span className="mr-2.5 sm:mr-3">📊</span> Data Export & Reports
        </h2>
        <p className="text-slate-400 mb-6 sm:mb-8 text-xs sm:text-sm max-w-2xl leading-relaxed">
          Download CSV reports of all hospital operations, patient footfall, and pharmacy statuses. Open directly in Microsoft Excel or Google Sheets.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <button 
            onClick={() => handleExportData(1, 'End of Day')}
            disabled={isExporting}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold py-3.5 sm:py-4 px-3 sm:px-4 rounded-xl text-xs sm:text-sm transition-colors flex flex-col items-center justify-center gap-1.5 sm:gap-2 group disabled:opacity-50 active:scale-95"
          >
            <span className="text-xl sm:text-2xl group-hover:-translate-y-0.5 transition-transform">🌅</span>
            End of Day
          </button>

          <button 
            onClick={() => handleExportData(7, 'Last 7 Days')}
            disabled={isExporting}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold py-3.5 sm:py-4 px-3 sm:px-4 rounded-xl text-xs sm:text-sm transition-colors flex flex-col items-center justify-center gap-1.5 sm:gap-2 group disabled:opacity-50 active:scale-95"
          >
            <span className="text-xl sm:text-2xl group-hover:-translate-y-0.5 transition-transform">📅</span>
            Last 7 Days
          </button>

          <button 
            onClick={() => handleExportData(30, 'Last 1 Month')}
            disabled={isExporting}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold py-3.5 sm:py-4 px-3 sm:px-4 rounded-xl text-xs sm:text-sm transition-colors flex flex-col items-center justify-center gap-1.5 sm:gap-2 group disabled:opacity-50 active:scale-95"
          >
            <span className="text-xl sm:text-2xl group-hover:-translate-y-0.5 transition-transform">📆</span>
            Last 1 Month
          </button>

          <button 
            onClick={() => handleExportData(180, 'Last 6 Months')}
            disabled={isExporting}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold py-3.5 sm:py-4 px-3 sm:px-4 rounded-xl text-xs sm:text-sm transition-colors flex flex-col items-center justify-center gap-1.5 sm:gap-2 group disabled:opacity-50 active:scale-95"
          >
            <span className="text-xl sm:text-2xl group-hover:-translate-y-0.5 transition-transform">📈</span>
            Last 6 Months
          </button>

          <button 
            onClick={() => handleExportData(365, 'Last 1 Year')}
            disabled={isExporting}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold py-3.5 sm:py-4 px-3 sm:px-4 rounded-xl text-xs sm:text-sm transition-colors flex flex-col items-center justify-center gap-1.5 sm:gap-2 group disabled:opacity-50 col-span-2 sm:col-span-1 active:scale-95"
          >
            <span className="text-xl sm:text-2xl group-hover:-translate-y-0.5 transition-transform">🏢</span>
            Last 1 Year
          </button>
        </div>

        {isExporting && (
          <div className="mt-4 sm:mt-6 text-center text-blue-400 text-xs sm:text-sm font-bold animate-pulse">
            Generating Secure CSV Report... Please wait.
          </div>
        )}
      </div>

    </div>
  );
}