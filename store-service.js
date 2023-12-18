/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part of this
*  assignment has been copied manually or electronically from any other source (including web sites) or 
*  distributed to other students.
* 
*  Name: Ronald Roldan Student ID:121813224 Date: 2023/08/14
*
*  Cyclic Web App URL: https://vast-plum-cockroach-slip.cyclic.app/ 
*
*  GitHub Repository URL: GitHub Repository URL: https://github.com/rroldan1106/-web322-app
*
********************************************************************************/ 
const fs = require("fs");
const Sequelize = require('sequelize');
var sequelize = new Sequelize('svphlawu', 'svphlawu', 'V2JG9ZBcZdgid54MFWudz-paqLEugHAp', {
  host: 'batyr.db.elephantsql.com',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false }
  },
  query: { raw: true }
});

sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.log('Unable to connect to the database:', err);
  });

  var Item = sequelize.define('Item', {
  body: Sequelize.STRING,
  title: Sequelize.STRING,  // entry title
  postDate: Sequelize.DATE, // author of the entry
  featureImage: Sequelize.STRING, // main text for the entry
  published: Sequelize.BOOLEAN, // number of views
  price: Sequelize.DOUBLE // Date the entry was posted
});

var Category = sequelize.define('Category', {
  category: Sequelize.STRING,
});

Item.belongsTo(Category, {foreignKey: 'category'});



function initialize() {
  return new Promise((resolve, reject) => {
    sequelize
      .sync()
      .then(() => {
        console.log("Database synced successfully.");
        resolve();
      })
      .catch((error) => {
        console.error("Error syncing database:", error);
        reject("Unable to sync the database.");
      });
  });
}

function getAllItems() {
  return new Promise((resolve, reject) => {
    Item.findAll()
      .then((items) => {
        if (items.length === 0) {
          reject("no results returned");
        } else {
          resolve(items);
        }
      })
      .catch((error) => {
        console.error("Error fetching items:", error);
        reject("Unable to fetch items");
      });
  });
}

function getPublishedItems() {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: {
        published: true
      }
    })
    .then((items) => {
      resolve(items);
    })
    .catch((error) => {
      console.error('Error fetching published items:', error);
      reject('No results returned');
    });
  });
}

function getPublishedItemsByCategory(category) {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: {
        published: true,
        category: category
      }
    })
    .then((items) => {
      resolve(items);
    })
    .catch((error) => {
      console.error('Error fetching published items by category:', error);
      reject('No results returned');
    });
  });
}

function getCategories() {
  return new Promise((resolve, reject) => {
    Category.findAll()
      .then((category) => {
        resolve(category);
      })
      .catch((error) => {
        console.error('Error fetching categories:', error);
        reject('No results returned');
      });
  });
}

function addItem(itemData) {
  return new Promise((resolve, reject) => {
    // Assuming Item model is defined

    for (const property in itemData) {
      if (itemData[property] === "") {
        itemData[property] = null;
      }
    }

    itemData.postDate = new Date();
    console.log("Item data to be created:", itemData)
    Item.create({
      body: itemData.body,
      title: itemData.title,
      postDate: itemData.postDate,
      featureImage: itemData.featureImage,
      published: itemData.published,
      price: itemData.price,
      category:itemData.category
    })
      .then(() => {
        resolve();
      })
      .catch((error) => {
        console.error('Error creating Item:', error);
        reject('Unable to create item.');
      });
  });
}


function getItemsByCategory(number) {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: {
        category: number
      }
    })
    .then((items) => {
      if (items.length === 0) {
        reject('no results returned');
      } else {
        resolve(items);
      }
    })
    .catch((error) => {
      console.error('Error fetching items by category:', error);
      reject('Unable to fetch items by category');
    });
  });
}

function getItemsByMinDate(minDateStr) {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: {
        postDate: {
          [gte]: new Date(minDateStr),
        }
      }
    })
      .then((items) => {
        if (items.length === 0) {
          reject("no results returned");
        } else {
          resolve(items);
        }
      })
      .catch((error) => {
        console.error("Error fetching items by minDateStr:", error);
        reject("Unable to fetch items by minDateStr");
      });
  });
}

function getItemById(Id) {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: {id:Id}
    })
    .then((items) => {
      if (items.length === 0) {
        reject('no results returned');
      } else {
        resolve(items[0]);
      }
    })
    .catch((error) => {
      console.error('Error fetching item by ID:', error);
      reject('Unable to fetch item by ID');
    });
  });
}

function addCategory(categoryData) {
  return new Promise((resolve, reject) => {
    // Set blank values to null
    for (const key in categoryData) {
      if (categoryData[key] === '') {
        categoryData[key] = null;
      }
    }
    // Create the category
    Category.create(categoryData)
      .then((category) => {
        resolve(category);
      })
      .catch((error) => {
        reject('Unable to create category');
      });
  });
}
function deleteCategoryById(id) {
  return new Promise((resolve, reject) => {
    Category.destroy({ where: { id } })
      .then((rowsDeleted) => {
        if (rowsDeleted > 0) {
          resolve();
        } else {
          reject('Post not found');
        }
      })
      .catch((error) => {
        reject('Unable to delete post');
      });
  });
}
function deletePostById(id) {
  return new Promise((resolve, reject) => {
    Item.destroy({ where: { id } })
      .then((rowsDeleted) => {
        if (rowsDeleted > 0) {
          resolve();
        } else {
          reject('Post not found');
        }
      })
      .catch((error) => {
        reject('Unable to delete post');
      });
  });
}


module.exports = {
  initialize,
  getAllItems,
  getPublishedItems,
  getCategories,
  addItem,
  getItemsByCategory,
  getItemById,
  getItemsByMinDate,
  getPublishedItemsByCategory,
  addCategory,
  deleteCategoryById,
  deletePostById
};
