# Dynamic DNS

A simple script that utilizes Node.js and Cron to automatically update an Amazon Route53 Record Set upon a change in IP address. Perfect for small home networks that don't have access to a static IP from their ISP.

### Requirements

- Node.js and npm
- A domain name managed with Amazon's Route53
- A Unix-like server with Cron

### Overview
This configuration uses Cron to compare the server's current IP address to the IP address registered to the specified record set every five minutes. If the addresses do not match, the record set is updated to match the server's current address. Currently only type A record sets (IPv4) are supported.

### Usage

##### Step 1

Clone the repository and install dependencies. You may need to run as `sudo` depending on where you want to save the repository. I like to keep mine in `/srv`, which is owned by root.
```
git clone https://github.com/jkrusinski/dynamic-dns.git /srv/dynamic-dns
cd /srv/dynamic-dns && npm install
```

##### Step 2

Add your Record Set information and AWS credentials as environment variables. You must have an AWS Access Key ID and Secret Access Key in order to connect to Route53. You can set the environment variables however you like, but the easiest way is to add a file called `.env` to the root of the project directory. Following the example, this environemnt file would be placed in `/srv/dynamic-dns/.env`. Below is an example:

```shell
ACCESS_KEY_ID=abcdefg
SECRET_ACCESS_KEY=hijklmnop
HOSTED_ZONE_ID=qrstuvwxyz
RECORD_SET_NAME=www.abcs.com
```

##### Step 3

Add the script to run as a cron job every five minutes, or however frequent you would like. Following the example, the following line is what you would add to the file given by running `crontab -e`:

```
*/5 * * * * /srv/dynamic-dns/app.js
```
