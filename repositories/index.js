/**
 * Export all repositories from a single place
 */

module.exports = {
  userRepository: require('./UserRepository'),
  productRepository: require('./ProductRepository'),
  categoryRepository: require('./CategoryRepository'),
  commentRepository: require('./CommentRepository'),
  voteRepository: require('./VoteRepository'),
  questionRepository: require('./QuestionRepository'),
  answerRepository: require('./AnswerRepository'),
};
