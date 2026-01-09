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
          sumRes, trendRes, usersRes, quizRes, affRes,
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

        ]);

        setSummary(sumRes.data || {});
        setMoodTrend(trendRes.data || []);
        setActiveUsers(usersRes.data || []);
        setQuizDist(quizRes.data || []);
        setAffList(affRes.data || []);


      } catch (err) {
        console.error(err);
        alert("Failed to load analytics.");
      }
      setLoading(false);
    }

    fetchAll();
  }, [range]);

  if (loading) return <p>Loading analytics…</p>;

function StatCard({ title, value, subtitle, muted }) {
  return (
    <div className={`bg-white p-5 rounded-xl border transition
      ${muted ? "border-gray-200 text-gray-500" : "border-gray-200 hover:shadow-md"}
    `}>
      <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
        {title}
      </p>

      <p className="text-3xl font-semibold text-gray-900">
        {value}
      </p>

      {subtitle && (
        <p className="text-xs text-gray-500 mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}




  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full m-0 p-0"
      >

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Admin Overview
            </h1>
            <p className="text-sm text-gray-600">
              System status and recent activity
            </p>
          </div>


        </div>


        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={summary.totalUsers ?? 0}
          />
          <StatCard
            title="Active Today"
            value={activeUsers?.[activeUsers.length - 1]?.activeUsers ?? 0}
          />
          <StatCard
  title="Mood Logging Rate"
  value={summary.moodLoggingRate ?? 0}
  subtitle="entries per user"
/>

          <StatCard
  title="Breathing Engagement"
  value={summary.avgBreathingPerUser ?? 0}
  subtitle="avg sessions per user"
/>

        </div>



        {/* ANALYTICS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* USER ACTIVITY */}
          <div className="lg:col-span-2 bg-white p-5 rounded-xl border">
            <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
              User Activity (Last 7 Days)
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={activeUsers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="activeUsers" fill="#2F855A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-6">

            {/* QUIZ USAGE */}
            <div className="bg-white p-4 rounded-xl border">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Quiz Usage
              </h3>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie
                    data={quizDist}
                    dataKey="count"
                    nameKey="label"
                    innerRadius={40}
                    outerRadius={60}
                  >
                    {quizDist.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* BREATHING */}
            {/* <div className="bg-white p-4 rounded-xl border">
              <h3 className="text-sm font-semibold text-gray-700">
                Breathing Engagement
              </h3>

              <p className="text-3xl font-bold text-green-800 mt-1">
                {summary.avgBreathingPerUser?.toFixed(1) ?? "0.0"}

              </p>

              <p className="text-xs text-gray-500">
                Avg sessions per user
              </p>
            </div> */}


          </div>
        </div>


      </motion.div>
    </>
  );
}
