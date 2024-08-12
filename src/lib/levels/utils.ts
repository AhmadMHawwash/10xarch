import { create } from "zustand";
import { type SystemComponent } from "./type";

export const componentsNumberingStore = create<{
  getNextId: (componentName: SystemComponent["name"]) => string;
  componentsToCount: Record<SystemComponent["name"], number>;
  resetCounting: () => void;
}>((set, get) => ({
  componentsToCount: {
    Client: 1,
    Server: 1,
    Database: 1,
    "Load Balancer": 1,
    Cache: 1,
    CDN: 1,
    "Message Queue": 1,
    "Database Cluster": 1,
    "Cache Cluster": 1,
    "Server Cluster": 1,
    Whiteboard: 1,
    "API Request Flow": 1,
  },
  getNextId: (componentName) => {
    const id = get().componentsToCount[componentName];
    set((state) => ({
      componentsToCount: {
        ...state.componentsToCount,
        [componentName]: state.componentsToCount[componentName] + 1,
      },
    }));
    return `${componentName}-${id}`;
  },
  resetCounting: () => {
    set({
      componentsToCount: {
        Client: 1,
        Server: 1,
        Database: 1,
        "Load Balancer": 1,
        Cache: 1,
        CDN: 1,
        "Message Queue": 1,
        "Database Cluster": 1,
        "Cache Cluster": 1,
        "Server Cluster": 1,
        Whiteboard: 1,
        "API Request Flow": 1,
      },
    });
  },
}));
