import { basicLevelMaker } from "./content/1-basic";
import { cachingLevelMaker } from "./content/5-caching";
import { cdnLevelMaker } from "./content/4-cdn";
import { databaseReplicationLevelMaker } from "./content/3-database-replication";
import { loadBalancingLevelMaker } from "./content/2-load-balancing";

const levels = [
  basicLevelMaker,
  loadBalancingLevelMaker,
  databaseReplicationLevelMaker,
  cdnLevelMaker,
  cachingLevelMaker,
];

export default levels;
