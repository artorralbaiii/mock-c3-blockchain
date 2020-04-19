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
        getAllContracts: getAllContracts,
        getContracts: getContracts,
        getContractByAddress: getContractByAddress,
        getCounts: getCounts,
        getIncidentsByParty: getIncidentsByParty,
        getIncident: getIncident,
        getLinkPolicy: getLinkPolicy,
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

        if (req.body.address) {
            Contract.findOne({ address: req.body.address }, (err, data) => {
                if (err) {
                    res.json(returnError(JSON.stringify(err)))
                } else {
                    data.name = req.body.name
                    if (req.body.name === 'Incident') {
                        data.incident = req.body.incident
                    } else {
                        data.policy = req.body.policy
                    }

                    data.save();
                    res.json({
                        message: 'Successful Save',
                        success: true,
                        data: data
                    })
                }
            })
        } else {
            let contract = new Contract(req.body)
            
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

    function getIncidentsByParty(req, res) {
        let address = req.body.address

        Contract.find({ 'incident.involvedParties': { $all: [address] } }, (err, data) => {
            if (err) {
                res.json(returnError(JSON.stringify(err)))
            } else {
                res.json({
                    message: 'Successful fetch.',
                    success: true,
                    data: data
                })
            }
        })
    }

    async function getIncident(req, res) {
        let address = req.body.address
        let involvedParties = []

        try {

            let contract = await Contract.findOne({ address: address })
            for (let index = 0; index < contract.incident.involvedParties.length; index++) {
                let policyAddress = contract.incident.involvedParties[index]
                let policy = await Contract.findOne({ address: policyAddress })
                involvedParties.push(policy.policy)
            }



            res.json({
                message: 'Successful fetch.',
                success: true,
                data: { contract: contract, involvedParties: involvedParties }
            })
        } catch (error) {
            res.json(returnError(JSON.stringify(error)))
        }

    }


    function getLinkPolicy(req, res) {
        let linkAddressRequestor = req.body.linkAddressRequestor

        Contract.find({ 'policy.linkPolicy.statusCode': 1, 'policy.linkPolicy.linkAddressRequestor': linkAddressRequestor })
            .select('policy.linkPolicy')
            .exec((err, data) => {
                if (err) {
                    res.json(returnError(JSON.stringify(err)))
                } else {
                    res.json({
                        message: 'Successful fetch.',
                        success: true,
                        data: data
                    })
                }
            })
    }

    async function getAllContracts(req, res) {
        let contractName = req.body.name
        let account = req.body.address
        let policyObjects = []
        let incidentObjects = []

        Contract.find({ name: 'Policy', owner: account }, (err, data) => {
            if (err) {
                res.json(returnError(JSON.stringify(err)))
            } else {

                if (contractName === 'Policy') {
                    res.json({
                        message: 'Successful fetch.',
                        success: true,
                        data: data
                    })
                } else {
                    let policyAddresses = []

                    for (let index = 0; index < data.length; index++) {
                        policyAddresses.push(data[index].address)

                        policyObjects.push({
                            orgDocumentId: data[index].policy.orgDocumentId,
                            policyAddress: data[index].address
                        })
                    }

                    Contract.find({ name: contractName, 'incident.involvedParties': { $all: policyAddresses } }, (err, incidentData) => {
                        if (err) {
                            res.json(returnError(JSON.stringify(err)))
                        } else {

                            for (let index = 0; index < incidentData.length; index++) {

                                let policyData = {}

                                for (let indexY = 0; indexY < policyObjects.length; indexY++) {
                                    let dataIndex = incidentData[index].incident.involvedParties.indexOf(policyObjects[indexY].policyAddress)
                                    if (dataIndex != -1) {
                                        policyData = policyObjects[indexY]
                                        break
                                    }


                                }

                                incidentObjects.push({
                                    orgDocumentId: policyData.orgDocumentId,
                                    policyAddress: policyData.policyAddress,
                                    incidentAddress: incidentData[index].address,
                                    dateOfAccident: incidentData[index].incident.dateOfAccident,
                                    timeOfAccident: incidentData[index].incident.timeOfAccident,
                                    location: incidentData[index].incident.location
                                })

                            }

                            res.json({
                                message: 'Successful fetch.',
                                success: true,
                                data: incidentObjects
                            })

                        }


                    })

                }

            }
        })


    }

}