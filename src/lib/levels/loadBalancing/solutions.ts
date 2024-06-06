export const constraints = [
  'Load balancers can only be used for servers, and can not be used for databases',
  'Make sure that components are connected starting from client ending up at the database',
]

export const solutionDesignShouldHave = [
  'At least 1 client',
  'At least 2 server',
  'At least 1 load balancer',
]