# Shopping and Blogging Web Application

Welcome to the Shopping and Blogging web application project! Below is an in-depth overview of the project's structure and functionalities:

## Project Structure

### Files:

- **`jquery.js` and `jquery.js.zip`:** JavaScript files or archives associated with the jQuery library.

### Directories:

- **`public`:** Directory containing public assets for the project.

- **`views`:** Directory containing Handlebars (.hbs) templates for rendering web pages.

  - **`layouts`:** Directory for layout templates.

  - **`404.hbs`, `about.hbs`, `addCategory.hbs`, `addItem.hbs`, `categories.hbs`, `items.hbs`, `login.hbs`, `register.hbs`, `shop.hbs`, `userHistory.hbs`:** Handlebars templates for different pages within the application.

- **`.gitignore`:** Specifies files and directories to be ignored by version control.

- **`auth-service.js`:** Manages authentication-related functionalities.

- **`package.json` and `package-lock.json`:** Files containing project metadata and dependencies.

- **`server.js`:** The main server file responsible for handling server-side operations.

- **`store-service.js`:** Manages services related to the project's store functionalities.

## Usage

To run the project, follow these steps:

1. Ensure you have the necessary dependencies installed by running:
   ```bash
   npm install
   ```

2. Start the server using the command:
   ```bash
   node server.js
   ```

3. Visit [http://localhost:your_port](http://localhost:your_port) in your browser to access the application.

## Shopping and Blogging Features

- **Shopping Section:**
  - Explore items and categories in the `shop` page.
  - Add items to the shopping cart.
  - Navigate through different categories in `categories.hbs`.

- **Blogging Section:**
  - Access blog-related pages like `about`, `login`, `register`, etc.
  - Engage with user-related pages like `userHistory`.
  - Utilize authentication services provided by `auth-service.js`.
