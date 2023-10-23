const express = require('express')
const app = express()
const port = 8080
const path = require('path')  


app.get('/', (req, res) => {
  res.send('Hello from the MTA Surfers!')
})



app.get('/api/cart', (req, res) => {
  res.send('Cart is here :)')
})



app.get('/api/users', (req, res) => {
  res.send('Users are here :)')
})


app.get('/api/cart/:cartno', function(req, res) {
  console.log("Cart received is : " + req.params.cartno);
  res.send("Cart is  " + req.params.cartno);
});

app.listen(port, () => {
  console.log(`Listening on ${port}`)
})