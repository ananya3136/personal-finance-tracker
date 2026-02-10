const express =  require("express");

const app = express();
//middleware to read JSON from requests
app.use(express.json());

//test route
app.get("/", (req, res) =>{
    res.send("Personal Finance Tracker API is running");
});

//start the server 
const PORT=  5000;
app.listen(PORT, ()=> {
    console.log('Server running on port ${PORT}');
});