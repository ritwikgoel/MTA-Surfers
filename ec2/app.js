const express = require('express')
const app = express()
const bcrypt = require('bcrypt');
const port = 8080
const path = require('path') 
require('dotenv').config();
const bodyParser = require('body-parser');
app.use(express.static('public'));
const { ObjectId } = require('mongodb');
const axios = require('axios');
const graphql = require('graphql');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const cookieParser = require('cookie-parser');
const AWS = require('aws-sdk');
app.use(session({ secret: 'Do this later', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
const cors = require('cors');
app.use(cors());
app.use(bodyParser.json());

const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

const { 
  GraphQLObjectType, GraphQLString, 
  GraphQLID, GraphQLInt,GraphQLSchema, 
  GraphQLList,GraphQLNonNull 
} = graphql;

const schema = buildSchema(`
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    uni: String!
  }

  type Query {
    getUser(id: ID!): User
    getAllUsers: [User]
  }
  

  type Mutation {
    addUser(firstName: String!, lastName: String!, email: String!): User
  }
`);




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


//AWS Lambda stuff
//Do this 
// Configure AWS SDK with your credentials

const accessKeyId = process.env.ACCESSKEYID;
const secretAccessKey = process.env.SECRETACCESSKEY;
const TopicArn = process.env.TOPICARN;



AWS.config.update({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  region: 'us-east-1'
});

// Create an SNS object
const sns = new AWS.SNS();

// Publish a message to the SNS topic
sns.publish({
  TopicArn: TopicArn,
  Message: 'Your message payload',
}, (err, data) => {
  if (err) {
    console.error('Error publishing to SNS:', err);
  } else {
    console.log('Message published to SNS:', data);
  }
});


// this is for grap[h qwl 

const root = {
  getAllUsers: async () => {
    try {
      const usersCollection = database.collection('Users');
      const users = await usersCollection.find({}).toArray();
      console.log('Users from the database:', users);
      // this is wokring 
      //Figure out after this
      const response = {
        getAllUsers: users,
      };

      console.log('GraphQL response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching all users from the database:', error);
      throw error;
    }
  },
};



app.use('/graphql', (req, res, next) => {
  console.log('Received GraphQL request:', req.body); // Log the request body
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })(req, res, next);
});




//Google Auth
passport.use(new GoogleStrategy({
  clientID: process.env.CLIENTID,
  clientSecret: process.env.CLIENTSECRET,
  callbackURL: 'http://localhost:8080/auth/google/callback'
},
async (accessToken, refreshToken, profile, cb) => {
  try {
    // Check if user already exists in the database
    usersCollection = database.collection("Users");
    let user = await usersCollection.findOne({ googleId: profile.id });

    if (!user) {
      const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;

      // If user doesn't exist, create a new one
      console.log("PROFILE IS :::::::  ",profile)
      const newUser = {
        googleId: profile.id,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        email: email,
        // Add any additional fields you require
      };

      const result = await usersCollection.insertOne(newUser);
      // const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      // res.cookie('token', token, { httpOnly: true, secure: true, maxAge: 3600000 }); // 1 hour
      console.log("Result::::::: "+result.insertedId)
      //user = result.ops[0]; 
      const userId = new ObjectId(result.insertedId); // Convert the insertedId string to an ObjectId
      user = await usersCollection.findOne({ _id: userId });
  
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      
    // Add the token to the user object so it can be used in the callback
    user.token = token;

    return cb(null, user);
  } catch (error) {
    return cb(error, null);
  }
}
));

passport.serializeUser((user, cb) => {
cb(null, user.googleId); // Store only the googleId in the session
});

passport.deserializeUser(async (id, cb) => {
try {
  const user = await usersCollection.findOne({ googleId: id });
  cb(null, user);
} catch (error) {
  cb(error, null);
}
});





// Route to start authentication
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google auth callback
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication
    if (req.user && req.user.token) {
      res.cookie('token', req.user.token, { httpOnly: true, secure: true, maxAge: 3600000 });
    }
    res.redirect('/');
  }
);




//Helper Functions

const authenticateToken = (req, res, next) => {
  //const authHeader = req.headers['authorization'];
  //const token = authHeader && authHeader.split(' ')[1];
  const token = req.cookies.token; // Access the token from the httpOnly cookie


  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
  });
};


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
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
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

