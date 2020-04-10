// Custom Lib
let database = require('./controller')()

module.exports = (app, express) => {
    let api = express.Router()

    // Health Check
    api.get('/ping', database.ping)

    //  GET
    api.get('/accounts', database.getAccounts)
    api.get('/blocks', database.getBlocks)
    api.get('/contracts/:address', database.getContractByAddress)
    api.get('/contracts', database.getContracts)
    api.get('/transactions', database.getTransactions)
    api.get('/counts', database.getCounts)

    // POST
    api.post('/approve_link', database.approveLink)
    api.post('/contracts', database.createContract)
    api.post('/request_link', database.requestLink)

    return api
}