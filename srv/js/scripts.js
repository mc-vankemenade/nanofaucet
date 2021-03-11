const submit = document.getElementById("submitButton");

submit.addEventListener('click', function() {
    sendNano();
})

var captchaValid = false;
var recaptchaKey;

function recaptchaCallback(token) {

    let url = window.location.href + "verify";

    let message = {"token": token};

    var http = new XMLHttpRequest();
    http.open("POST", url, true);
    http.setRequestHeader('Content-Type', 'application/json');
    http.send(JSON.stringify(message));
    console.log("captcha verifification requested!")

    http.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
                captchaValid = true;
                submit.disabled = false; 
                console.log("captcha Verified!");
        }
    }
}

function sendNano() {
    if(captchaValid) {
        var url = window.location.href + "withdraw";

        var walletAddr = document.getElementById("walletAddr").value;

        var message = {
            "address":walletAddr
        };

        console.log(JSON.stringify(message));

        var http = new XMLHttpRequest();
        http.open("POST", url, true);
        http.setRequestHeader('Content-Type', 'application/json');
        http.send(JSON.stringify(message));

        document.getElementById("response").innerHTML = "<div class='loader'></div>";

        http.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                document.getElementById("response").innerHTML = "nano sent!";
                console.log(this.responseText);
            }
            if (this.readyState == 4 && this.status == 400) {
                document.getElementById("response").innerHTML = "Wrong wallet address.";
                console.log(this.responseText);
            }
            if (this.readyState == 4 && this.status == 403) {
                document.getElementById("response").innerHTML = "nano already claimed. Come back in 6 hours.";
                console.log(this.responseText);
            }
        }
    }        
}

var onloadCallback = function(){
    var url = window.location.href + "info";

    console.log(url)
    var http = new XMLHttpRequest();
    http.open("GET", url, true);
    http.send();

    http.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var json = JSON.parse(this.responseText);
            var accountBalance = json.balance / Math.pow(10, 30);

            document.getElementById("faucetBalance").innerHTML = "Faucet balance: " + accountBalance;
            document.getElementById("Title").innerHTML = window.location.hostname;
            document.getElementById("headerText").innerHTML = window.location.hostname;
            document.getElementById("faucetAddr").innerHTML = json.faucetAddr;
            document.getElementById("donationAddr").innerHTML = json.donationAddr;

            recaptchaKey = json.captchaSiteKey;
            grecaptcha.render("captcha", {"sitekey": json.captchaSiteKey, "callback": "recaptchaCallback"});

        } else {
            document.getElementById("faucetBalance").innerHTML = "Error retrieving account balance.";
        }
    }

}