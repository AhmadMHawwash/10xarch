import { cachingLevelMaker } from "./content/caching";
import { databaseReplicationLevelMaker } from "./content/database-replication";
import { loadBalancingLevelMaker } from "./content/load-balancing";

const levels = [
  loadBalancingLevelMaker(),
  databaseReplicationLevelMaker(),
  cachingLevelMaker(),
];

export default levels;
