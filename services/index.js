/**
 * Export all services from a single place
 */

module.exports = {
  authService: require('./AuthService'),
  productService: require('./ProductService'),
  commentService: require('./CommentService'),
  voteService: require('./VoteService'),
  questionService: require('./QuestionService'),
};
