import { basicLevelMaker } from "./content/1-basic";
import { cachingLevelMaker } from "./content/5-caching";
import { cdnLevelMaker } from "./content/4-cdn";
import { databaseReplicationLevelMaker } from "./content/6-database-replication";
import { loadBalancingLevelMaker } from "./content/2-load-balancing";
import { sessionManagementLevelMaker } from "./content/3-session-management";
// import { messageQueueLevelMaker } from "./content/8-message-queue";
import { clusteringLevelMaker } from "./content/7-clustering";

const levels = [
  basicLevelMaker,
  loadBalancingLevelMaker,
  sessionManagementLevelMaker,
  cdnLevelMaker,
  cachingLevelMaker,
  databaseReplicationLevelMaker,
  clusteringLevelMaker,
  // messageQueueLevelMaker,
];

export default levels;
