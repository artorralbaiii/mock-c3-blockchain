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
        getContractByAddress: getContractByAddress,
        getCounts: getCounts,
        getTransactions: getTransactions,
        ping: ping,
        requestLink: requestLink,
        verifyStatus: verifyStatus
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

    function getContractByAddress(req, res) {
        Contract.findOne({ address: req.params.address }, (err, data) => {
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
        let policyRequestor = body.policyRequestor
        let addressRequestor = body.addressRequestor
        let otherContract
        let now = new Date()
        // let initiatorAddress = body.address

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

        Contract.findOne({ address: otherAddress }, (err, data) => {
            let addressExist = false

            if (err) {
                res.json(returnError(JSON.stringify(err)))
            } else {

                for (i = 0; i < data.policy.linkPolicy.length; i++) {
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
                        linkPolicyRequestor: policyRequestor,
                        linkAddress: otherAddress,
                        linkAddressRequestor: addressRequestor
                    })

                    data.save((err, result) => {
                        if (err) {
                            res.json(returnError(JSON.stringify(err)))
                        } else {
                            res.json({
                                message: 'Link request has been sent.',
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
        let myAddress = req.body.myAddress
        // let linkId = mongoose.Types.ObjectId(req.body.linkId)
        let linkId = req.body.linkId
        let returnData = {}

        Contract.findOne({ address: myAddress }, (err, data) => {
            if (err) {
                res.json(returnError(JSON.stringify(err)))
            } else {

                let linkExist = false;

                for (let index = 0; index < data.policy.linkPolicy.length; index++) {
                    if (data.policy.linkPolicy[index]._id.toString() == linkId) {
                        data.policy.linkPolicy[index].statusCode = 1
                        data.policy.linkPolicy[index].status = 'Permitted'
                        linkExist = true
                        returnData = data.policy.linkPolicy[index]
                        break
                    }
                }

                if (linkExist) {
                    data.save()
                    res.json({
                        message: 'Link successfuly approved.',
                        success: true,
                        data: returnData
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


    function verifyStatus(req, res) {
        let address = req.body.address
        let policy = req.body.policy
        let searchOption = {}

        if (address) {
            searchOption = { address: address, 'policy.effectivityDate': { $gte: new Date() } }
        } else {
            searchOption = { 'policy.policyNumber': policy, 'policy.effectivityDate': { $gte: new Date() } }
        }

        Contract.findOne(searchOption).
            select('address policy').exec((err, data) => {
                if (err) {
                    res.json(returnError(JSON.stringify(err)))
                } else {

                    if (data) {
                        res.json({
                            message: 'Verified',
                            success: true,
                            data: data
                        })
                    } else {
                        res.json({
                            message: 'The policy is either expired or doesn\'t exists. Please check with the policy owner or provider.',
                            success: true,
                            data: data
                        })
                    }

                }
            })

    }



}