app.get('/getRandomData', async (req, res) => {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
    const json = await response.json();
    res.json(json);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.get('/api/users', authenticateToken, async (req, res) => {
  result=await getAllUsers()
  //console.log('All documents in the "users" collection:');
  //console.log(result);
  res.send(result)
  //res.sendFile(path.join(__dirname, 'public', 'allusers.html'));

})




app.get('/api/cart/:cartno', function(req, res) {
  console.log("Cart received is : " + req.params.cartno);
  res.send("Cart is  " + req.params.cartno);
});







//Post Requests



//Sign up 


app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});



app.post('/signup', async (req, res) => {
  try {
    // Extract data from request body
    const { firstName, lastName, email, uni, password } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !uni || !password || !email) {
      return res.status(400).send('First name, last name, UNI, password, and email are required');
    }

    const database = client.db('MTASurfers');
    const users = database.collection('Users');

    // Check if the user already exists
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(409).send('User already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
  
  const user= {
    firstName,
    lastName,
    email,
    uni,
    password: hashedPassword,
    isAdmin: false // Default value for isAdmin
  }
    // Insert the new user with additional fields
    const result = await users.insertOne(user);
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true, secure: true, maxAge: 3600000 }); // 1 hour
    res.redirect('/');
    res.status(201).send({ message: 'User created successfully', userId: result.insertedId });//redirect this to /
    // res.sendFile(path.join(__dirname, 'public', 'signup.html'));

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).send('Internal server error');
  }
});



//Sign in 

app.get('/signin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signin.html'));
});

//Beaer wekjfnwefbnweoufb235t4f

app.post('/signin', async (req, res) => {
  try {
      const { email, password } = req.body;

      if (!email || !password) {
          return res.status(400).send('Email and password are required');
      }

      const database = client.db('MTASurfers');
      const users = database.collection('Users');

      // Find the user by email
      const user = await users.findOne({ email });

      if (!user) {
          return res.status(404).send('User not found');
      }

      // Compare the provided password with the stored hashed password
      const isPasswordMatch = await bcrypt.compare(password, user.password);

      if (!isPasswordMatch) {
          return res.status(401).send('Invalid credentials');
      }

      // Handle session or token generation here (e.g., JWT token)
      // For example, let's return a simple message
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.cookie('token', token, { httpOnly: true, secure: true, maxAge: 3600000 }); // 1 hour
      res.send({ message: 'You are logged in successfully', userId: user._id, token: token });
  } catch (error) {
      console.error('Sign in error:', error);
      res.status(500).send('Internal server error');
  }
});


app.post('/api/join/:cartno', (req, res) => {
  const dataReceived = req.body;
  // Do something with the data (in this case, just send it back)
  res.json(dataReceived);
  console.log(dataReceived);
});



//Admin adds the user 
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





//testing 

// Synchronous Call - Client Side Script
async function synchronousCall() {
  const endpoints = [
      'http://localhost:8080/api/users',
      'http://localhost:8080/api/cart',
      'http://localhost:8080/api/join'
  ];

  for (const endpoint of endpoints) {
      const response = await fetch(endpoint);
      const data = await response.json();
      console.log(`Response from ${endpoint}:`, data);
  }
}

// Asynchronous Call - Client Side Script
async function asynchronousCall() {
  const endpoints = [
      'http://localhost:8080/api/users',
      'http://localhost:8080/api/cart',
      'http://localhost:8080/api/join'
  ];

  const promises = endpoints.map(endpoint => fetch(endpoint).then(response => response.json()));

  const responses = await Promise.all(promises);
  responses.forEach((data, index) => {
      console.log(`Response from ${endpoints[index]}:`, data);
  });
}

// Synchronous Aggregator Endpoint - Server Side
app.get('/api/aggregated/sync', async (req, res) => {
  try {
      const users = await fetch('http://localhost:8080/api/users').then(response => response.json());
      const carts = await fetch('http://localhost:8080/api/cart').then(response => response.json());
      const joinInfo = await fetch('http://localhost:8080/api/join').then(response => response.json());

      const aggregatedData = { users, carts, joinInfo };
      res.json(aggregatedData);
  } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Asynchronous Aggregator Endpoint - Server Side
app.get('/api/aggregated/async', async (req, res) => {
  try {
      const endpoints = [
          fetch('http://localhost:8080/api/users').then(response => response.json()),
          fetch('http://localhost:8080/api/cart').then(response => response.json()),
          fetch('http://localhost:8080/api/join').then(response => response.json())
      ];

      const [users, carts, joinInfo] = await Promise.all(endpoints);
      const aggregatedData = { users, carts, joinInfo };
      res.json(aggregatedData);
  } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
  }
});




app.listen(port, () => {
  console.log(`Listening on ${port}`)
})