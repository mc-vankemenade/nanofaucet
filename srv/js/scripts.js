const submit = document.getElementById("submitButton");
submit.addEventListener('click', function() {
    sendNano();
})

var recaptchaToken;
function recaptchaCallback(token) {
    recaptchaToken = token;
    submit.disabled = false;
}

function sendNano() {
    var url = window.location.href + "withdraw";

    var walletAddr = document.getElementById("walletAddr").value;

    var message = {
        "address": walletAddr,
        "token": recaptchaToken
    };

    console.log(JSON.stringify(message));

    var http = new XMLHttpRequest();
    http.open("POST", url, true);
    http.setRequestHeader('Content-Type', 'application/json');
    http.send(JSON.stringify(message));

    document.getElementById("response").innerHTML = "<div class='loader'></div>";

    http.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("response").innerHTML = "Request made! Depending on the host it might take some time to generate the <a href='https://nanolooker.com/account/nano_3crd9uoyy8ewo9y7h71i7d7fenyi54i793png4r5zm94udmxpbj9pzmqapr6'.";
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

            document.getElementById("faucetBalance").innerHTML = "Faucet balance: " + accountBalance + " NANO";
            document.getElementById("headerText").innerHTML = window.location.hostname;
            document.getElementById("faucetAddr").innerHTML = json.faucetAddr;
            document.getElementById("faucetAddrImg").setAttribute("src", "https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=" + json.faucetAddr + "&choe=UTF-8");
            document.getElementById("donationAddr").innerHTML = json.donationAddr;
            document.getElementById("donationAddrImg").setAttribute("src", "https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=" + json.donationAddr + "&choe=UTF-8");

            grecaptcha.render("captcha", {"sitekey": json.captchaSiteKey, "callback": "recaptchaCallback"});

        } else {
            document.getElementById("faucetBalance").innerHTML = "Error retrieving account balance.";
        }
    }

}