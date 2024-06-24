# Todos:
## Playground features:
[x] Pre filled components
[x] Components terminals and what they can connect to. along with grey outs
[x] Clean up AI input, to be as consice as possible
[ ] Sending data to AI, should have maximum tokens, otherwise we might get huge invoices
[ ] Stripe integration and Zenvoice
[ ] Email integration
[ ] Team/personal signup
[ ] Buy credit hints (AI hints)
[ ] auto local save
[ ] what could happen if I modified this or that? (ask AI so it helps you understand more the system design)
[ ] Train AI to do System design stuff (Or upload files and specific cases)
[ ] Tell the AI to behave like backend for stats and reports
[ ] Tell AI to behave like a System design interviewer
[ ] Add "In beta" for "hints engine", so people can understand it's still a work in progress and not 100% reliable
[ ] Join the waiting list (because we might hit the scale barrier and we don't want to pay lots of money on serverless)
[ ] Book based game (You read a bit then design your solution (or vice versa))
[ ] Move all static AI instructional content to the engine itself, so we don't consume lots of tokens (just send user solution through network, everything else that's static, then it should be inside the instructions)

## Arch:
[ ] Use Coolify instead of vercel

## In game level ideas:
[ ] Having lots of databases? And lots of servers? Use clusters instead
[ ] Your servers are under utilised? And at peak time you need more servers? Use "Pay as you go" arch (Same for replicas)
[ ] Cache replica (For high availability)
[ ] Clusters
[ ] Availability zones
[ ] 

## Explaining components:
[ ] Explain it like I'm (5, 15, 25, 40) years old
[ ] Explain in detail level (shallow, medium, deep)
[ ] Explain the What, Who, Where, When, Why

## Tracks:
[ ] Free abstract learning
[ ] System design mission (ie: design twitter)
[ ] Simulated attacks
[ ] "Given this system, here's a problem, solve it." ie. We want to reduce trafic by 10% (one possible solution could be by eleminating unneccessary data in database) - in url shortening service, no need for expires_at which takes ~11% of data bandwidth.