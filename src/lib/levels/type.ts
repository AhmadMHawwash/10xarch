import { type SystemComponent } from "@/components/Gallery";

// type Metric = {
//   value: number;
//   label: string;
// };

// type DashboardContent = {
//   status?: "red" | "green" | "recovering";
//   info?: string;
//   components?: DashboardContent[];
//   responseTimeInSec: Metric
//   requestsPerSec: Metric
//   successRate: Metric
// }

// type Connection = {
//   source: string;
//   target: string;
// };

// type SystemStats = {
//   numberOfActiveUsers: number;
//   numberOfCountries: number;
//   costForCurrentSystemDesign: string;
// };

// type GenericStats = {
//   requestsPerSec: number;
//   successRate: string;
//   latency: string;
// };

type Dashboard = {
  // currentSystemStats: SystemStats;
  problems: string[];
  // genericStats: GenericStats;
};

// type Solution = {
//   connect: Connection[];
// };

export type Level = {
  name: string;
  title: string;
  description: string;
  // readingMaterial: string;
  components: SystemComponent["name"][];
  dashboard: Dashboard;
  // solution: Solution;
  // updatedDashboard: {
  //   numberOfActiveUsers: number;
  //   serverUtilization: string[];
  //   cacheUtilization?: string;
  //   databaseUtilization: string;
  //   cdnUtilization?: string;
  //   costForCurrentSystemDesign: string;
  //   latency: string;
  // };
};
