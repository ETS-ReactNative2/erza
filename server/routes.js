const chalk = require('chalk');
const express = require('express');
const graphqlHTTP = require('express-graphql');
const mongoose = require('mongoose');
const Constants = require('./constants');

const environment = process.env.NODE_ENV || 'development';
const db = mongoose.connect(`mongodb://localhost/${Constants.appName}-${environment}`, (err) => {
	if (err) {
		console.error(chalk.red('Could not connect to MongoDB!'));
		console.log(chalk.red(err));
	}
});

const router = express.Router();

// middleware to use for all requests
router.use((req, res, next) => {
	console.log(chalk.bold.yellow('Query @ ', req.url));
	next(); // pass to next handler.
});

// GraphqQL server route
router.use('/graphql', graphqlHTTP(req => ({
  schema,
  pretty: true
})));

module.exports = router;