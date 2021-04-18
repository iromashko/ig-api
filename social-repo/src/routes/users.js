const express = require('express');
const router = express.Router();
const userRepo = require('../repos/user-repo');

router.get('/users', async (req, res) => {
  const users = await userRepo.find();
  res.send(users);
});

router.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  const user = await userRepo.findById(id);

  if (!user) {
    return res.sendStatus(404);
  }

  return res.send(user);
});

router.post('/users', async (req, res) => {
  const { username, bio } = req.body;

  const user = await userRepo.insert(username, bio);

  res.send(user);
});

router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { username, bio } = req.body;
  const user = await userRepo.update(id, username, bio);

  if (!user) {
    res.sendStatus(404);
  }

  res.send(user);
});

router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  const user = await userRepo.delete(id);

  if (!user) {
    res.sendStatus(404);
  }

  res.send(user);
});

module.exports = router;
