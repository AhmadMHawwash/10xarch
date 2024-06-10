import { basicLevelMaker } from "./content/basic";
import { cachingLevelMaker } from "./content/caching";
import { cdnLevelMaker } from "./content/cdn";
import { databaseReplicationLevelMaker } from "./content/database-replication";
import { loadBalancingLevelMaker } from "./content/load-balancing";

const levels = [
  basicLevelMaker,
  loadBalancingLevelMaker,
  databaseReplicationLevelMaker,
  cdnLevelMaker,
  cachingLevelMaker,
];

export default levels;
