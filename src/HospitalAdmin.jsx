import { useState } from 'react';
import { db } from './firebase';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';

// NEW: Accept hospitalId as a prop!
export default function HospitalAdmin({ hospitalId }) {
  const [isExporting, setIsExporting] = useState(false);
  const [hospitalName] = useState("ArogyaNext City Hospital"); // In a real app, fetch this from the 'users' or 'hospitals' doc

  // Mock stats for the dashboard UI (In a full production build, these would be calculated live from Firestore)
  const stats = [
    { title: "Patients Today", value: "142", trend: "+12%", icon: "👨‍⚕️" },
    { title: "Pharmacy Revenue", value: "₹45,200", trend: "+5%", icon: "💊" },
    { title: "Avg Wait Time", value: "14 mins", trend: "-2 mins", icon: "⏱️" },
    { title: "Active Doctors", value: "8", trend: "Online", icon: "🩺" }
  ];

  // --- THE CSV EXPORT LOGIC ---
  const handleExportData = async (timeframeDays, timeframeLabel) => {
    if (!hospitalId) {
      alert("Error: Hospital ID is missing.");
      return;
    }

    setIsExporting(true);
    try {
      // 1. Calculate the date cutoff
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timeframeDays);

      // 2. 🔒 MULTI-TENANT FIX: Fetch the data ONLY for this specific hospital
      const q = query(
        collection(db, 'appointments'), 
        where("hospitalId", "==", hospitalId), // Magic isolation line
        orderBy('timestamp', 'desc') // Ensure your Receptionist panel uses 'timestamp'
      );
      
      const snapshot = await getDocs(q);
      
      let exportData = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Handle Firebase Timestamps safely
        let recordDate = new Date();
        if (data.timestamp?.toDate) {
            recordDate = data.timestamp.toDate();
        } else if (data.timestamp) {
            recordDate = new Date(data.timestamp);
        } else if (data.createdAt?.toDate) { // Fallback just in case
            recordDate = data.createdAt.toDate();
        }

        // Filter by the selected timeframe
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

      // 3. Convert JSON to CSV format
      const headers = Object.keys(exportData[0]).join(",") + "\n";
      const rows = exportData.map(obj => 
        Object.values(obj).map(value => `"${value}"`).join(",") // Quotes prevent comma issues in text
      ).join("\n");
      const csvContent = headers + rows;

      // 4. Trigger Browser Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      // Clean up the filename so it looks professional
      link.setAttribute("download", `${hospitalId}_Report_${timeframeLabel.replace(/ /g, '_')}_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert(`✅ Successfully exported ${exportData.length} records!`);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data. Check console for details. (Note: You may need to click the Firebase Index link in the console first!)");
    }
    setIsExporting(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8 font-sans text-slate-300">
      
      <div className="mb-8 border-b border-slate-800 pb-6 flex justify-between items-end">
        <div>
          <p className="text-blue-500 font-bold uppercase tracking-widest text-sm mb-1">Director's Hub</p>
          <h1 className="text-4xl font-black text-white">{hospitalName}</h1>
        </div>
        <div className="text-right">
          <p className="text-slate-500 text-sm mb-1">System Status: <span className="text-emerald-500 font-bold">● Secure</span></p>
          <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded text-xs font-bold uppercase tracking-widest border border-slate-700">
             Workspace: {hospitalId}
          </span>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, index) => (
          <div key={index} className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <span className="text-3xl">{stat.icon}</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${stat.trend.includes('+') ? 'bg-emerald-500/10 text-emerald-400' : stat.trend === 'Online' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'}`}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-1">{stat.title}</h3>
            <p className="text-3xl font-black text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Export Section */}
      <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-lg">
        <h2 className="text-2xl font-black text-white mb-2 flex items-center">
          <span className="mr-3">📊</span> Data Export & Reports
        </h2>
        <p className="text-slate-400 mb-8 max-w-2xl">
          Download legally compliant CSV reports of all hospital operations, patient footfall, and pharmacy statuses. These files can be opened directly in Microsoft Excel or Google Sheets.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <button 
            onClick={() => handleExportData(1, 'End of Day')}
            disabled={isExporting}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold py-4 px-4 rounded-xl transition-colors flex flex-col items-center justify-center gap-2 group disabled:opacity-50"
          >
            <span className="text-2xl group-hover:-translate-y-1 transition-transform">🌅</span>
            End of Day
          </button>

          <button 
            onClick={() => handleExportData(7, 'Last 7 Days')}
            disabled={isExporting}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold py-4 px-4 rounded-xl transition-colors flex flex-col items-center justify-center gap-2 group disabled:opacity-50"
          >
            <span className="text-2xl group-hover:-translate-y-1 transition-transform">📅</span>
            Last 7 Days
          </button>

          <button 
            onClick={() => handleExportData(30, 'Last 1 Month')}
            disabled={isExporting}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold py-4 px-4 rounded-xl transition-colors flex flex-col items-center justify-center gap-2 group disabled:opacity-50"
          >
            <span className="text-2xl group-hover:-translate-y-1 transition-transform">📆</span>
            Last 1 Month
          </button>

          <button 
            onClick={() => handleExportData(180, 'Last 6 Months')}
            disabled={isExporting}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold py-4 px-4 rounded-xl transition-colors flex flex-col items-center justify-center gap-2 group disabled:opacity-50"
          >
            <span className="text-2xl group-hover:-translate-y-1 transition-transform">📈</span>
            Last 6 Months
          </button>

          <button 
            onClick={() => handleExportData(365, 'Last 1 Year')}
            disabled={isExporting}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold py-4 px-4 rounded-xl transition-colors flex flex-col items-center justify-center gap-2 group disabled:opacity-50"
          >
            <span className="text-2xl group-hover:-translate-y-1 transition-transform">🏢</span>
            Last 1 Year
          </button>
        </div>

        {isExporting && (
          <div className="mt-6 text-center text-blue-400 font-bold animate-pulse">
            Generating Secure CSV Report... Please wait.
          </div>
        )}
      </div>

    </div>
  );
}