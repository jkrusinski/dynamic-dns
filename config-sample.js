/*
    Config File Template: 

    1. Fill in the information for the record set to be managed.
    
    2. Rename this file to 'config.js'

 */

module.exports = {

    HostedZone: {
        Id: 'HOSTED_ZONE_ID',
        RecordSet: {
            name: 'RECORD_SET_NAME'
        }
    },

    AWS: {
        Credentials: {
            AccessKeyId: 'IAM_USER_ACCESS_KEY_ID',
            SecretAccessKey: 'IAM_USER_SECRET_ACCESS_KEY'
        }
    }

};