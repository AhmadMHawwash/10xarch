import { databaseReplicationLevelMaker } from "./databaseReplication/challenge";
import { loadBalancingLevelMaker } from "./loadBalancing/challenge";

const levels = [loadBalancingLevelMaker(), databaseReplicationLevelMaker()];

export default levels;
