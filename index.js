const express = require('express')
const mongoose = require('mongoose');
const app = express()
const port = 3000
const User=require('./models/userModel');
const Transaction=require('./models/transactionModel');

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to SF06 API!')
})

app.get('/users', async(req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  }
  catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
})

app.get('/users/:id', async(req, res) => {
  try {
    const {id}=req.params;
    const user = await User.find({_id:id});
    res.status(200).json(user);
  }
  catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
})

app.post('/users', async(req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(200).json(user);
  }
  catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
})

app.post('/transactions', async(req, res) => {
  try {
    const transaction = await Transaction.create(req.body);
    res.status(200).json(transaction);
  }
  catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
})

app.get('/transactions', async(req, res) => {
  try {
    const transactions = await Transaction.find();
    res.status(200).json(transactions);
  }
  catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
})

app.get('/transactions/:id', async(req, res) => {
  try {
    const {id}=req.params;
    const transaction = await Transaction.find({_id:id});
    res.status(200).json(transaction);
  }
  catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
})


mongoose.connect('mongodb+srv://pratik:pratik123@deployments.yjqiwqf.mongodb.net/SF-06?retryWrites=true&w=majority'
).then(() => {
  console.log("The cloud DB is connected");
  app.listen(port, () => {
    console.log(`My app listening on port ${port}`);
  })
}).catch((error) => {
  console.log(error);
})