const express = require('express');
const axios = require('axios');
const cookieParser = require('cookie-parser')
const path = require('path')
const session = require('express-session')
const request = require('request');
const JSONbig = require('json-bigint');

const app = express()
app.use(cookieParser())
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

const port = process.env.PORT || 3000

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//setup public folder
app.use(express.static('./public'));

const appId = '6911718171963555842';
const appSecret = '2f1a5cc64d7fd1cfc9b12ee6c16327c07827636f';
const appCallBackUrl = 'https://triplewhale-tiktok.herokuapp.com/auth/callback';

const authUrl = `https://ads.tiktok.com/marketing_api/auth?app_id=${appId}&state=your_custom_params&redirect_uri=${appCallBackUrl}&rid=b6sdzry4jgw`;

app.get('/', (req, res) => {
    if (req.session.token) { 
        const data = JSON.stringify({"app_id":appId,"access_token":req.session.token,"secret":appSecret});
        const options = {
            'method': 'GET',
            'url': 'https://ads.tiktok.com/open_api/oauth2/advertiser/get/',
            'headers': {
              'Access-Token': req.session.token,
              'Content-Type': 'application/json'
            },
            body: data
          
          };
          request(options, function (error, response) {
            if (error) throw new Error(error);
            console.log(response.body);
            res.render('index', {data: JSONbig.parse(response.body).data.list, accessToken: req.session.token})
          });
    } else {
        res.redirect(authUrl);
    }
});

app.get('/reports', (req, res) => {
    if (req.session.token) {
        const advertiserId = req.query.advertiser_id;
        const startDate = req.query.start_date;
        const endDate = req.query.end_date;
        const pageSize = req.query.page_size;
        const fields = req.query.fields;
        var options = {
            'method': 'GET',
            'url': `https://ads.tiktok.com/open_api/v1.1/reports/advertiser/get/?advertiser_id=${advertiserId}&start_date=${startDate}&end_date=${endDate}&page_size=${pageSize}&fields=${fields}`,
            'headers': {
              'Access-Token': req.session.token,
              'Cookie': 'part=stable'
            }
          };
          request(options, function (error, response) {
            if (error) throw new Error(error);
            console.log(response.body);
            res.json(JSONbig.parse(response.body));
          });
          
    } else {
        res.redirect(authUrl);
    }
});

app.get('/new-reports', (req, res) => {
    if (req.session.token) {
        const advertiserId = req.query.advertiser_id;
        const startDate = req.query.start_date;
        const endDate = req.query.end_date;
        const pageSize = req.query.page_size;
        const report_type = req.query.report_type;
        const data_level = req.query.data_level;
        const dimensions = req.query.dimensions;
        const metrics = req.query.metrics;
        var options = {
            'method': 'GET',
            'url': `https://ads.tiktok.com/open_api/v1.1/reports/integrated/get/?advertiser_id=${advertiserId}&start_date=${startDate}&end_date=${endDate}&report_type=${report_type}&data_level=${data_level}&dimensions=${dimensions}&metrics=${metrics}`,
            'headers': {
              'Access-Token': req.session.token,
              'Cookie': 'part=stable'
            }
          };
          request(options, function (error, response) {
            if (error) throw new Error(error);
            console.log(response.body);
            res.json(JSONbig.parse(response.body));
          });
          
    } else {
        res.redirect(authUrl);
    }
});



app.get('/auth/callback', (req, res) => {
    const authCode = req.query.auth_code;
    const path = 'https://ads.tiktok.com/open_api/oauth2/access_token_v2/';
    var data = JSON.stringify({"app_id":appId,"auth_code":authCode,"secret":appSecret});

    var config = {
        method: 'post',
        url: path,
        headers: { 
            'Content-Type': 'application/json'
        },
        data : data
    };

    axios(config)
    .then(function (response) {
        const accessToken = response.data.data.access_token;
        req.session.token = accessToken;
        req.session.save(function(err) {
        // session saved
        if(!err) {
            //Data get lost here
            res.redirect('/');
        }
        console.log('error', err)
        
        })
    })
    .catch(function (error) {
        console.log(error);
    });
});


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
