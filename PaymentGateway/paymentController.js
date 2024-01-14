const crypto = require('crypto');
const axios = require('axios');
const { salt_key, merchant_id } = require('../secret')

const newPayment = async (req, res) => {
    try {
        const { name, number, amount } = req.body.data;
        const merchantTransactionId = "MT7850590068188104";
        const data = {
            merchantId: merchant_id,
            merchantTransactionId: merchantTransactionId,
            merchantUserId: "MUID123",
            name: name,
            amount: amount * 100,
            redirectUrl: `http://localhost:5000/api/status/${merchantTransactionId}`,
            redirectMode: 'POST',
            mobileNumber: number,
            paymentInstrument: {
                type: 'PAY_PAGE'
            }
        };
        const payload = JSON.stringify(data);
        const payloadMain = Buffer.from(payload).toString('base64');
        const keyIndex = 1;
        const string = payloadMain + '/pg/v1/pay' + salt_key;
        const sha256 = crypto.createHash('sha256').update(string).digest('hex');
        const checksum = sha256 + '###' + keyIndex;

        // const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay";
        const dummy_prod_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";

        const options = {
            method: 'POST',
            url: dummy_prod_URL,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum
            },
            data: {
                request: payloadMain
            }
        };

        axios.request(options).then(function (response) {
            return res.status(200).send(response.data.data.instrumentResponse.redirectInfo.url)
        })
            .catch(function (error) {
                console.error(error);
            });

    } catch (error) {
        res.status(500).send({
            message: error.message,
            success: false
        })
    }
}

const checkStatus = async (req, res) => {
    const merchantTransactionId = res.req.body.transactionId;
    const merchantId = res.req.body.merchantId;

    const keyIndex = 1;
    const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + salt_key;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + "###" + keyIndex;

    const options = {
        method: 'GET',
        url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionId}`,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
            'X-MERCHANT-ID': `${merchantId}`
        }
    };

    // CHECK PAYMENT STATUS
    axios.request(options).then(async (response) => {
        // const history = {
        //     status: response.data.data.state,
        //     message: response.data.message,
        //     data: {
        //         merchantTransactionId: response.data.data.merchantTransactionId,
        //         transactionId: response.data.data.transactionId,
        //         amount: response.data.data.amount,
        //         paymentInstrument: {
        //             type: response.data.data.paymentInstrument.type,
        //             cardType: response.data.data.paymentInstrument.cardType,
        //             pgTransactionId: response.data.data.paymentInstrument.pgTransactionId,
        //             bankTransactionId: response.data.data.paymentInstrument.bankTransactionId,
        //             pgAuthorizationCode: response.data.data.paymentInstrument.pgAuthorizationCode,
        //             arn: response.data.data.paymentInstrument.arn,
        //             bankId: response.data.data.paymentInstrument.bankId,
        //             brn: response.data.data.paymentInstrument.brn
        //         }
        //     }
        // }
        // console.log(history);
        if (response.data.success === true) {
            const url = `https://bhaveshflix.web.app/profile`
            return res.redirect(url)
        } else {
            const url = `https://bhaveshflix.web.app/paymentfailed`
            return res.redirect(url)
        }
    })
        .catch((error) => {
            console.error(error);
        });
};

module.exports = {
    newPayment,
    checkStatus
}
