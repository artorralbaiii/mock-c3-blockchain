"use strict";

var mongoose = require('mongoose');
var schema = mongoose.Schema;

var accountSchema = new schema({
    address: { type: String },
    transCount: { type: Number },
    name: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Account', accountSchema);

// problemRequests: [{type: schema.Types.ObjectId, ref: 'ProblemRequest'}],