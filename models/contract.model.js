"use strict";

var mongoose = require('mongoose');
var schema = mongoose.Schema;

var contractSchema = new schema({
    name: { type: String },
    address: { type: String },
    dateOfAccident: { type: Number },
    timeOfAccident: { type: Number },
    location: { type: String },
    images: [{ type: String, select: false }],
    descriptionOfLoss: { type: String },
    otherParty: [{ type: schema.Types.ObjectId, ref: 'Other' }],
    policyNumber: { type: String },
    plateNo: { type: String },
    issueDate: { type: String },
    termFrom: { type: String },
    termTo: { type: String },
    itemInsured: { type: String },
    linkPolicy: [{type: String}]
}, { timestamps: true });

module.exports = mongoose.model('Contract', contractSchema);

// problemRequests: [{type: schema.Types.ObjectId, ref: 'ProblemRequest'}],