const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// START
const { ObjectId } = require('mongodb');

// middleware to parse URL form data
app.use(express.urlencoded({ extended: true }));

// storage for users
let users = [];

// POST user
app.post('/api/users', function(req,res){
  const userName = req.body.username;
  if (userName)
  {
    const user = {
      username: userName,
      _id: new ObjectId().toString(), //generate a MongoDB objectId
      log: []
  };
  users.push(user);  //add new user to userlist
  res.json(user);
  } 
else 
  {
    res.json({ error: 'Username is required' });
  }
});

// POST user exercises
app.post('/api/users/:_id/exercises', function(req, res) {
  const userId = req.params._id;
  const user = users.find(u => u._id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const { description, duration, date } = req.body;
  if (!description || !duration) {
    return res.status(400).json({ error: 'Description and duration are required' });
  }
  
  const exercise = {
    description: description,
    duration: parseInt(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString()
  };
  
  user.log.push(exercise);
  
  res.json({
    username: user.username,
    _id: user._id,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date
  });
});

// GET users list
app.get('/api/users', function(req,res){
  return res.json(users);
});

// GET exercise log of user
app.get('/api/users/:_id/logs', function(req, res) {
  const userId = req.params._id;
  const user = users.find(u => u._id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const { from, to, limit } = req.query;
  let log = user.log;

  if (from) {
    const fromDate = new Date(from);
    log = log.filter(exercise => new Date(exercise.date) >= fromDate);
  }
  if (to) {
    const toDate = new Date(to);
    log = log.filter(exercise => new Date(exercise.date) <= toDate);
  }
  if (limit) {
    log = log.slice(0, parseInt(limit));
  }

  res.json({
    username: user.username,
    _id: user._id,
    count: log.length,
    log: log
  });
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
