"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const PAGE_SIZE = 12;

export default function AdminBreathingPage() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(()=> {
    const token = localStorage.getItem("adminToken");
    if(!token){window.location.href="/admin/login"; return;}
    axios.get("http://localhost:5000/api/admin-data/breathing", { headers:{ Authorization:`Bearer ${token}` }})
      .then(r=>setItems(r.data || []))
      .catch(e=>console.error(e))
      .finally(()=>setLoading(false));
  },[]);

  const filtered = useMemo(()=> {
    const t = q.trim().toLowerCase();
    if(!t) return items;
    return items.filter(i => (i.userId?.username||"").toLowerCase().includes(t) || String(i.cyclesCompleted).includes(t));
  },[items,q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  function exportCSV(){
    const rows=[["user","cycles","date"]];
    filtered.forEach(x=>rows.push([x.userId?.username||"Unknown", x.cyclesCompleted, new Date(x.createdAt).toLocaleString()]));
    const csv = rows.map(r=>r.map(c=>`"${(c||"").toString().replace(/"/g,'""')}"`).join(",")).join("\n");
    const b=new Blob([csv],{type:"text/csv"}); const url=URL.createObjectURL(b); const a=document.createElement("a"); a.href=url; a.download="breathing.csv"; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-green-900">Breathing Sessions</h1>
        <div className="flex items-center gap-2">
          <input value={q} onChange={e=>{setQ(e.target.value); setPage(1)}} placeholder="Search user or cycles" className="border rounded px-3 py-1"/>
          <button onClick={exportCSV} className="bg-green-700 text-white px-3 py-1 rounded">Export CSV</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-green-50 text-left text-sm text-green-800">
            <tr><th className="p-4">User</th><th className="p-4">Cycles</th><th className="p-4">Date</th></tr>
          </thead>
          <tbody>
            {loading ? (<tr><td colSpan={3} className="p-4">Loading...</td></tr>) : current.length===0 ? (<tr><td colSpan={3} className="p-4">No sessions.</td></tr>) : current.map(s=>(
              <tr key={s._id} className="border-b hover:bg-green-50">
                <td className="p-4">{s.userId?.username || "Unknown"}</td>
                <td className="p-4">{s.cyclesCompleted}</td>
                <td className="p-4">{new Date(s.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div>{filtered.length} sessions</div>
        <div className="flex items-center gap-2">
          <button disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-2 py-1 border rounded">Prev</button>
          <div>Page {page} / {totalPages}</div>
          <button disabled={page===totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} className="px-2 py-1 border rounded">Next</button>
        </div>
      </div>
    </motion.div>
  );
}
