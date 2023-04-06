const express = require('express')
const mongoose = require('mongoose');
const cors = require('cors');
const app = express()
const port = 3000
const User=require('./models/userModel');
const Transaction=require('./models/transactionModel');

app.use(express.json());
app.use(cors());

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

app.get('/users/login/:passcode', async(req, res) => {
  try {
    const {passcode}=req.params;
    const user = await User.find({passCode:passcode});
    res.status(200).json({"isValid":true,"data":user});
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

app.put('/users/:id', async(req, res) => {
  try {
    const {id}=req.params;
    const user = await User.findByIdAndUpdate(id,req.body);
    const updatedUser=await User.findById(id);
    res.status(200).json(updatedUser);
  }
  catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
})

app.delete('/users/:id', async(req, res) => {
  try {
    const {id}=req.params;
    const user = await User.findByIdAndDelete(id);
    res.status(200).json({message:"User has been deleted!"});
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

app.put('/transactions/:id', async(req, res) => {
  try {
    const {id}=req.params;
    const transaction = await Transaction.findByIdAndUpdate(id,req.body);
    const updatedTransactions=await Transaction.findById(id);
    res.status(200).json(updatedTransactions);
  }
  catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
})

app.delete('/transactions/:id', async(req, res) => {
  try {
    const {id}=req.params;
    const transaction = await Transaction.findByIdAndDelete(id);
    res.status(200).json({message:"Transaction has been deleted!"});
  }
  catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
})

app.get('/transactions/byDate/:date', async(req, res) => {
  try {
    const {date}=req.params;
    const transactions = await Transaction.find();
    const transactionsByDate=transactions.filter(t=>t.timeStamp.toISOString().split('T')[0]==date);
    res.status(200).json(transactionsByDate);
  }
  catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
})

app.get('/transactions/byWeek/:startDay/:endDay', async(req, res) => {
  try {
    const {startDay}=req.params;
    const {endDay}=req.params;
    const actualDay=new Date(endDay+"T23:59:59.000Z");
    const transactions = await Transaction. find({ timeStamp: { $gte: startDay, $lte: actualDay } });
    res.status(200).json(transactions);
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