import React from "react";
import RefineCalculator from "@/components/refine/RefineCalculator";

export default function RefinePage() {
  return (
    <div className="wrapper py-10 min-h-screen">
      <div className="mb-10">
        <h1 className="text-4xl font-black mb-2">
          Resource <span className="text-gradient">Refining</span>
        </h1>
        <p className="text-muted-foreground">
          Calculate the most profitable material conversion with live market
          data.
        </p>
      </div>

      <RefineCalculator />
    </div>
  );
}
