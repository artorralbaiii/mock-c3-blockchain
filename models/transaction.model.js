"use strict";

var mongoose = require('mongoose');
var schema = mongoose.Schema;

var transactionSchema = new schema({
    type: { type: String },
    from: { type: String },
    address: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);

// problemRequests: [{type: schema.Types.ObjectId, ref: 'ProblemRequest'}],