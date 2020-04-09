const DATA_ACCOUNTS = 'ACCOUNTS'
const DATA_BLOCKS = 'BLOCKS'
const DATA_CONTRACTS = 'CONTRACTS'
const DATA_TRANSACTIONS = 'TRANSACTIONS'

const HEADER_ACCOUNTS = `<th scope="col">Address</th><th scope="col">Transactions</th><th scope="col">Timestamp</th>`
const HEADER_BLOCKS = `<th scope="col">Nonce</th><th scope="col">Prev Hash</th><th scope="col">Timestamp</th>`
const HEADER_CONTRACTS = `<th scope="col">Address</th><th scope="col">Name</th><th scope="col">Data</th>`
const HEADER_TRANSACTIONS = `<th scope="col">Address</th><th scope="col">From</th><th scope="col">Type</th>`

const DEFAULT_LEGEND = 'Accounts'

$(document).ready(function () {

    // Initialization

    $('#table-legend').html(DEFAULT_LEGEND)

    fetchTable(DATA_ACCOUNTS)
    getCounts()

})

let fetchTable = (type) => {
    let url;
    let header;
    let rows = '';

    $('#table-legend').html(type)

    if (type === DATA_BLOCKS) {
        url = 'api/blocks'
        header = HEADER_BLOCKS
    } else if (type === DATA_CONTRACTS) {
        url = 'api/contracts'
        header = HEADER_CONTRACTS
    } else if (type === DATA_TRANSACTIONS) {
        url = 'api/transactions'
        header = HEADER_TRANSACTIONS
    } else {
        url = 'api/accounts'
        header = HEADER_ACCOUNTS
    }

    $('#data-head').html(header)

    $.get(url, function (data) {
        if (data.success) {
            if (Array.isArray(data.data)) {
                rows = populateRows(type, data.data)
            }
            $('#data-body').html(rows)
        }
    });
}

let getCounts = () => {
    $.get('api/counts', function (data) {
        if (data.success) {
            $('#count-accounts').html(data.data.accounts)
            $('#count-blocks').html(data.data.blocks)
            $('#count-contracts').html(data.data.contracts)
            $('#count-transactions').html(data.data.transactions)
        }
    });
}

let populateRows = (type, data) => {
    let rows = '';

    if (type === DATA_BLOCKS) {
        data.forEach(element => {
            rows += '<tr>'
            rows += '<td>' + element.nonce + '</td>'
            rows += '<td>' + element.previousHash + '</td>'
            rows += '<td>' + element.updatedAt + '</td>'
            rows += '</tr>'

        })
    } else if (type === DATA_CONTRACTS) {
        data.forEach(element => {
            rows += '<tr>'
            rows += '<td>' + element.address + '</td>'
            rows += '<td>' + element.name + '</td>'
            rows += '<td><a href="http://"><i class="fa fa-file-o" aria-hidden="true"></i></a></td>'
            rows += '</tr>'

        })
    } else if (type === DATA_TRANSACTIONS) {
        data.forEach(element => {
            rows += '<tr>'
            rows += '<td>' + element.address + '</td>'
            rows += '<td>' + element.from + '</td>'
            rows += '<td>' + '<span class="badge badge-warning">' + element.type + '</span></td>'
            rows += '</tr>'

        })
    } else {
        data.forEach(element => {
            rows += '<tr>'
            rows += '<td>' + element.address + '</td>'
            rows += '<td>' + element.transCount + '</td>'
            rows += '<td>' + element.updatedAt + '</td>'
            rows += '</tr>'

        })
    }

    return rows
} 