const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('./fdb-google-api.json');
const config = require('./config.json')

const getBalanceByPlayerName = async (playerName) => {
    const doc = new GoogleSpreadsheet(config.balancesheet);
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();

    const rushSheet = doc.sheetsByIndex[0];
    await rushSheet.loadCells('A1:B50');

    let balance = -1;
   
    for(let i = 0; i < rushSheet.rowCount; i++) {
        const player = rushSheet.getCell(i,0).formattedValue;
        if(player != null && (player.toLowerCase() === playerName.toLowerCase())) {
            balance = rushSheet.getCell(i,1).formattedValue;
            break;
        }
    }
    if(balance === -1) {
        return null;
    }
    else return balance;
}

const getListOfPlayers = async () => {
    const doc = new GoogleSpreadsheet(config.balancesheet);
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();

    const rosterSheet = doc.sheetsByIndex[1];
    await rosterSheet.loadCells('A1:A50');

    let listOfPlayers = [];

    for(let i = 1; i < rosterSheet.rowCount; i++) {
        const player = rosterSheet.getCell(i,0).formattedValue;
        if(player != null) {
            listOfPlayers.push(player);
        }
    }
    return listOfPlayers;
}

exports.getBalanceByPlayerName = getBalanceByPlayerName;
exports.getListOfPlayers = getListOfPlayers;