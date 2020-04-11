"use strict";

const crypto = require('crypto');
const mongoose = require('mongoose');
const schema = mongoose.Schema;
const Account = require('./account.model')
const Block = require('./block.model')
const Transaction = require('./transaction.model')


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


// Encrypt Password
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

    if (contract.name == 'Incident') {
        for (let index = 0; index < contract.incident.images.length; index++) {
            contract.incident.images[index].bytes = '';
            contract.incident.images[index].link = 'link_added';
        }
        for (let index = 0; index < contract.incident.documents.length; index++) {
            contract.incident.documents[index].bytes = '';
            contract.incident.documents[index].link = 'link_added';
        }
    }

    next()

})

module.exports = mongoose.model('Contract', contractSchema)

// problemRequests: [{type: schema.Types.ObjectId, ref: 'ProblemRequest'}],