//calmana-frontend/app/admin/dashboard/page.js
"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { subDays } from "date-fns";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, Legend, PieChart, Pie, Cell
} from "recharts";

const COLORS = ["#2F855A", "#48BB78", "#9AE6B4", "#F6AD55", "#F56565", "#63B3ED", "#805AD5"];

function toISO(d) { return d.toISOString().slice(0, 10); }

function presetRange(key) {
  const end = new Date();
  let start;
  if (key === "7") start = subDays(end, 6);
  else if (key === "30") start = subDays(end, 29);
  else if (key === "90") start = subDays(end, 89);
  else start = subDays(end, 6);
  return { start: toISO(start), end: toISO(end) };
}

export default function AdminDashboard() {

  const [rangeKey, setRangeKey] = useState("7");
  const [customStart, setCustomStart] = useState(toISO(subDays(new Date(), 6)));
  const [customEnd, setCustomEnd] = useState(toISO(new Date()));
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState({});
  const [moodTrend, setMoodTrend] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [quizDist, setQuizDist] = useState([]);
  const [affList, setAffList] = useState([]);
  const [peakHour, setPeakHour] = useState(null);

  const range = useMemo(() => {
    if (rangeKey === "custom") return { start: customStart, end: customEnd };
    return presetRange(rangeKey);
  }, [rangeKey, customStart, customEnd]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      window.location.href = "/admin/login";
      return;
    }

    async function fetchAll() {
      setLoading(true);
      try {
        const [
          sumRes, trendRes, usersRes, quizRes, affRes, peakRes
        ] = await Promise.all([
          axios.get(`http://localhost:5000/api/admin-data/summary`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:5000/api/admin-data/analytics/mood-trend`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:5000/api/admin-data/analytics/daily-active-users`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:5000/api/admin-data/analytics/quiz-distribution`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:5000/api/admin-data/analytics/affirmation-popularity`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:5000/api/admin-data/analytics/peak-hour`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
        ]);

        setSummary(sumRes.data || {});
        setMoodTrend(trendRes.data || []);
        setActiveUsers(usersRes.data || []);
        setQuizDist(quizRes.data || []);
        setAffList(affRes.data || []);
        setPeakHour(peakRes.data || {});

      } catch (err) {
        console.error(err);
        alert("Failed to load analytics.");
      }
      setLoading(false);
    }

    fetchAll();
  }, [range]);

  if (loading) return <p>Loading analytics…</p>;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full m-0 p-0"
      >

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-green-900">Analytics Dashboard</h1>
          <div className="text-sm text-gray-600">
            Peak Hour: <strong>{peakHour?.peakHour ?? "-"}:00</strong>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 mb-6">
          {[
            { label: "Users", value: summary.totalUsers ?? 0 },
            { label: "Journals", value: summary.totalJournals ?? 0 },
            { label: "Moods Logged", value: summary.totalMoods ?? 0 },
            { label: "Breathing Sessions", value: summary.totalBreathing ?? 0 },
            { label: "Quizzes Taken", value: summary.totalQuizzes ?? 0 }, // ⭐ NEW CARD
          ].map((card, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-xl shadow-md flex flex-col items-center justify-center h-24"
            >
              <p className="text-green-700 text-sm">{card.label}</p>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          ))}
        </div>


        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Mood Trend */}
          <div className="bg-white p-6 rounded-xl shadow-md h-[330px]">
            <h3 className="text-lg font-semibold text-green-800 mb-3">Mood Trend</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={moodTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#2F855A" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Active Users */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-green-800 mb-3">Daily Active Users</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={activeUsers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="activeUsers" fill="#48BB78" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quiz Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-green-800 mb-3">Quiz Distribution</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={quizDist}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {quizDist.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* Affirmations */}
        <div className="mt-6 bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-green-800 mb-3">Top Affirmations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {affList.map((a, i) => (
              <div key={i} className="p-2 border rounded flex justify-between">
                <span>{a._id}</span>
                <span className="text-green-700 font-bold">{a.count}</span>
              </div>
            ))}
          </div>
        </div>

      </motion.div>
    </>
  );
}
