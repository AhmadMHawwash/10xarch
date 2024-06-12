import { basicLevelMaker } from "./content/1-basic";
import { cachingLevelMaker } from "./content/5-caching";
import { cdnLevelMaker } from "./content/4-cdn";
import { databaseReplicationLevelMaker } from "./content/6-database-replication";
import { loadBalancingLevelMaker } from "./content/2-load-balancing";
import { sessionManagementLevelMaker } from "./content/3-session-management";
import { messageQueueLevelMaker } from "./content/7-message-queue";

const levels = [
  basicLevelMaker,
  loadBalancingLevelMaker,
  sessionManagementLevelMaker,
  cdnLevelMaker,
  cachingLevelMaker,
  databaseReplicationLevelMaker,
  messageQueueLevelMaker,
];

export default levels;
