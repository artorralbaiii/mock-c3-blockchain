"use strict";

var mongoose = require('mongoose');
var schema = mongoose.Schema;

var blockSchema = new schema({
    previousHash: { type: String },
    timeStamp: { type: String },
    nonce: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Block', blockSchema);

// problemRequests: [{type: schema.Types.ObjectId, ref: 'ProblemRequest'}],