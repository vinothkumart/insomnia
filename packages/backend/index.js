/*  EXPRESS */
const express = require('express');
const app = express();
const axios = require('axios')
const NodeCache = require( "node-cache" );
const myCache = new NodeCache( { stdTTL: 100, checkperiod: 120 } );

app.set('view engine', 'ejs');
var access_token = "";
const clientID = 'd225454f1a6ea4b8f77d'
const clientSecret = '7c3654412cc3a396f3fbad1140eddebcd3cdbe52'

app.get('/oauth/authorize', function(req, res) {
  console.log(req.query)
  success = myCache.set( req.query.code, '');
  res.render('pages/index',{client_id: clientID,type:req.query.type,redirect_uri:req.query.redirect_uri,code:req.query.code});
});

const port = process.env.PORT || 3000;
app.listen(port , () => console.log('App listening on port ' + port));




// Import the axios library, to make HTTP requests

// This is the client ID and client secret that you obtained
// while registering on github app

//rage://oauth/github/authenticate?code=41dcd6394d7d409dc605&state=1c1cbb72-b719-42eb-b447-75d01845e07b
// Declare the callback route
app.get('/github/callback', (req, res) => {
  console.log(req.query)
  // The req.query object has the query params that were sent to this route.
  const requestToken = req.query.code
  const state = req.query.state
  
  
  axios({
    method: 'post',
    url: `https://github.com/login/oauth/access_token?client_id=${clientID}&client_secret=${clientSecret}&code=${requestToken}`,
    // Set the content type header, so that we get the response in JSON
    headers: {
         accept: 'application/json'
    }
  }).then((response) => {
    access_token = response.data.access_token
    myCache.set( state, access_token)
    res.redirect('/success?&code=' + access_token + '&state=' + state);
  })
})

app.get('/success', function(req, res) {
  console.log(req.query);
  axios({
    method: 'get',
    url: `https://api.github.com/user`,
    headers: {
      Authorization: 'token ' + req.query.code
    }
  }).then((response) => {
    res.render('pages/success',{ userData: response.data,state:req.query.state,code:req.query.code  });
  })
});
