



// ======================= API GET POST ทั้งหมด ========================= //

const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function GET_BALANCE() {
    try {
        const formData = new URLSearchParams();
        formData.append('keyapi', 'keyapi');

        const response = await axios.post('https://byshop.me/api/money', formData);

        console.log('✅ BALANCE DATA:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('❌ ERROR | GET BALANCE', error?.response?.data || error.message);
    }
}


/*
✅ BALANCE DATA: {     
  "status": "success",
  "money": "130.00"     
}
*/

async function GET_PRODUCT() {
    try {
        const response = await axios.get('https://byshop.me/api/product', {
            headers: {
                'content-type': 'application/json'
            }
        });

        const premiumData = response.data;

        const premiumPath = path.join(__dirname, './Utils/app_premium.json');
        const rateDataPath = path.join(__dirname, 'app_ratedata.json');
        fs.writeFileSync(premiumPath, JSON.stringify(premiumData, null, 2), 'utf8');

        let rateData = [];
        if (fs.existsSync(rateDataPath)) {
            try {
                const rawRate = fs.readFileSync(rateDataPath, 'utf8');
                rateData = JSON.parse(rawRate);
            } catch (e) {
                rateData = [];
            }
        }

        const rateDataMap = new Map(rateData.map(item => [item.id, item]));
        for (const item of premiumData) {
            if (rateDataMap.has(item.id)) {
                const existingItem = rateDataMap.get(item.id);
                for (const key of Object.keys(item)) {
                    if (["price_me", "emoji"].includes(key)) continue;
                    existingItem[key] = item[key];
                }
            } else {
                const priceFloat = parseFloat(item.price);
                const priceMe = (priceFloat * 2).toFixed(2);
                rateData.push({
                    ...item,
                    price_me: priceMe,
                    emoji: ""
                });
            }
        }
        fs.writeFileSync(rateDataPath, JSON.stringify(rateData, null, 2), 'utf8');
        console.log('✅ PRODUCT DATA UPDATED SUCCESSFULLY');
    } catch (error) {
        console.error('❌ ERROR| GET PRODUCT', error);
    }
}



async function BUY_PRODUCT() {
    try {
        const formData = new URLSearchParams();
        formData.append('keyapi', 'keyapi');
        formData.append('id', '100');
        formData.append('username_customer', '148612');

        const response = await axios.post('	https://byshop.me/api/buy',
            formData,
            {
                headers: { 'content-type': 'application/x-www-form-urlencoded' }
            });


        console.log('PRODUCT DATA', JSON.stringify(response.data));
    } catch (error) {
        console.error('ERROR| BUY PRODUCT', JSON.stringify(error));
    }
}

/*
PRODUCT DATA {
  "status": "success",
  "message": "สั่งซื้อสำเร็จ",
  "orderid": "148612",
  "img": "https://byshop.me/buy/img/img_app/te.png",
  "name": "TEST API",
  "info": "email : 485537<br>password : ",
  "price": "0.00",
  "time": "2025-09-02 11:34:05"
}
*/

async function GET_HISTORY() {
    try {
        const formData = new URLSearchParams();
        formData.append('keyapi', 'keyapi');
        formData.append('orderid', '148870');

        const response = await axios.post(
            'https://byshop.me/api/history',
            formData,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        console.log('✅ HISTORY DATA:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('❌ ERROR | GET HISTORY', error?.response?.data || error.message);
    }
}


/*
✅ HISTORY DATA: [
  {
    "id": 148612,
    "img": "https://byshop.me/buy/img/img_app/TE.png",
    "name": "TEST API",
    "price": "0.00",
    "email": "485537",
    "password": null,
    "username": "ChiiStore",
    "username_customer": "004451",
    "report": "",
    "status_fix": 0,
    "time": "2025-09-02 11:34:05"
  }
]

*/