export const constraints = [
  'Load balancers can only be used for servers, and can not be used for databases',
  'Make sure that components are connected starting from client ending up at the database',
]

export const solutionDesignShouldHave = [
  'At least one client',
  'At least one server',
  'At least one load balancer for servers if more than one server is present',
  'At least one primary database for writing',
  'At least one replica database for reading',
]