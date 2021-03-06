// Custom Lib
let database = require('./controller')()

module.exports = (app, express) => {
    let api = express.Router()

    // Health Check
    api.get('/ping', database.ping)

    //  GET
    api.get('/accounts', database.getAccounts)
    api.get('/blocks', database.getBlocks)
    api.get('/contracts', database.getContracts)
    api.get('/contracts/:address', database.getContractByAddress)
    api.get('/transactions', database.getTransactions)
    api.get('/counts', database.getCounts)

    // POST
    api.post('/contracts', database.createContract) // @payload: {Contract Object to create. Refer to Schema}
    api.post('/contracts/all', database.getAllContracts) // @payload: name, address
    api.post('/contracts/incident/address', database.getIncident)
    api.post('/contracts/incidents/party', database.getIncidentsByParty)
    api.post('/contracts/approve_link', database.approveLink) // @payload:  myAddress and linkId
    api.post('/contracts/request_link', database.requestLink) // @payload: otherPolicy, otherAddress, address
    api.post('/contracts/verify_status', database.verifyStatus) // @payload: address or policy
    api.post('/contracts/linkpolicy', database.getLinkPolicy) // @payload: linkAddress and linkAddressRequestor

    return api
}