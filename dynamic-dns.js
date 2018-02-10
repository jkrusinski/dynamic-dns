#!/usr/bin/env node
const AWS = require('aws-sdk');
const ipify = require('ipify');

require('dotenv').config();

const {
  ACCESS_KEY_ID,
  SECRET_ACCESS_KEY,
  HOSTED_ZONE_ID,
  RECORD_SET_NAME
} = process.env;

AWS.config.update({
  accessKeyId: ACCESS_KEY_ID,
  secretAccessKey: SECRET_ACCESS_KEY,
});

const route53 = new AWS.Route53({ apiVersion: '2013-04-01' });

const getRecordSetValue = async () => {
  const params = {
      HostedZoneId: HOSTED_ZONE_ID,
      StartRecordName: RECORD_SET_NAME,
      StartRecordType: 'A',
      MaxItems: '1',
  };
  return route53
    .listResourceRecordSets(params)
    .promise()
    .then(data => data.ResourceRecordSets[0].ResourceRecords[0].Value);
};

const updateRecordSetValue = (value) => {
  const params = {
    HostedZoneId: HOSTED_ZONE_ID,
    ChangeBatch: {
      Changes: [{
        Action: 'UPSERT',
        ResourceRecordSet: {
            Name: RECORD_SET_NAME,
            Type: 'A',
            TTL: 86400,
            ResourceRecords: [{ Value: value }],
        },
      }],
    },
  };
  return route53.changeResourceRecordSets(params).promise();
}

const isValidIp = (ip) => {
  const components = ip.split('.');
  return components.every(n => !isNaN(n)) || components.length === 4;
}

Promise
  .all([getRecordSetValue(), ipify()])
  .then(([recordSetValue, ip]) => {
    if (!isValidIp(ip)) {
      throw new Error('Not a valid IPv4 address.');
    }

    if (recordSetValue !== ip) {
      return updateRecordSetValue(ip);
    }
  })
  .catch(err => {
    console.error(err);
  });
