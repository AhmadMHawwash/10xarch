import { basicStageMaker } from "./content/1-basic";
import { cachingStageMaker } from "./content/5-caching";
import { cdnStageMaker } from "./content/4-cdn";
import { databaseReplicationStageMaker } from "./content/6-database-replication";
import { loadBalancingStageMaker } from "./content/2-load-balancing";
import { sessionManagementStageMaker } from "./content/3-session-management";
// import { messageQueueStageMaker } from "./content/8-message-queue";
import { clusteringStageMaker } from "./content/7-clustering";

const stages = [
  basicStageMaker,
  loadBalancingStageMaker,
  sessionManagementStageMaker,
  cdnStageMaker,
  cachingStageMaker,
  databaseReplicationStageMaker,
  clusteringStageMaker,
  // messageQueueStageMaker,
];

export default stages;
