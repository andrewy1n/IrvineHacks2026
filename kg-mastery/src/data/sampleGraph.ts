import type { GraphData, NodeResources } from '@/types';

export const sampleDeepLearningGraph: GraphData = {
  nodes: [
    // Foundations (not_started)
    { id: 'linear_algebra', label: 'Linear Algebra', description: 'Vectors, matrices, and linear transformations fundamental to neural network computations.', confidence: 0, status: 'not_started', difficulty: 2 },
    { id: 'calculus', label: 'Calculus', description: 'Derivatives and integrals used in gradient computation and optimization.', confidence: 0, status: 'not_started', difficulty: 3 },
    { id: 'probability', label: 'Probability', description: 'Probability distributions, Bayes theorem, and statistical foundations of ML.', confidence: 0, status: 'not_started', difficulty: 3 },

    // Core ML
    { id: 'perceptron', label: 'Perceptron', description: 'Simplest neural network unit — a single-layer linear classifier.', confidence: 0.85, status: 'mastered', difficulty: 1 },
    { id: 'activation_fn', label: 'Activation Functions', description: 'Non-linear functions (ReLU, sigmoid, tanh) that enable networks to learn complex patterns.', confidence: 0.75, status: 'on_track', difficulty: 2 },
    { id: 'loss_functions', label: 'Loss Functions', description: 'Functions measuring prediction error: MSE, cross-entropy, hinge loss.', confidence: 0.5, status: 'building', difficulty: 2 },
    { id: 'gradient_descent', label: 'Gradient Descent', description: 'Iterative optimization algorithm to minimize the loss function by following gradients.', confidence: 0.6, status: 'on_track', difficulty: 3 },
    { id: 'backpropagation', label: 'Backpropagation', description: 'Algorithm to efficiently calculate gradients through the chain rule for weight updates.', confidence: 0.3, status: 'developing', difficulty: 4 },
    { id: 'forward_pass', label: 'Forward Pass', description: 'Sequential computation from input through layers to produce predictions.', confidence: 0.55, status: 'building', difficulty: 2 },

    // Network Architectures
    { id: 'mlp', label: 'MLP', description: 'Multi-layer perceptron — fully connected feedforward network with hidden layers.', confidence: 0.45, status: 'building', difficulty: 3 },
    { id: 'cnn', label: 'CNN', description: 'Convolutional neural network using spatial filters for image and signal processing.', confidence: 0.2, status: 'developing', difficulty: 4 },
    { id: 'rnn', label: 'RNN', description: 'Recurrent neural network with temporal connections for sequence modeling.', confidence: 0, status: 'not_started', difficulty: 4 },
    { id: 'lstm', label: 'LSTM', description: 'Long short-term memory network solving vanishing gradient problem in sequences.', confidence: 0, status: 'not_started', difficulty: 5 },
    { id: 'gru', label: 'GRU', description: 'Gated recurrent unit — simplified LSTM variant with fewer parameters.', confidence: 0, status: 'not_started', difficulty: 4 },
    { id: 'transformer', label: 'Transformer', description: 'Attention-based architecture replacing recurrence for parallel sequence processing.', confidence: 0.15, status: 'developing', difficulty: 5 },
    { id: 'attention', label: 'Attention', description: 'Mechanism allowing models to focus on relevant parts of input sequences.', confidence: 0.25, status: 'developing', difficulty: 4 },
    { id: 'self_attention', label: 'Self-Attention', description: 'Attention applied within a single sequence to capture internal dependencies.', confidence: 0, status: 'not_started', difficulty: 5 },

    // Training Techniques
    { id: 'regularization', label: 'Regularization', description: 'Techniques (L1, L2, dropout) to prevent overfitting and improve generalization.', confidence: 0.7, status: 'on_track', difficulty: 3 },
    { id: 'dropout', label: 'Dropout', description: 'Randomly zeroing neurons during training as a regularization strategy.', confidence: 0.8, status: 'mastered', difficulty: 2 },
    { id: 'batch_norm', label: 'Batch Normalization', description: 'Normalizing layer inputs per mini-batch to stabilize and accelerate training.', confidence: 0.35, status: 'developing', difficulty: 3 },
    { id: 'learning_rate', label: 'Learning Rate', description: 'Hyperparameter controlling step size during gradient descent optimization.', confidence: 0.65, status: 'on_track', difficulty: 2 },
    { id: 'optimizer', label: 'Optimizers', description: 'Adam, SGD, RMSprop — algorithms adapting learning rates per parameter.', confidence: 0.4, status: 'building', difficulty: 3 },
    { id: 'weight_init', label: 'Weight Initialization', description: 'Strategies (Xavier, He) for setting initial network weights to aid convergence.', confidence: 0, status: 'not_started', difficulty: 2 },

    // Advanced Topics
    { id: 'transfer_learning', label: 'Transfer Learning', description: 'Reusing pre-trained model features for new tasks with limited data.', confidence: 0, status: 'not_started', difficulty: 2 },
    { id: 'fine_tuning', label: 'Fine-Tuning', description: 'Adjusting pre-trained model weights on task-specific data.', confidence: 0, status: 'not_started', difficulty: 3 },
    { id: 'embedding', label: 'Embeddings', description: 'Dense vector representations mapping discrete tokens to continuous space.', confidence: 0.5, status: 'building', difficulty: 3 },
    { id: 'positional_encoding', label: 'Positional Encoding', description: 'Injecting sequence order information into transformer inputs.', confidence: 0, status: 'not_started', difficulty: 4 },
    { id: 'gan', label: 'GANs', description: 'Generative adversarial networks — two networks competing to generate realistic data.', confidence: 0, status: 'not_started', difficulty: 5 },
    { id: 'autoencoder', label: 'Autoencoder', description: 'Network learning compressed representations by reconstructing inputs.', confidence: 0.1, status: 'developing', difficulty: 3 },
    { id: 'vae', label: 'VAE', description: 'Variational autoencoder — probabilistic generative model with latent space.', confidence: 0, status: 'not_started', difficulty: 4 },

    // Evaluation
    { id: 'overfitting', label: 'Overfitting', description: 'Model memorizing training data and failing to generalize to new examples.', confidence: 0.9, status: 'mastered', difficulty: 2 },
    { id: 'cross_validation', label: 'Cross-Validation', description: 'Technique for robust model evaluation using multiple train/test splits.', confidence: 0.72, status: 'on_track', difficulty: 2 },
    { id: 'confusion_matrix', label: 'Confusion Matrix', description: 'Table showing true/false positives/negatives for classification evaluation.', confidence: 0.55, status: 'building', difficulty: 1 },
    { id: 'conv_layer', label: 'Conv Layers', description: 'Layers applying learnable filters to detect spatial features in inputs.', confidence: 0.3, status: 'developing', difficulty: 3 },
    { id: 'pooling', label: 'Pooling', description: 'Downsampling operation (max/avg) reducing spatial dimensions in CNNs.', confidence: 0.2, status: 'developing', difficulty: 2 },
  ],
  links: [
    // Foundations → Core
    { id: 'e1', source: 'linear_algebra', target: 'perceptron', relationship: 'prereq' },
    { id: 'e2', source: 'calculus', target: 'gradient_descent', relationship: 'prereq' },
    { id: 'e3', source: 'calculus', target: 'backpropagation', relationship: 'prereq' },
    { id: 'e4', source: 'probability', target: 'loss_functions', relationship: 'prereq' },

    // Core chain
    { id: 'e5', source: 'perceptron', target: 'activation_fn', relationship: 'leads_to' },
    { id: 'e6', source: 'perceptron', target: 'mlp', relationship: 'leads_to' },
    { id: 'e7', source: 'activation_fn', target: 'mlp', relationship: 'prereq' },
    { id: 'e8', source: 'loss_functions', target: 'gradient_descent', relationship: 'prereq' },
    { id: 'e9', source: 'gradient_descent', target: 'backpropagation', relationship: 'prereq' },
    { id: 'e10', source: 'forward_pass', target: 'backpropagation', relationship: 'prereq' },
    { id: 'e11', source: 'mlp', target: 'forward_pass', relationship: 'leads_to' },

    // Network types
    { id: 'e12', source: 'mlp', target: 'cnn', relationship: 'leads_to' },
    { id: 'e13', source: 'mlp', target: 'rnn', relationship: 'leads_to' },
    { id: 'e14', source: 'cnn', target: 'conv_layer', relationship: 'contains' },
    { id: 'e15', source: 'conv_layer', target: 'pooling', relationship: 'leads_to' },
    { id: 'e16', source: 'rnn', target: 'lstm', relationship: 'leads_to' },
    { id: 'e17', source: 'rnn', target: 'gru', relationship: 'leads_to' },
    { id: 'e18', source: 'attention', target: 'self_attention', relationship: 'leads_to' },
    { id: 'e19', source: 'self_attention', target: 'transformer', relationship: 'prereq' },
    { id: 'e20', source: 'positional_encoding', target: 'transformer', relationship: 'prereq' },
    { id: 'e21', source: 'embedding', target: 'transformer', relationship: 'prereq' },
    { id: 'e22', source: 'lstm', target: 'attention', relationship: 'leads_to' },

    // Training
    { id: 'e23', source: 'backpropagation', target: 'optimizer', relationship: 'prereq' },
    { id: 'e24', source: 'gradient_descent', target: 'learning_rate', relationship: 'contains' },
    { id: 'e25', source: 'gradient_descent', target: 'optimizer', relationship: 'leads_to' },
    { id: 'e26', source: 'overfitting', target: 'regularization', relationship: 'solved_by' },
    { id: 'e27', source: 'regularization', target: 'dropout', relationship: 'contains' },
    { id: 'e28', source: 'mlp', target: 'batch_norm', relationship: 'uses' },
    { id: 'e29', source: 'mlp', target: 'weight_init', relationship: 'uses' },

    // Advanced
    { id: 'e30', source: 'cnn', target: 'transfer_learning', relationship: 'leads_to' },
    { id: 'e31', source: 'transfer_learning', target: 'fine_tuning', relationship: 'leads_to' },
    { id: 'e32', source: 'mlp', target: 'autoencoder', relationship: 'leads_to' },
    { id: 'e33', source: 'autoencoder', target: 'vae', relationship: 'leads_to' },
    { id: 'e34', source: 'mlp', target: 'gan', relationship: 'leads_to' },

    // Evaluation
    { id: 'e35', source: 'loss_functions', target: 'overfitting', relationship: 'related' },
    { id: 'e36', source: 'overfitting', target: 'cross_validation', relationship: 'solved_by' },
    { id: 'e37', source: 'cross_validation', target: 'confusion_matrix', relationship: 'uses' },
  ],
};

