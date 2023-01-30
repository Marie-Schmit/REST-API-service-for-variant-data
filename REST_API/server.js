//create server application
const { response } = require('express');
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

//make the app listen at port 3000
const port = 3000;

//Import router
const router = require('./router');

//Respond to data requests
app.listen(port, function(){
    console.log(`Application deployed on port ${port}`);
});

//Attach router to a path for API
app.use('/api', router);