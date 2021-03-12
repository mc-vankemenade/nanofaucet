const dotenv = require('dotenv');
dotenv.config();

const { v4: uuidv4 } = require('uuid'); //loads uuid module to generate transaction id
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest; //loads module for http requests
const cron = require('node-cron'); //loads module for clearing user ip's

var cachedAddresses = [];

cron.schedule('0 */6 * * *', function(){ //clears all saved ip's every 6 hours
    cachedAddresses = [];
    console.log("cleared cached addresses!")
  });

const express = require('express');
const ws = express();
const port = process.env.HOSTPORT; //loads port number from config json

ws.use(express.json());
ws.use(express.static('srv')); //serves a static page

ws.post('/withdraw', (req, res) => { // /withdraw endpoint for receiving post requests
    
    let response = req.body.address;
    if (response.match(/^(nano|xrb)_[13]{1}[13456789abcdefghijkmnopqrstuwxyz]{59}$/) && !cachedAddresses.includes(response)) { //tests address for valid formatting and earlier usage

        let url = process.env.WALLETURL; //loads address from config

        var message = { //json message to send to pippin
            "action": "send",
            "wallet": process.env.WALLETID,
            "source": process.env.ACCOUNTADDR,
            "destination": req.body.address,
            "amount": process.env.DEPOSITAMOUNTRAW,
            "id": uuidv4() //generates unique id for transaction
        };

        console.log(JSON.stringify(message)); //writes json message to console

        let http = new XMLHttpRequest(); //creates new http request

        http.open("POST", url, true); //makes request of type post with predefined target address
        http.setRequestHeader('Content-Type', 'application/json'); //sets message type to json
        http.send(JSON.stringify(message)); //sends message
        
        res.status(200);
        res.send();//forwards code 200 and message to client webpage

        http.onreadystatechange = function() { //fires when server gets response
            console.log(this.responseText);
            if (this.readyState == 4 && this.status == 200) { //checks if message is valid
                cachedAddresses.push(req.body.address);
                console.log(this.responseText);
            }
        }

    }else if(response.match(/^(nano|xrb)_[13]{1}[13456789abcdefghijkmnopqrstuwxyz]{59}$/) && cachedAddresses.includes(response)) {
        res.status(403).send("Forbidden");

    } else if(!response.match(/^(nano|xrb)_[13]{1}[13456789abcdefghijkmnopqrstuwxyz]{59}$/)){
        res.status(400).send("Bad Request");
    }
});

ws.get('/info', (req, res) => { // listens for get requests when client page checks for faucet balance.
    let http = new XMLHttpRequest();

    let url = process.env.WALLETURL;

    let message = { //json that asks for walles balance.
        "action": "account_balance",
        "account": process.env.ACCOUNTADDR
      };

    http.open("POST", url, true);
    http.setRequestHeader('Content-Type', 'application/json');
    http.send(JSON.stringify(message)); //sends json to wallet or node.

    http.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);

            let json = JSON.parse(this.responseText);
            
            let message = {
            "faucetAddr": process.env.ACCOUNTADDR,
            "captchaSiteKey": process.env.CAPTCHASITEKEY,
            "donationAddr": process.env.DONATIONADDR,
            "balance":json.balance
            };
            res.status(200).send(message); //forwards wallet balance to client.
        }
    }
});

ws.post( '/verify', (req, res) => {
    var captchaStatus = checkRecaptcha(req.body.token)
    console.log(captchaStatus);
    if(captchaStatus){
        res.status(200).send("OK");
    }
});

ws.listen(port, () => {
    console.log(`webserver running on port: ${port}`); //starts the webserver.
});

function checkRecaptcha(token) {
    let http = new XMLHttpRequest();

    let url = "https://www.google.com/recaptcha/api/siteverify?secret=" + process.env.CAPTCHASECRETKEY + "&response=" + token;

    http.open("POST", url, true);
    http.send();

    http.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let json = JSON.parse(this.responseText);
            if(json.success == true){
                return true;
            }else{
                return false;
            }

        }else if(this.readyState == 4 && this.status != 200){
            return false;
        }
    }
}
