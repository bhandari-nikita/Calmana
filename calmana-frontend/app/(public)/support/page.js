"use client";

import { useState } from "react";

export default function Support() {
  const [search, setSearch] = useState("");

  const helplines = [
    { name: "AASRA", phone: "9820466726", website: "https://www.aasra.info", description: "24x7 suicide prevention & mental health support.", location: "Mumbai, Maharashtra" },
    { name: "Vandrevala Foundation", phone: "1860 266 2345", website: "https://www.vandrevalafoundation.com", description: "Free mental health counselling.", location: "All India" },
    { name: "Snehi", phone: "9582208181", website: "http://www.snehi.org", description: "Emotional support helpline.", location: "New Delhi" },
    { name: "iCall", phone: "9152987821", website: "https://icallhelpline.org", description: "Counselling via call & email.", location: "All India" },
    { name: "Samaritans Mumbai", phone: "8422984528", website: "http://samaritansmumbai.com", description: "Listening support for those in distress.", location: "Mumbai, Maharashtra" },
    { name: "Fortis Stress Helpline", phone: "08376804102", website: "https://www.fortishealthcare.com", description: "Psychological support & therapy.", location: "All India" },
    { name: "Snehalaya", phone: "8888817666", website: "https://www.snehalaya.org", description: "Support for women & children in distress.", location: "Ahmednagar, Maharashtra" },
    { name: "Roshni Trust", phone: "040 66202000", website: "https://www.roshnihyd.org", description: "Mental health crisis helpline.", location: "Hyderabad, Telangana" },
    { name: "Manas Mitra", phone: "18005990019", website: "https://www.manaskendra.org", description: "Government of India mental health helpline.", location: "All India" },
  ];

  const filteredHelplines = helplines.filter(
    h => h.name.toLowerCase().includes(search.toLowerCase()) ||
         h.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen  text-green-900">

      {/* Page Title */}
      <header className="text-center py-10 px-4">
        <h2 className="text-3xl font-bold">Mental Health Support in India</h2>
        <p className="mt-2 text-lg">Find helplines and organizations that can help you.</p>
      </header>

      {/* Search Bar */}
      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Search by name or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-3 rounded-lg border border-green-800 w-80 focus:outline-none focus:ring-2 focus:ring-green-900 bg-[#e3f1e4]"
        />
      </div>

      {/* Support Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6 pb-10 bg-[#f5fff5]">
        {filteredHelplines.map((h, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg p-5 border border-green-200 hover:shadow-xl transition">
            <h3 className="text-xl font-bold text-green-800">{h.name}</h3>
            <p className="text-sm text-gray-600">{h.location}</p>
            <p className="mt-2 text-gray-700">{h.description}</p>
            <div className="mt-4 flex gap-3">
              <a href={`tel:${h.phone}`} className="bg-[#2f5d4a] text-white px-4 py-2 rounded-lg hover:bg-[#3f7f68] transition">Call</a>
              <a href={h.website} target="_blank" rel="noopener noreferrer" className="bg-[#d4f0d4] text-[#2f5d4a] px-4 py-2 rounded-lg hover:bg-green-200 transition">Website</a>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
