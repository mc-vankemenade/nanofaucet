const dotenv = require('dotenv');
dotenv.config();

const { v4: uuidv4 } = require('uuid'); //loads uuid module to generate transaction id
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest; //loads module for http requests
const cron = require('node-cron'); //loads module for clearing user ip's

var cachedAddresses = [];

cron.schedule('0 */6 * * *', function(){ //clears all saved addresses every 6 hours
    cachedAddresses = [];
    console.log("cleared cached addresses!")
  });

const express = require('express');
const ws = express();
const port = process.env.HOSTPORT; //loads port number from config json

ws.use(express.json());
ws.use(express.static('srv')); //serves a static page

ws.post('/withdraw', (req, res) => {
    
    checkRecaptcha(req.body.token, (status) => {
        let targetAddress = req.body.address;
        if (status == 200 && targetAddress.match(/^(nano|xrb)_[13]{1}[13456789abcdefghijkmnopqrstuwxyz]{59}$/) && !cachedAddresses.includes(targetAddress)) {
            var message = { //json message to send to pippin
                "action": "send",
                "wallet": process.env.WALLETID,
                "source": process.env.ACCOUNTADDR,
                "destination": targetAddress,
                "amount": process.env.DEPOSITAMOUNTRAW,
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
        "account": process.env.ACCOUNTADDR
      };

    queryWallet(message, (walletResponse) => {
        let message = {
            "faucetAddr": process.env.ACCOUNTADDR,
            "captchaSiteKey": process.env.CAPTCHASITEKEY,
            "donationAddr": process.env.DONATIONADDR,
            "balance": walletResponse.balance
            };

        res.status(200).send(message);
    });
});

ws.listen(port, () => {
    console.log(`webserver running on port: ${port}`); //starts the webserver.
});

function checkRecaptcha(token, callback) {
    let http = new XMLHttpRequest();
    let url = "https://www.google.com/recaptcha/api/siteverify?secret=" + process.env.CAPTCHASECRETKEY + "&response=" + token;

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
    http.open("POST", process.env.WALLETURL, true);
    http.send(JSON.stringify(message));

    http.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let json = JSON.parse(this.responseText);
            callback(json);
        }
    }
}