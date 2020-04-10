let returnError = (message) => {
    return { message: message, success: false, data: null }
}

let Account = require('./models/account.model')
let Block = require('./models/block.model')
let Contract = require('./models/contract.model')
let Transaction = require('./models/transaction.model')

let mongoose = require('mongoose')

module.exports = () => {

    let ctrl = {
        createContract: createContract,
        getAccounts: getAccounts,
        getBlocks: getBlocks,
        getContracts: getContracts,
        getCounts: getCounts,
        getTransactions: getTransactions,
        ping: ping,
        requestLink: requestLink
    }

    return ctrl

    function ping(req, res) {
        res.send('ok')
    }

    function getAccounts(req, res) {
        fetchData(Account, res)
    }
    function getBlocks(req, res) {
        fetchData(Block, res)
    }
    function getContracts(req, res) {
        fetchData(Contract, res)
    }
    function getTransactions(req, res) {
        fetchData(Transaction, res)
    }
    async function getCounts(req, res) {

        try {
            let accounts = await Account.count()
            let blocks = await Block.count()
            let contracts = await Contract.count()
            let transactions = await Transaction.count()

            res.json({
                message: 'Successful Fetch',
                success: true,
                data: {
                    accounts: accounts,
                    blocks: blocks,
                    contracts: contracts,
                    transactions: transactions
                }
            })
        } catch (error) {
            res.json(returnError(JSON.stringify(error)))
        }

    }

    function fetchData(Model, res) {
        Model.find({}, (err, data) => {
            if (err) {
                res.json(returnError(JSON.stringify(err)))
            } else {
                res.json({
                    message: 'Successful Fetch',
                    success: true,
                    data: data
                })
            }
        })
    }


    function createContract(req, res) {
        let contract = new Contract(req.body)
        // let contract = new Contract(req.body)
        // let id = mongoose.Types.ObjectId('5e9028cb43927d09cc2bf8b2')
        contract.save((err, data) => {
            if (err) {
                res.json(returnError(JSON.stringify(err)))
            } else {
                res.json({
                    message: 'Successful Save',
                    success: true,
                    data: data
                })
            }
        })
    }


    async function requestLink(req, res) {
        let body = req.body
        let otherAddress
        let otherPolicy = body.otherPolicy

        if (body.otherAddress) {
            otherAddress = body.otherAddress
        } else {
            let otherContract = await Contract.findOne({ 'policy.policyNumber': otherPolicy })
            otherAddress = otherContract.address
        }

        Contract.findOne({ address: body.address }, (err, data) => {
            if (err) {
                res.json(returnError(JSON.stringify(err)))
            } else {

                data.policy.linkPolicy.push({
                    linkPolicy: otherPolicy,
                    linkAddress: otherAddress
                })

                data.save((err, result) => {
                    if (err) {
                        res.json(returnError(JSON.stringify(err)))
                    } else {
                        res.json({
                            message: 'Successful Save',
                            success: true,
                            data: result
                        })
                    }
                })

            }
        })



    }


}