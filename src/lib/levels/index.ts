import { basicLevelMaker } from "./content/basic";
import { cachingLevelMaker } from "./content/caching";
import { databaseReplicationLevelMaker } from "./content/database-replication";
import { loadBalancingLevelMaker } from "./content/load-balancing";

const levels = [
  basicLevelMaker,
  loadBalancingLevelMaker,
  databaseReplicationLevelMaker,
  cachingLevelMaker,
];

export default levels;
