"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const PAGE_SIZE = 12;
function MoodBadge({ m }) {
  const map = { Happy: "bg-green-100 text-green-800", Sad: "bg-blue-100 text-blue-800", Anxious: "bg-yellow-100 text-yellow-800", Stressed: "bg-red-100 text-red-800" };
  return <span className={`px-2 py-1 rounded text-xs ${map[m] || "bg-gray-100 text-gray-800"}`}>{m}</span>;
}

export default function AdminMoodsPage() {
  const [moods, setMoods] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(()=> {
    const token = localStorage.getItem("adminToken");
    if(!token){window.location.href="/admin/login"; return;}
    axios.get("http://localhost:5000/api/admin-data/moods", { headers:{ Authorization:`Bearer ${token}` }})
      .then(r => setMoods(r.data || []))
      .catch(e=>console.error(e))
      .finally(()=>setLoading(false));
  },[]);

  const filtered = useMemo(()=> {
    const t = q.trim().toLowerCase();
    if(!t) return moods;
    return moods.filter(m => (m.user?.username||"").toLowerCase().includes(t) || (m.mood||"").toLowerCase().includes(t) || (m.date||"").toLowerCase().includes(t));
  },[moods,q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  function exportCSV() {
    const rows=[["user","mood","value","date"]];
    filtered.forEach(m=>rows.push([m.user?.username||"Unknown", m.mood, m.moodValue, m.date]));
    const csv = rows.map(r=>r.map(c=>`"${(c||"").toString().replace(/"/g,'""')}"`).join(",")).join("\n");
    const b=new Blob([csv],{type:"text/csv"}); const url=URL.createObjectURL(b); const a=document.createElement("a"); a.href=url; a.download="moods.csv"; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-green-900">Moods</h1>
        <div className="flex items-center gap-2">
          <input value={q} onChange={e=>{setQ(e.target.value);setPage(1)}} placeholder="Search user/mood/date" className="border rounded px-3 py-1"/>
          <button onClick={exportCSV} className="bg-green-700 text-white px-3 py-1 rounded">Export CSV</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-green-50 text-left text-sm text-green-800">
            <tr><th className="p-4">User</th><th className="p-4">Mood</th><th className="p-4">Value</th><th className="p-4">Date</th></tr>
          </thead>
          <tbody>
            {loading ? (<tr><td colSpan={4} className="p-4">Loading...</td></tr>) : current.length===0 ? (<tr><td colSpan={4} className="p-4">No entries.</td></tr>) : current.map(m => (
              <tr key={m._id} className="border-b hover:bg-green-50">
                <td className="p-4">{m.user?.username || "Unknown"}</td>
                <td className="p-4"><MoodBadge m={m.mood} /></td>
                <td className="p-4">{m.moodValue}</td>
                <td className="p-4">{m.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div>{filtered.length} entries</div>
        <div className="flex items-center gap-2">
          <button disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-2 py-1 border rounded">Prev</button>
          <div>Page {page} / {totalPages}</div>
          <button disabled={page===totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} className="px-2 py-1 border rounded">Next</button>
        </div>
      </div>
    </motion.div>
  );
}
