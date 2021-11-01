const { UserInputError } = require('apollo-server-express');
const { getNextSequence, getDb } = require('./db');

const issuesCollectionName = 'issues';

function getIssuesCollection() {
  return getDb().collection(issuesCollectionName);
}

async function get(_, { id }) {
  return getIssuesCollection().findOne({ id });
}

async function list(_, { status, effortMin, effortMax }) {
  const filter = {};

  if (status) filter.status = status;

  if (effortMin !== undefined || effortMax !== undefined) {
    filter.effort = {};
    if (effortMin !== undefined) filter.effort.$gte = effortMin;
    if (effortMax !== undefined) filter.effort.$lte = effortMax;
  }

  return getIssuesCollection().find(filter).toArray();
}

function validate(issue) {
  const errors = [];
  if (issue.title.length < 3) {
    errors.push('Field "title" should be at least 3 characters long.');
  }
  if (issue.status === 'Assigned' && !issue.owner) {
    errors.push('Field "owner" is required when status is "Assigned".');
  }
  if (errors.length > 0) {
    throw new UserInputError('Invalid input(s)', { errors });
  }
}

async function add(_, { issue }) {
  validate(issue);
  const newIssue = Object.assign({}, issue);
  newIssue.created = new Date();

  newIssue.id = await getNextSequence(issuesCollectionName);
  if (newIssue.status === undefined) newIssue.status = 'New';

  const issues = getIssuesCollection();

  const result = await issues.insertOne(newIssue);
  const savedIssue = await issues.findOne({ _id: result.insertedId });
  return savedIssue;
}

async function update(_, { id, changes }) {
  const issues = getIssuesCollection();

  if (changes.title || changes.status || changes.owner) {
    const issue = await issues.findOne({ id });
    Object.assign(issue, changes);
    validate(issue);
  }
  await issues.updateOne({ id }, { $set: changes });
  const savedIssue = issues.findOne({ id });
  console.log(savedIssue);
  return savedIssue;
}

module.exports = {
  add,
  list,
  get,
  update,
};
