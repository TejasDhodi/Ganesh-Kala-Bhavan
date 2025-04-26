require('dotenv').config({path: './Config/config.env'});

const express = require('express');
const cors = require('cors');
const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());
// routes
app.use('/api/v1/receipt', require('./Routes/generateReceipt.routes'));

app.listen(process.env.PORT, () => {
    console.log('Jay Shree Ram');
})