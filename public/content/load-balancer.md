---
title: My Markdown File
---

# Load Balancers

Load balancers distribute incoming network traffic across multiple servers to ensure no single server becomes overwhelmed, improving the availability and reliability of your application.

## What

### Purpose

Distribute network traffic evenly across multiple servers to optimize resource use, maximize throughput, minimize response time, and avoid overloading any single server.

### Types

- **Hardware Load Balancers:** Physical devices that distribute network and application traffic across a number of servers.
- **Software Load Balancers:** Programs that perform load balancing using software, running on standard server hardware.
- **Cloud Load Balancers:** Load balancing services provided by cloud providers, such as AWS Elastic Load Balancing, Google Cloud Load Balancing, and Azure Load Balancer.

### Components

- **Listeners:** Rules that define how inbound connections are routed to the target groups based on protocol and port number.
- **Target Groups:** Groups of servers that receive traffic from the load balancer, based on the specified routing rules.
- **Health Checks:** Mechanisms to monitor the health of the servers in a target group, ensuring traffic is only routed to healthy servers.

## Why

### Benefits

- Improved application availability and reliability by rerouting traffic from failing servers to operational servers.
- Enhanced application security by protecting against distributed denial-of-service (DDoS) attacks.
- Scalability by distributing traffic among a pool of servers, allowing for the addition or removal of servers as needed.
- Optimized resource use by ensuring that no single server is overwhelmed with too much traffic.

## Where

### Common Use Cases

- **Web Servers:** Distributing HTTP requests across multiple web servers.
- **Database Servers:** Distributing queries across a database cluster.
- **Application Servers:** Balancing the load of application processing tasks.

## When

### When to Use

Use load balancers when you have multiple servers to distribute traffic, need high availability and fault tolerance, or want to improve performance by optimizing resource use.

## How

### Load Balancing Algorithms

- **Round Robin:** Distributes client requests in a circular order across the server pool.
- **Least Connections:** Directs traffic to the server with the fewest active connections at the time of the request.
- **IP Hash:** Routes traffic based on the IP address of the client, ensuring that requests from the same client are always directed to the same server.
- **Weighted Round Robin:** Assigns a weight to each server based on their capacity and directs more traffic to higher-capacity servers.

### Example Setup

Client → Load Balancer → Multiple Servers

### Security Considerations

- Implement SSL/TLS to encrypt traffic between clients and the load balancer.
- Use access control lists (ACLs) to restrict which IP addresses can access the load balancer.
- Enable DDoS protection features offered by your load balancer.
