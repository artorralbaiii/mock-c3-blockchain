"use strict";

const crypto = require('crypto');
const mongoose = require('mongoose');
const schema = mongoose.Schema;
const Account = require('./account.model')
const Block = require('./block.model')
const Transaction = require('./transaction.model')

const userFiles = 'user_upload/'
const fs = require('fs')
const { promisify } = require('util')
const writeFile = promisify(fs.writeFile);
const hostLink = 'http://localhost:6004/'


let contractSchema = new schema({
    name: { type: String },
    address: { type: String },
    owner: { type: String },
    block: { type: String },
    incident: {
        dateOfAccident: { type: Number },
        timeOfAccident: { type: Number },
        location: { type: String },
        images: [{ type: Object }],
        documents: [{ type: Object }],
        descriptionOfLoss: [{ type: Object }],
        auditTrail: [{ type: Object }],
        involvedParties: [{ type: String }]
    },
    policy: {
        ownerName: { type: String },
        policyNumber: { type: String },
        plateNo: { type: String },
        issueDate: { type: String },
        termFrom: { type: String },
        termTo: { type: String },
        itemInsured: { type: String },
        provider: { type: String },
        orgDocumentId: { type: String },
        status: { type: String, default: 'Active' },
        effectivityDate: { type: Date },
        linkPolicy: [{
            linkPolicyRequestor: { type: String },
            linkAddressRequestor: { type: String },
            linkPolicy: { type: String },
            linkAddress: { type: String },
            statusCode: { type: Number, default: 0 },
            status: { type: String, default: 'Awaiting Permission' },
            created: { type: Date, default: Date.now }
        }],
    }
}, { timestamps: true }, { usePushEach: true })


contractSchema.pre('save', function (next) {
    let contract = this;
    let contractHash;

    if (contract.isNew) {
        contractHash = crypto.createHmac('sha256', 'secret')
            .update('CONTRACT' + Date.now())
            .digest('hex')
        contract.address = contractHash
    } else {
        contractHash = contract.address
    }


    // START - Create Transaction

    const transactionHash = crypto.createHmac('sha256', 'secret')
        .update(contract._id + Date.now())
        .digest('hex')


    // Create Transaction
    let transactionType = (contract.isNew) ? 'Contract Creation' : 'Contract Call'
    let transaction = new Transaction({
        type: transactionType,
        address: transactionHash,
        from: contractHash
    })

    transaction.save()

    // END - Create Transaction


    // START - Create Block
    let previousHash = ''

    const blockHash = crypto.createHmac('sha256', 'secret')
        .update('BLOCK' + Date.now())
        .digest('hex')

    if (!contract.isNew) {
        previousHash = contract.block
    }


    let block = new Block({
        previousHash: previousHash,
        nonce: blockHash
    })

    contract.block = blockHash
    block.save()
    // END - Create Block

    // START - Update Account Transaction Count
    Account.findOne({ address: contract.owner }, (err, data) => {
        data.transCount += 1
        data.save()
    })
    // END - Update Account Transaction Count
    let rootPath = __dirname.replace('models', '')
    let filePath = rootPath + userFiles + contract.address + '/'

    checkDirectorySync(filePath)

    // // __dirname + 
    // if (!fs.existsSync(filePath)) {
    //     fs.mkdirSync(filePath);
    // }

    if (contract.name == 'Incident') {
        for (let index = 0; index < contract.incident.images.length; index++) {
            if (contract.incident.images[index].link == '') {
                let base64data = contract.incident.images[index].bytes.replace(/^data:.*,/, '')

                writeFile(filePath + contract.incident.images[index].name, base64data, 'base64')
                contract.incident.images[index].bytes = '';
                contract.incident.images[index].link = hostLink + 'files/' + contract.address + '/' + contract.incident.images[index].name;
            }
        }
        for (let index = 0; index < contract.incident.documents.length; index++) {

            if (contract.incident.documents[index].link == '') {
                let base64data = contract.incident.documents[index].bytes.replace(/^data:.*,/, '')

                writeFile(filePath + contract.incident.documents[index].name, base64data, 'base64')
                contract.incident.documents[index].bytes = ''
                contract.incident.documents[index].link = hostLink + 'files/' + contract.address + '/' + contract.incident.documents[index].name
            }

        }


        // for (let i = 0; i < imagesBody.length; i++) {
        //     let base64data = imagesBody[i].replace(/^data:.*,/, '')
        //     let fname = incidentModel._id + '_' + i + '.png'

        //     try {
        //         await writeFile(userFiles + fname, base64data, 'base64')
        //         imagesArray.push(fname)
        //     } catch (error) {
        //         console.log(error)
        //     }

        // }



    }

    next()

})

module.exports = mongoose.model('Contract', contractSchema)

// problemRequests: [{type: schema.Types.ObjectId, ref: 'ProblemRequest'}],

function checkDirectorySync(directory) {
    try {
        fs.statSync(directory);
    } catch (e) {
        fs.mkdirSync(directory);
    }
}