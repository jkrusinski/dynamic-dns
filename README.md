#Dynamic DNS

A simple script that utilizes Node.js to automatically update an Amazon Route53 Record Set upon a change in IP address. Perfect for small home networks that don't have access to a static IP from their ISP.

###Requirements

- Node.js &amp; NPM
- A domain name managed with Amazon's Route53
- A time-based job scheduler like Cron

###Installation

#####Step 1

Clone repository to your server.
```
git clone https://github.com/jkrusinski/dynamic-dns.git
```