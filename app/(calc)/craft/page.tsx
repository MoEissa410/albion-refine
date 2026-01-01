import React from "react";
import CraftCalculator from "@/components/craft/CraftCalculator";

export default function CraftPage() {
  return (
    <div className="wrapper py-10 min-h-screen">
      <div className="mb-10">
        <h1 className="text-4xl font-black mb-2">
          Item <span className="text-gradient">Crafting</span>
        </h1>
        <p className="text-muted-foreground">
          Maximize your silver by analyzing material costs and item values.
        </p>
      </div>

      <CraftCalculator />
    </div>
  );
}
