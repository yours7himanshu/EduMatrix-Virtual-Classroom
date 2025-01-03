Here's the updated `CONTRIBUTION.md` file with the correct license information (Apache License 2.0) and a few refinements to make it more polished.

---

# 📚 **EduMatrix Virtual Classroom - Contribution Guide**

Welcome to the **EduMatrix Virtual Classroom** project! 🎉 We’re excited to have you here. Your contributions will help make this platform a better, more accessible virtual classroom for everyone.

This document outlines the process for contributing to the project. Please follow the guidelines to ensure a smooth collaboration experience.

---

## 📝 **Table of Contents**
1. [Code of Conduct](#code-of-conduct)  
2. [Getting Started](#getting-started)  
3. [How to Contribute](#how-to-contribute)  
4. [Project Setup](#project-setup)  
5. [Creating a Pull Request](#creating-a-pull-request)  
6. [Reporting Issues](#reporting-issues)  
7. [Branch Naming Convention](#branch-naming-convention)  
8. [Coding Standards](#coding-standards)  
9. [License](#license)

---

## 📜 **Code of Conduct**
We are committed to creating a welcoming and inclusive environment for all contributors. Please be respectful, considerate, and supportive when engaging with others.

---

## 🚀 **Getting Started**
To start contributing:
1. **Fork the repository** on GitHub.
2. **Clone the forked repository** to your local machine.
3. **Set up your development environment** as described in the [Project Setup](#project-setup) section.

---

## 🤝 **How to Contribute**
There are several ways you can contribute:
- **Report bugs** 🐛  
- **Suggest new features** 💡  
- **Improve documentation** 📄  
- **Fix issues** 🔧  
- **Review pull requests** ✅  

Contributions of all kinds are welcome!

---

## 🛠 **Project Setup**
Follow these steps to set up the project locally:

1. **Clone the repository**  
   ```bash
   git clone https://github.com/your-username/edumatrix-virtual-classroom.git
   cd edumatrix-virtual-classroom
   ```

2. **Install dependencies**  
   ```bash
   npm install
   ```

3. **Create a `.env` file**  
   Set up your environment variables as shown below:
   ```env
   MONGO_URI=your_mongo_db_uri
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=http://localhost:5173
   ```

4. **Run the project**  
   - **Backend**:  
     ```bash
     npm run server
     ```
   - **Frontend**:  
     Navigate to the frontend folder and run:  
     ```bash
     npm run dev
     ```

---

## ✅ **Creating a Pull Request**
1. **Create a new branch**  
   Use a descriptive branch name:  
   ```bash
   git checkout -b feature/add-new-feature
   ```

2. **Commit your changes**  
   Make sure your commit messages are clear and descriptive:  
   ```bash
   git add .
   git commit -m "Added a new feature for user authentication"
   ```

3. **Push the branch to your forked repository**  
   ```bash
   git push origin feature/add-new-feature
   ```

4. **Open a Pull Request**  
   Go to the original repository and open a pull request. Provide a clear title and description of your changes.

---

## 🐛 **Reporting Issues**
If you encounter a bug or have a feature request, please create an issue. Be sure to provide a detailed description and steps to reproduce the bug, if applicable.

---

## 📂 **Branch Naming Convention**
To keep things organized, use the following branch naming conventions:

| Branch Type  | Naming Convention       | Example                     |
|--------------|-------------------------|-----------------------------|
| Feature      | `feature/feature-name`  | `feature/user-authentication` |
| Bug Fix      | `fix/bug-description`   | `fix/login-error`            |
| Documentation| `docs/doc-name`         | `docs/contribution-guide`    |

---

## ✍️ **Coding Standards**
- Use **ESLint** for linting.  
- Follow **Prettier** formatting rules.  
- Write clean, well-documented code.  
- Ensure your code passes all tests before submitting a pull request.

---

## 📄 **License**
This project is licensed under the **Apache License 2.0**. By contributing, you agree that your contributions will be licensed under the same license.

For more details, see the [LICENSE](LICENSE) file.

---

We appreciate your contributions! 💖 Let’s build **EduMatrix Virtual Classroom** together! 🚀

--- 

