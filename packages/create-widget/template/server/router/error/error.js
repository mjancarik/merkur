const express = require('express');

const router = express.Router();

router.use((req, res) => {
  res.status(404).json({
    error: {
      status: 404,
      message: `The endpoint ${req.path} doesn't exist.`,
    },
  });
});

module.exports = () => ({ router });
