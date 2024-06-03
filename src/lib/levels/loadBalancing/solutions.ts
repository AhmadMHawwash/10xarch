export const solutions = [
  [
    "Client-1 -> Load Balancer-1",
    "Load Balancer-1 -> Server-1",
    "Load Balancer-1 -> Server-2",
    "Server-2 -> SQL Database-1",
    "Server-1 -> SQL Database-1",
  ],
];

export const notes = [
  "Any extra components will be superflous, and not needed to solve the challenge.",
];

export const constraints = [
  'Load balancers can only be used for servers, and can not be used for databases',
  'Make sure that components are connected starting from client ending up at the database',
]
