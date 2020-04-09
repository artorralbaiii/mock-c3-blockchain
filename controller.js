let returnError = (message) => {
    return { message: message, success: false, data: null }
}

let Account = require('./models/account.model')
let Block = require('./models/block.model')
let Contract = require('./models/contract.model')
let Transaction = require('./models/transaction.model')

module.exports = () => {

    let ctrl = {
        getAccounts: getAccounts,
        getBlocks: getBlocks,
        getContracts: getContracts,
        getCounts: getCounts,
        getTransactions: getTransactions,
        ping: ping
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

}