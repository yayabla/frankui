# ⚡ FrankUI

> Frankly, a better UI framework. Dependency-free, modern, and highly modular layout with plug-and-play CSS & JS components.

🌐 **Website:** [frankui.com](https://frankui.com)

FrankUI is built to be ultra-lightweight, blazing fast, and incredibly easy to use. No complex build tools or configuration required—just plug it in and start building beautiful interfaces.

---

## ✨ Features

* **Zero Dependencies:** Pure vanilla JS and CSS.
* **Ultra-Lightweight:** Less than 130KB fully bundled, minified, and optimized.
* **Modular Components:** Easily select and use only the JS/CSS components you need.
* **Responsive by Default:** Built with modern CSS grid, flexbox, and responsive principles.

---

## 🚀 Quick Start

### 1. Via jsDelivr CDN (Recommended)
Include the compiled CSS and JS directly in your HTML:

```html
<!-- Include FrankUI Stylesheet -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@frankui/frankui@1.0.0/frankui.bundle.min.css">

<!-- Include FrankUI JS Script (Deferred) -->
<script src="https://cdn.jsdelivr.net/npm/@frankui/frankui@1.0.0/frankui.bundle.min.js" defer></script>
```

### 2. Via npm
Install the package (once published):
```bash
npm install @frankui/frankui
```

Import it in your build setup:
```javascript
// Import Javascript
import '@frankui/frankui';

// Import Stylesheet
import '@frankui/frankui/frankui.bundle.min.css';
```

---

## 🛠️ Usage Example

Here is a basic HTML template to get you up and running:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FrankUI App</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@frankui/frankui@1.0.0/frankui.bundle.min.css">
  <script src="https://cdn.jsdelivr.net/npm/@frankui/frankui@1.0.0/frankui.bundle.min.js" defer></script>
</head>
<body>

  <main class="container">
    <h1>Hello, FrankUI!</h1>
    <p>Start building your high-performance web interface.</p>
    <button class="btn btn-primary">Get Started</button>
  </main>

</body>
</html>
```

---

## 📂 Project Structure

* `frankui.bundle.min.js` — Core JavaScript logic and interactive component controllers.
* `frankui.bundle.min.css` — High-performance, modern, custom layout utility and style rules.

---

## 📄 License

This project is licensed under the MIT License.
