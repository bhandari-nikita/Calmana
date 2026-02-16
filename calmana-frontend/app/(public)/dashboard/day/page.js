import { Suspense } from "react";
import DayDetailsClient from "./DayDetailsClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <DayDetailsClient />
    </Suspense>
  );
}
