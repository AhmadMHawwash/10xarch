import { basicLevelMaker } from "./content/1-basic";
import { cachingLevelMaker } from "./content/6-caching";
import { cdnLevelMaker } from "./content/5-cdn";
import { databaseReplicationLevelMaker } from "./content/4-database-replication";
import { loadBalancingLevelMaker } from "./content/2-load-balancing";
import { sessionManagementLevelMaker } from "./content/3-session-management";
import { messageQueueLevelMaker } from "./content/7-message-queue";

const levels = [
  basicLevelMaker,
  loadBalancingLevelMaker,
  sessionManagementLevelMaker,
  databaseReplicationLevelMaker,
  cdnLevelMaker,
  cachingLevelMaker,
  messageQueueLevelMaker
];

export default levels;
