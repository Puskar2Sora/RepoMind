# Contributing to RepoMind

Thank you for your interest in contributing to RepoMind! We love your input and want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features (like new LLM providers, Agentic CAG enhancements, or visualization tools)

## Our Development Process

We use GitHub to track issues and feature requests, as well as accept pull requests.

1. **Fork** the repository and create your branch from `main`.
2. If you've added code that should be tested, **add tests**.
3. Ensure the test suite passes and the project builds successfully.
4. Issue that **pull request**!

## Code of Conduct

Please be respectful and considerate of others when interacting with the community. We aim to maintain a welcoming environment for all developers.

## How Can I Contribute?

### Reporting Bugs
Before creating bug reports, please check the existing Issues list as you might find that you don't need to create a new one. When you are creating a bug report, please include as many details as possible:
- **Use a clear and descriptive title.**
- **Describe the exact steps to reproduce the problem.**
- **Provide specific examples** (such as the specific GitHub URL you attempted to analyze).
- **Include environment details** (Node version, OS, browser if applicable).

### Suggesting Enhancements
If you have an idea to improve RepoMind (e.g., adding a new diagram type, optimizing the Context-Augmented Generation context window, or adding new framework support):
- Open a new Issue with the tag `enhancement`.
- Clearly explain how the feature would work and why it benefits users.

### Pull Requests
1. **Branch Naming**: Use descriptive names like `feature/add-claude-support` or `bugfix/issue-123`.
2. **Environment Setup**:
   ```bash
   # Clone your fork
   git clone [https://github.com/YOUR-USERNAME/RepoMind.git](https://github.com/YOUR-USERNAME/RepoMind.git)
   cd RepoMind

   # Install dependencies
   npm install # or yarn install

   # Setup your environment variables
   cp .env.example .env
