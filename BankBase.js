const fs = require('fs');
const path = require('path');

let Balances = {};

function LoadBalances() {
    try {
        const DataPath = fs.readFileSync(path.resolve(__dirname, 'Balances_Log.json'), 'utf8');
        Balances = JSON.parse(DataPath);
    } catch (error) {
        Balances = {};
    }
}

function SaveBalances() {
    fs.writeFileSync(path.resolve(__dirname, 'Balances_Log.json'), JSON.stringify(Balances, null, 2));
}

function SetBalance(UserId, Amount) {
    Balances[UserId] = parseFloat(Amount).toFixed(2);
    SaveBalances();
}

function AddBalance(UserId, Amount) {
    const Balance = parseFloat(Balances[UserId]) || 0;
    Balances[UserId] = (Balance + parseFloat(Amount)).toFixed(2);
    SaveBalances();
    return Balances[UserId];
}

function DeductBalance(UserId, Amount) {
    const Balance = parseFloat(Balances[UserId]) || 0;
    if (Balance >= Amount) {
        Balances[UserId] = (Balance - parseFloat(Amount)).toFixed(2);
        SaveBalances();
        return true;
    }
    return false;
}

function GetBalance(UserId) {
    return Balances[UserId];
}

LoadBalances();

module.exports = { LoadBalances, SaveBalances, SetBalance, AddBalance, DeductBalance, GetBalance };