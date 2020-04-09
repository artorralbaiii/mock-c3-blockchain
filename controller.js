let returnError = (message) => {
    return { message: message, success: false, data: null }
}

module.exports = () => {

    let ctrl = {
        ping: ping
    }

    return ctrl

    function ping(req, res) {
        res.send('ok')
    }
}