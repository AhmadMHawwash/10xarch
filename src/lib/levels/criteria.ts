export const generalCriteria = [
  "Components should be connected starting from the client and ending at the database",
  "Load balancers can only be used for servers, and can not be used for databases",
  "Components should be connected in a good architectural sense",
  "Connections should be made in a way that makes sense for the system",
];

export const constraints = [
  "Load balancers can only be used for servers, and can not be used for databases",
  "Make sure that components are connected starting from client ending up at the database",
  "In configurations section, all caches have to be configured to either be Database Read/Write or User Session caches, otherwise, the solution is invalid",
  "Servers can be connected to the cache directly to access data, if the server couldn't find the data in cache, it will fetch it from the database",
  "If a Database 'Replica (Read only)' is present in components list, then there has to be a database that is configured as a 'Primary (Write)' in the components",
];
