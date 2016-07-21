var config = require('./config');

// Import and configure aws-sdk
var AWS = new require('aws-sdk');
AWS.config.update({
    accessKeyId: config.AWS.Credentials.AccessKeyId,
    secretAccessKey: config.AWS.Credentials.SecretAccessKey
});

// get Route53 Service Object
var route53 = new AWS.Route53({apiVersion: '2013-04-01'});

// setup logger
var winston = require('winston');
winston.emitErrs = true;

var logger = new winston.Logger({
    transports: [
        new winston.transports.File({
            level: 'info',
            filename: './main.log',
            handleExceptions: true,
            json: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: false
        }),
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true
        })
    ],
    exitOnError: false
});

// import promise library
var Promise = require('promise');

// import ipify
var ipify = require('ipify');

// Promise generator - gets current record set value
function getRecordSetValue() {
    return new Promise(function (fulfill, reject) {
        
        var params = {
            HostedZoneId: config.HostedZone.Id,
            StartRecordName: config.HostedZone.RecordSet.name,
            StartRecordType: 'A',
            MaxItems: '1'
        };

        route53.listResourceRecordSets(params, function (err, data) {

            if (err) reject(err.stack);
            else fulfill({
                name: 'recordSetValue',
                value: data.ResourceRecordSets[0].ResourceRecords[0].Value
            });
        });
    });
}

// Promise generator - gets current public IP
function getPublicIp() {
    return new Promise(function (fulfill, reject) {

        ipify(function (err, ip) {

            if (err) reject(err);
            else fulfill({
                name: 'publicIp',
                value: ip
            });
        });
    });
}

// Promise generator - update record set with new value
function updateRecordSetValue(value) {
    return new Promise(function (fulfill, reject) {

        var params = {
            HostedZoneId: config.HostedZone.Id,
            ChangeBatch: {
                Changes: [
                    {
                        Action: 'UPSERT',
                        ResourceRecordSet: {
                            Name: config.HostedZone.RecordSet.name,
                            Type: 'A',
                            TTL: 86400,
                            ResourceRecords: [
                                {
                                    Value: value
                                }
                            ]
                        }
                    }
                ]
            }
        };

        route53.changeResourceRecordSets(params, function (err, data) {
            if (err) reject(err);
            else fulfill(data);
        });
    })
}

// returns True if ip is in valid IPv4 format, False otherwise
function validIp(ip) {

    var components = ip.split('.');
    var isNumerical = true;
    var lenFour = components.length == 4;

    components.forEach(function (ele) {
        if (isNaN(ele)) isNumerical = false;
    });

    return isNumerical && lenFour;
}

// chain the promises
Promise

    // catch values for recordSetValue and publicIp and pass along the chain
    .all([
        
        getRecordSetValue(), 
        getPublicIp()
        
    ])

    // compare recordSetValue and publicIp and pass along the chain
    .then(

        // onFulfilled
        function (data) {

            var ips = {};

            // parse data from Promise.all() return array
            for (var n in data) {
                ips[data[n].name] = data[n].value; // data[n].name === 'recordSetValue' || 'publicIp'
            }

            // throw error if valid IPs were not received
            if (!(validIp(ips.recordSetValue) && validIp(ips.publicIp))) {
                logger.error({message: "Valid IPv4 addresses were not provided."});
                return Promise.reject();
            }

            else {
                
                var results = {
                    recordSetValue: ips.recordSetValue,
                    publicIp: ips.publicIp,
                    updateNeeded: ips.recordSetValue != ips.publicIp    // evaluates to True when update needed
                };
                
                logger.info('Update Needed: ' + results.updateNeeded);

                // pass values along the chain
                return results;
            }
            

        },

        // onRejected
        function (err) {
            logger.error(err);
        })


    // evaluate last result, updateRecordSetValue if needed, otherwise terminate chain
    .then(

        // onFulfilled
        function (data) {

            // return Promise to updateRecordSetValue if new IP address
            if (data.updateNeeded) {
                return updateRecordSetValue(data.publicIp);
            }

            else {
                logger.info('Record set current.');
                return Promise.reject();
            }

        },

        // onRejected
        function (err) {
            if (err) logger.error(err);
        })


    // Log success
    .then(

        // onFulfilled
        function () {
            logger.warn('Record set successfully changed');
        },

        // onRejected
        function (err) {
            if (err) logger.error(err);
        });
