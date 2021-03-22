const yaml = require('js-yaml');
const fs   = require('fs');

var config;
try {
  config = yaml.load(fs.readFileSync('./config.yaml', 'utf8'));
  console.log(config);
} catch (e) {
  console.log(e);
}

const { v4: uuidv4 } = require('uuid'); //loads uuid module to generate transaction id
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest; //loads module for http requests
const cron = require('node-cron'); //loads module for clearing user ip's

var cachedAddresses = [];

cron.schedule(config.withdrawTimer, function(){ //clears all saved ip's every 6 hours
    cachedAddresses = [];
    console.log("cleared cached addresses!")
  });

const express = require('express');
const ws = express();
const port = config.hostPort; //loads port number from config json

ws.use(express.json());
ws.use(express.static('srv')); //serves a static page

ws.post('/withdraw', (req, res) => {
    
    checkRecaptcha(req.body.token, (status) => {
        let targetAddress = req.body.address;
        if (status == 200 && targetAddress.match(/^(nano|xrb)_[13]{1}[13456789abcdefghijkmnopqrstuwxyz]{59}$/) && !cachedAddresses.includes(targetAddress)) {
            var message = { //json message to send to pippin
                "action": "send",
                "wallet": config.walletId,
                "source": config.walletAddr,
                "destination": req.body.address,
                "amount": config.depositAmountRaw,
                "id": uuidv4() //generates unique id for transaction
            };

            queryWallet(message, (walletResponse) => {
                console.log(walletResponse);
            });

            cachedAddresses.push(targetAddress);
            console.log("cached address: " + cachedAddresses);
            res.status(200).send();
        }
        else if(status == 200 && cachedAddresses.includes(targetAddress)) {
            res.status(403).send("Forbidden");
        }
        else if(!targetAddress.match(/^(nano|xrb)_[13]{1}[13456789abcdefghijkmnopqrstuwxyz]{59}$/)){
            res.status(400).send("Bad Request");
        }
    });
});

ws.get('/info', (req, res) => { 
    let message = {
        "action": "account_balance",
        "account": config.accountAddr
      };

    queryWallet(message, (walletResponse) => {
        let message = {
            "faucetAddr": config.walletAddr,
            "captchaSiteKey": config.captchaSiteKey,
            "donationAddr": config.donationAddr,
            "balance": walletResponse.balance
            };

        res.status(200).send(message);
    });
});

ws.listen(port, () => {
    console.log(`webserver running on port: ${port}`); //starts the webserver.
});

function checkRecaptcha(token, callback) {
    if (config.useCaptcha == false){
        callback(200);
    }
    let http = new XMLHttpRequest();
    let url = "https://www.google.com/recaptcha/api/siteverify?secret=" + config.captchaSecretkey + "&response=" + token;

    http.open("POST", url, true);
    http.send();

    http.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let json = JSON.parse(this.responseText);
            if(json.success == true) {
                callback(200);
            }
            else if(json.success == false) {
                callback(403);
            }
        }
    }
}

function queryWallet(message, callback) {
    console.log("Sending query to wallet: " + JSON.stringify(message));
    let http = new XMLHttpRequest();
    http.open("POST", config.walletUrl, true);
    http.send(JSON.stringify(message));

    http.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let json = JSON.parse(this.responseText);
            callback(json);
        }
    }
}