export const nodeResources: NodeResources = {
  perceptron: [
    { type: 'video', title: '3Blue1Brown: Neural Networks', duration: '19:13' },
    { type: 'article', title: 'Wikipedia: Perceptron Model' },
    { type: 'practice', title: 'Implement a perceptron from scratch' },
  ],
  backpropagation: [
    { type: 'video', title: '3Blue1Brown: Backpropagation', duration: '13:54' },
    { type: 'article', title: 'Calculus of Backpropagation' },
    { type: 'practice', title: 'Manual gradient computation exercise' },
  ],
  gradient_descent: [
    { type: 'video', title: 'StatQuest: Gradient Descent', duration: '9:02' },
    { type: 'article', title: 'An Overview of Gradient Descent Algorithms' },
    { type: 'practice', title: 'Visualize gradient descent on 2D loss surface' },
  ],
  cnn: [
    { type: 'video', title: 'Stanford CS231n: CNNs', duration: '1:16:00' },
    { type: 'article', title: 'A Comprehensive Guide to CNNs' },
    { type: 'practice', title: 'Build a CNN for MNIST classification' },
  ],
  transformer: [
    { type: 'video', title: 'Illustrated Transformer walkthrough', duration: '25:30' },
    { type: 'article', title: 'Attention Is All You Need — paper summary' },
    { type: 'practice', title: 'Implement scaled dot-product attention' },
  ],
  attention: [
    { type: 'video', title: 'Attention Mechanism Explained', duration: '12:45' },
    { type: 'article', title: 'Neural Machine Translation by Attention' },
    { type: 'practice', title: 'Visualize attention weights on a sentence' },
  ],
  lstm: [
    { type: 'video', title: 'Understanding LSTM Networks', duration: '15:20' },
    { type: 'article', title: 'Colah\'s Blog: Understanding LSTMs' },
    { type: 'practice', title: 'Build an LSTM text generator' },
  ],
  rnn: [
    { type: 'video', title: 'RNNs and Sequence Modeling', duration: '11:30' },
    { type: 'article', title: 'The Unreasonable Effectiveness of RNNs' },
    { type: 'practice', title: 'Implement a simple RNN cell' },
  ],
};

const defaultResources = [
  { type: 'video' as const, title: 'Concept overview video', duration: '10:00' },
  { type: 'article' as const, title: 'Deep dive article' },
  { type: 'practice' as const, title: 'Hands-on coding exercise' },
];

export function getResourcesForNode(nodeId: string) {
  return nodeResources[nodeId] ?? defaultResources;
}
