const express = require('express')
const app = express()
const port = 8080
const path = require('path') 
require('dotenv').config();


const URI = process.env.URI;
const DBName = process.env.DBNAME;
 

const { MongoClient } = require('mongodb');
const uri = URI // Replace with your MongoDB connection string
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const database = client.db(DBName);

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


//Helper Functions
async function getAllUsers() {
  let result
  try {
    const collection = database.collection('Users');

     result = await collection.find({}).toArray();
     return result;
    // console.log('All documents in the "users" collection:');
    // console.log(result);
  } catch (error) {
    console.error('Error retrieving documents:', error);
  } 
}

async function getAllCarts() {
  let result
  try {
    const collection = database.collection('Carts');

     result = await collection.find({}).toArray();
     return result;
    // console.log('All documents in the "users" collection:');
    // console.log(result);
  } catch (error) {
    console.error('Error retrieving documents:', error);
  } 
}



async function deleteCart(cartId) {
  const collectionName = 'Carts';
  try {
    const collection = database.collection(collectionName);
    const result = await collection.deleteOne({ cart_id: parseInt(cartId) });

    if (result.deletedCount === 1) {
      return { success: true, message: 'Cart deleted successfully' };
    } else {
      return { success: false, message: 'Cart not found' };
    }
  } catch (error) {
    console.error('Error deleting cart:', error);
    throw error;
  } 
}








//GET Requests 

app.get('/', (req, res) => {
  res.send('Hello from the MTA Surfers!')
})

app.get('/api/cart', async (req, res) => {
  result=await getAllCarts()
  //console.log('All documents in the "users" collection:');
  //console.log(result);
  res.send(result);
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


app.post('/api/addUser', async (req, res) => {
  try {

    const collection = database.collection('Users');

    const userData = req.body; // Assuming request body contains user data

    const result = await collection.insertOne(userData);

    res.status(201).json({ message: 'User inserted successfully', insertedId: result.insertedId });
  } catch (error) {
    console.error('Error inserting user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});









//Delete Functions

app.delete('/api/cart/:cartId', async (req, res) => {
  const cartId = req.params.cartId;

  try {
    const deleteResult = await deleteCart(cartId);
    res.json(deleteResult);
  } catch (error) {
    console.error('Error in delete route:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});








//PUT Operations 
app.put('/api/user/:uni', async (req, res) => {
  const collection = database.collection('Users');
  try {
    const { firstName, lastName } = req.body;
    const uni = req.params.uni;

    const updatedUser = await collection.findOneAndUpdate(
      { uni: uni }, // assuming 'UNI' is the field name in your Users collection
      { $set: { firstName, lastName } },
      { new: true } // `new: true` option returns the updated document
    );

    if (updatedUser) {
      res.json({ success: true, updatedUser });
      console.log("User was updated")
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Listening on ${port}`)
})