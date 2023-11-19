const express = require('express')
const app = express()
const port = 8080
const path = require('path') 
require('dotenv').config();


const URI = process.env.URI;
 

const { MongoClient } = require('mongodb');
const uri = URI // Replace with your MongoDB connection string
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
  }
}

connectToDatabase();

app.use(express.json());

async function getAllUsers() {
  let result
  try {
    const database = client.db('MTASurfers'); // Replace with your database name
    const collection = database.collection('Users');

     result = await collection.find({}).toArray();
     return result;
    // console.log('All documents in the "users" collection:');
    // console.log(result);
  } catch (error) {
    console.error('Error retrieving documents:', error);
  } 
}






//GET Requests 

app.get('/', (req, res) => {
  res.send('Hello from the MTA Surfers!')
})

app.get('/api/cart', (req, res) => {
  res.send('Cart is here :)')
})

app.get('/api/join', (req, res) => {
  res.send('All the cart info is here :)')
})

app.get('/api/users', async (req, res) => {
  result=await getAllUsers()
  //console.log('All documents in the "users" collection:');
  //console.log(result);
  res.send(result);
})

app.get('/api/cart/:cartno', function(req, res) {
  console.log("Cart received is : " + req.params.cartno);
  res.send("Cart is  " + req.params.cartno);
});

//Post Requests
app.post('/api/join/:cartno', (req, res) => {
  const dataReceived = req.body;
  // Do something with the data (in this case, just send it back)
  res.json(dataReceived);
  console.log(dataReceived);
});



app.listen(port, () => {
  console.log(`Listening on ${port}`)
})