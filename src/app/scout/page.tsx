import ScoutDashboard from "./scout-dashboard";

export const metadata = {
  title: "Research Scout — Job Pre-Qualification Agent",
  description:
    "Run the Research Scout agent: gather, read, score, filter, and format pre-qualified healthcare and e-commerce product roles.",
};

export default function ScoutPage() {
  return <ScoutDashboard />;
}
