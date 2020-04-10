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
        approveLink: approveLink,
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
        let otherContract
        let now = new Date()

        if (body.otherAddress) {
            otherAddress = body.otherAddress

            try {
                otherContract = await Contract.findOne({ address: otherAddress, 'policy.effectivityDate': { $gte: new Date() } })
            } catch (error) {
                res.json(returnError(JSON.stringify(error)))
                return;
            }

        } else {

            try {
                otherContract = await Contract.findOne({ 'policy.policyNumber': otherPolicy, 'policy.effectivityDate': { $gte: new Date() } })
            } catch (error) {
                res.json(returnError(JSON.stringify(error)))
                return;
            }

        }

        // , effectivityDate: { $gte: new Date("2013-10-01T00:00:00.000Z") }

        if (!otherContract) {
            res.json({
                message: 'The policy is either In-active or not exists. Please check with the insurance provider.',
                success: false,
                data: null
            })

            return;
        }

        otherAddress = otherContract.address

        Contract.findOne({ address: body.address }, (err, data) => {
            let addressExist = false

            if (err) {
                res.json(returnError(JSON.stringify(err)))
            } else {

                for (i = 0; i <= data.policy.linkPolicy.length; i++) {
                    if (data.policy.linkPolicy[i].linkAddress === otherAddress) {
                        addressExist = true
                        break
                    }
                }

                if (addressExist) {
                    res.json({
                        message: 'Link record already exists.',
                        success: false,
                        data: null
                    })
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


            }
        })
    }

    function approveLink(req, res) {
        let address = req.body.linkAddress
        let myAddress = req.body.myAddress

        Contract.findOne({ address: address }, (err, data) => {
            if (err) {
                res.json(returnError(JSON.stringify(err)))
            } else {

                let linkExist = false;

                for (let index = 0; index < data.policy.linkPolicy.length; index++) {
                    if (data.policy.linkPolicy[index].linkAddress === myAddress) {
                        data.policy.linkPolicy[index].statusCode = 1
                        data.policy.linkPolicy[index].status = 'Permitted'
                        linkExist = true
                        break
                    }
                }

                if (linkExist) {
                    data.save()
                    res.json({
                        message: 'Link successfuly approved.',
                        success: true,
                        data: data
                    })
                } else {
                    res.json({
                        message: 'Link record not found.',
                        success: false,
                        data: null
                    })
                }

            }
        })
    }



}