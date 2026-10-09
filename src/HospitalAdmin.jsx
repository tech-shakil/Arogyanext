import { useState } from 'react';
import { db } from './firebase';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';
import { 
  BarChart3, 
  Users, 
  Pill, 
  Clock, 
  Stethoscope, 
  Download, 
  Star,
  Shield,
  TrendingUp,
  TrendingDown,
  FileSpreadsheet,
  Loader2,
  Calendar,
  CheckCircle2,
  Building2
} from 'lucide-react';

export default function HospitalAdmin({ hospitalId }) {
  const [isExporting, setIsExporting] = useState(false);
  const [hospitalName] = useState("ArogyaNext City Hospital");

  const stats = [
    { title: "Patients Today", value: "142", trend: "+12%", trendUp: true, icon: Users },
    { title: "Pharmacy Revenue", value: "₹45,200", trend: "+5%", trendUp: true, icon: Pill },
    { title: "Avg Wait Time", value: "14 mins", trend: "-2 mins", trendUp: false, icon: Clock },
    { title: "Active Doctors", value: "8", trend: "Online", trendUp: null, icon: Stethoscope }
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

      alert(`Successfully exported ${exportData.length} records.`);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data. Check console for details.");
    }
    setIsExporting(false);
  };

  const departments = [
    { name: 'General Medicine & Chest', percent: 42, count: 60, color: 'var(--blue-600)' },
    { name: 'Pediatrics & Child Care', percent: 24, count: 34, color: 'var(--blue-500)' },
    { name: 'Orthopedics & Joint Care', percent: 18, count: 26, color: 'var(--positive-500)' },
    { name: 'ENT & Ophthalmology', percent: 16, count: 22, color: 'var(--warning-500)' },
  ];

  const exportOptions = [
    { label: 'End of Day', days: 1, icon: Calendar },
    { label: 'Last 7 Days', days: 7, icon: Calendar },
    { label: 'Last Month', days: 30, icon: Calendar },
    { label: '6 Months', days: 180, icon: Calendar },
    { label: 'Last Year', days: 365, icon: Calendar },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 font-sans" style={{ background: 'var(--surface-app)' }}>
      
      {/* --- HEADER --- */}
      <div className="mb-5 sm:mb-6 border-b pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3" style={{ borderColor: 'var(--border-subtle)' }}>
        <div>
          <p className="text-xs font-semibold uppercase mb-0.5" style={{ color: 'var(--blue-600)', letterSpacing: '0.04em' }}>Analytics</p>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{hospitalName}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
            <span className="status-dot status-dot--active"></span>
            Operational
          </span>
          <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold border" style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}>
            {hospitalId}
          </span>
        </div>
      </div>

      {/* --- STATS ROW --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 sm:mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="p-3 sm:p-4 rounded-lg border" style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-default)' }}>
              <div className="flex justify-between items-start mb-2">
                <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: 'var(--blue-50)' }}>
                  <Icon className="w-4 h-4" style={{ color: 'var(--blue-600)' }} />
                </div>
                <span className="badge text-[10px]" style={{
                  background: stat.trendUp === true ? 'var(--positive-50)' : stat.trendUp === false ? 'var(--danger-50)' : 'var(--blue-50)',
                  color: stat.trendUp === true ? 'var(--positive-600)' : stat.trendUp === false ? 'var(--danger-600)' : 'var(--blue-600)',
                  border: stat.trendUp === true ? '1px solid var(--positive-100)' : stat.trendUp === false ? '1px solid var(--danger-100)' : '1px solid var(--blue-100)'
                }}>
                  {stat.trendUp === true && <TrendingUp className="w-3 h-3" />}
                  {stat.trendUp === false && <TrendingDown className="w-3 h-3" />}
                  {stat.trend}
                </span>
              </div>
              <p className="text-[11px] font-semibold uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.03em' }}>{stat.title}</p>
              <p className="text-lg sm:text-xl font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* --- DEPARTMENT & QUALITY --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5 sm:mb-6">
        
        {/* Department Breakdown */}
        <div className="lg:col-span-2 p-4 sm:p-5 rounded-lg border" style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-default)' }}>
          <div className="flex justify-between items-center mb-4 pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>OPD Footfall by Department</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Consultation load distribution</p>
            </div>
            <span className="badge badge--blue text-[10px]">Live Data</span>
          </div>

          <div className="space-y-4">
            {departments.map((dept) => (
              <div key={dept.name}>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span style={{ color: 'var(--text-primary)' }}>{dept.name}</span>
                  <span style={{ color: 'var(--text-tertiary)' }}>{dept.percent}% ({dept.count} patients)</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-tertiary)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${dept.percent}%`, background: dept.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quality Score */}
        <div className="p-4 sm:p-5 rounded-lg border flex flex-col justify-between" style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-default)' }}>
          <div>
            <h3 className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>Quality Score</h3>
            <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>Patient satisfaction & compliance</p>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-md border" style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" style={{ color: 'var(--warning-500)' }} />
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Patient Rating</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Post-visit feedback</p>
                  </div>
                </div>
                <span className="text-sm font-bold" style={{ color: 'var(--warning-500)' }}>4.9 / 5.0</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-md border" style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" style={{ color: 'var(--positive-500)' }} />
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Zero Wait SLA</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Seen within 15 mins</p>
                  </div>
                </div>
                <span className="text-sm font-bold" style={{ color: 'var(--positive-500)' }}>92.4%</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-md border" style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" style={{ color: 'var(--blue-600)' }} />
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>ABDM Compliance</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>National Health ID</p>
                  </div>
                </div>
                <span className="text-sm font-bold" style={{ color: 'var(--blue-600)' }}>100%</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] mt-3 text-center" style={{ color: 'var(--text-muted)' }}>
            Automated compliance audits updated continuously.
          </p>
        </div>
      </div>

      {/* --- EXPORT --- */}
      <div className="p-4 sm:p-6 rounded-lg border" style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-default)' }}>
        <h2 className="text-sm font-semibold mb-1 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <FileSpreadsheet className="w-4 h-4" style={{ color: 'var(--blue-600)' }} />
          Data Export
        </h2>
        <p className="text-xs mb-4 max-w-2xl" style={{ color: 'var(--text-tertiary)' }}>
          Download CSV reports of operations, patient footfall, and pharmacy statuses.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          {exportOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button 
                key={opt.label}
                onClick={() => handleExportData(opt.days, opt.label)}
                disabled={isExporting}
                className="border py-3 px-3 rounded-md text-xs font-medium transition-colors flex flex-col items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)', background: 'var(--surface-secondary)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--blue-50)'; e.currentTarget.style.borderColor = 'var(--blue-200)'; e.currentTarget.style.color = 'var(--blue-600)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-secondary)'; e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                <Download className="w-4 h-4" />
                {opt.label}
              </button>
            );
          })}
        </div>

        {isExporting && (
          <div className="mt-4 text-center text-xs font-medium flex items-center justify-center gap-2" style={{ color: 'var(--blue-600)' }}>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Generating report...
          </div>
        )}
      </div>

    </div>
  );
}