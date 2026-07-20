# Contributing to FrankUI

Thank you for your interest in contributing to FrankUI! As an open-source project, we welcome contributions of all kinds, including bug fixes, feature requests, documentation improvements, and UI refinements.

---

## 🐛 Reporting Bugs

If you find a bug:
1. Search the **Issues** tab to make sure it hasn't already been reported.
2. If it's new, open a new issue using the **Bug Report** template.
3. Please provide clear steps to reproduce the issue, along with any relevant browser/OS details.

---

## 💡 Suggesting Features

We love new ideas! If you have a suggestion:
1. Open an issue using the **Feature Request** template.
2. Explain the use case and show examples of how the new component or utility should work.

---

## 🛠️ Code Contributions

To contribute code changes (bug fixes or new components):

### Step 1: Fork and Clone
1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/frankui.git
   cd frankui
   ```

### Step 2: Make Your Changes
1. Create a new branch for your feature or fix:
   ```bash
   git checkout -b feature/my-new-component
   ```
2. Make your edits to the individual files inside the `components/` directory (rather than the compiled bundles).

### Step 3: Bundle and Minify
Before submitting your changes, run the minification script to bundle and compile your code:
```bash
./minify.sh
```
This updates the minified bundles (`frankui.bundle.min.js` and `frankui.bundle.min.css`) and copies them to all distribution locations. Make sure the script runs successfully and there are no syntax errors.

### Step 4: Submit a Pull Request
1. Commit your changes:
   ```bash
   git commit -am "feat: add my new component"
   ```
2. Push to your fork:
   ```bash
   git push origin feature/my-new-component
   ```
3. Open a **Pull Request** from your fork's branch to our `main` branch. 

Please make sure your code follows the existing style patterns and remains dependency-free.
