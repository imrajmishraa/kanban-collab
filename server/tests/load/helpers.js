const { v4: uuidv4 } = require('uuid');

module.exports = {
  generateBoardName: (context, events, done) => {
    context.vars.boardName = `Board-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    return done();
  },
  generateColumnName: (context, events, done) => {
    context.vars.columnName = `Column-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    return done();
  },
  generateCardTitle: (context, events, done) => {
    context.vars.cardTitle = `Card-${uuidv4().slice(0, 8)}`;
    return done();
  }
};