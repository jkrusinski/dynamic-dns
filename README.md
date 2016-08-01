#Dynamic DNS

A simple script that utilizes Node.js and Cron to automatically update an Amazon Route53 Record Set upon a change in IP address. Perfect for small home networks that don't have access to a static IP from their ISP.

###Requirements

- Node.js &amp; NPM
- A domain name managed with Amazon's Route53
- A Unix-like server with Cron

###Usage

#####Step 1

Clone the repository to your server and change the current working directory.
```
git clone https://github.com/jkrusinski/dynamic-dns.git
cd dynamic-dns
```

#####Step 2
Install dependencies with NPM.
```
npm install
```

#####Step 3

Make `exe.sh` an executable.
```
chmod +x exe.sh
```

#####Step 4
Add your Record Set information and AWS credentials to the `config-sample.js`. You must have an AWS Access Key ID and Secret Access Key in order to connect to Route53. For more information, check out [Amazon's documentation]. Once all the information is provided, rename `config-sample.js` to `config.js`.

#####Step 5

Add the script to your Cron jobs. To edit the crontab file, type `crontab -e`. Add the following line to the end of the file.

```
*/5 * * * * PATH=/your/env/path/variable /path/to/dynamic-dns/exe.sh
```

In order for the shell script to execute, the `PATH` variable must be included in the crontab. To get the value of your PATH variable, type `echo $PATH`. Make sure this output is pasted in place of `/your/env/path/variable`. Also make sure that the last argument matches the path to `exe.sh`.



[Amazon's documentation]: https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSGettingStartedGuide/AWSCredentials.html