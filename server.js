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

const HTTP_PORT = process.env.PORT || 8080;
const authData = require('./auth-service');
const express = require('express');
const itemData = require('./store-service');
const app = express();
const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const exphbs = require('express-handlebars');

const clientSessions = require("client-sessions")


let items = [];
let categories = [];
cloudinary.config({ 
  cloud_name: 'dmzgo0pm6', 
  api_key: '642544863348448', 
  api_secret: 'mQi_IQRbkppLhFtRb_CYjZ__lTM' 
});

app.use(clientSessions({
  cookieName: "session", //this is the object name for this session new
  secret: "webApp", //this should be an unguessable string
  duration: 2 * 60 * 1000, //the duration of the session
  activeDuration: 1000 * 60 //this session will be extended by this each request
}))

app.use(express.urlencoded({extended: true}));

app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});

function ensureLogin(req, res, next) {
  if(!req.session.user) {
      res.redirect("/login")
  } else {
      next();
  }
}

app.use(['/items', '/categories', '/post','/category', '/categories/add','/items/add' , '/categories/delete/:id' , '/items/delete/:id' ], ensureLogin);


itemData
  .initialize()
  .then(authData.initialize)
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log(`Express HTTP server listening on port ${HTTP_PORT}`);
    });
  })
  .catch((error) => {
    console.error(error);
  });

app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

const upload = multer();

app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'views')));

app.engine('.hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');

const helpers = {
  navLink: function(url, options){
    return '<li' + 
        ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
        '><a href="' + url + '">' + options.fn(this) + '</a></li>';
  },
  formatDate: function (dateObj) {
    let year = dateObj.getFullYear();
    let month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    let day = dateObj.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  },
  equal: function (lvalue, rvalue, options) {
    if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
    if (lvalue != rvalue) {
        return options.inverse(this);
    } else {
        return options.fn(this);
    }
  }
}


const hbs = exphbs.create({

  extname: '.hbs',
  helpers: helpers
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

app.get('/', (req, res) => {
  res.redirect('/about');
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/items', (req, res) => {
  
  let items = [];
  const category = req.query.category;

  if (category) {

    itemData.getItemsByCategory(category)
      .then((items) => {

        res.render("items", { items });
      })
      .catch((err) => {
        console.error("Error fetching items:", err);
        res.status(500).send("Error fetching items");
      });
  } else {
    itemData.getAllItems()
    .then((data) => {
      if (data.length > 0) {
        res.render('items', { items :data });
      } else {
        res.render('Items', { message: 'no results' });
      }
    })
    .catch((err) => {
      res.render('items', { message: 'no items' });
    });
}});

app.get("/categories", (req, res) => {
  itemData.getCategories()
    .then((data) => {
      if (data.length > 0) {
        res.render("categories", { categories: data });
      } else {
        res.render("categories", { message: "no results" });
      }
    })
    .catch((error) => {
      res.render("categories", { message: "no results" });
    });
});



app.get("/items/add", (req, res) => {
  
  itemData.getCategories()
    .then((categories) => {
      res.render('addItem', {categories: categories });
    })
    .catch((error) => {
      console.error("Failed to fetch categories:", error);
      res.render('addItem', { categories: [] });
    });
});

app.post('/items/add', upload.single("featureImage"), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      let result = await streamUpload(req);
      console.log(result);
      return result;
    }

    upload(req).then((uploaded) => {
      processItem(uploaded.url);
    });
  } else {
    processItem('');
  }

  function processItem(imageUrl) {
    req.body.featureImage = imageUrl;
    console.log(req.body);
    itemData.addItem(req.body)
      .then(() => {
        res.redirect("/items");
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error adding item to the store");
      });
 }
});




// add Categories

app.get('/categories/add', (req, res) => {
  res.render('addCategory');
});


app.post("/categories/add", (req, res) => {
  const categoryData = req.body; 
  console.log(categoryData);

  itemData.addCategory(categoryData)
    .then(() => {
      res.redirect("/categories"); 
    })
    .catch((error) => {
      console.error("Error adding category:", error);
      res.status(500).send("Unable to add category");
    });
});
        
      
// delete categories 


app.get("/categories/delete/:id", (req, res) => {
  const categoryId = req.params.id;

  itemData.deleteCategoryById(categoryId)
    .then(() => {
      res.redirect("/categories"); 
    })
    .catch((error) => {
      console.error("Error deleting category:", error);
      res.status(500).send("Unable to Remove Category / Category not found");
    });
});


app.get("/items/delete/:id", (req, res) => {
  const postId = req.params.id;

  itemData.deletePostById(postId)
    .then(() => {
      res.redirect("/items"); 
    })
    .catch((error) => {
      console.error("Error deleting post:", error);
      res.status(500).send("Unable to Remove Post / Post not found");
    });
});



app.get("/shop", async (req, res) => {
  try {
    let viewData = {};



    if (req.query.category) {
      console.log("Fetching published items by category...");
      items = await itemData.getPublishedItemsByCategory(req.query.category);
    } else {
      console.log("Fetching all published items...");
      items = await itemData.getPublishedItems();
    }

    items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    viewData.items = items;

    const categories = await itemData.getCategories();
    viewData.categories = categories;

    console.log("Rendering shop view with data:", viewData);
    // Render the "shop" view with all items and categories data
    res.render("shop", { data: viewData });
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).send("Error fetching data for shop");
  }
});




app.get("/shop/:id", async (req, res) => {
  try {
    // Declare an object to store properties for the view
    let viewData = {};

    // Get the id parameter from the request URL
    const itemId = req.params.id;

    // Fetch "items" and "categories" concurrently using Promise.all
    await Promise.all([
      // Fetch the item data based on the itemId
      (async () => {
        try {
          console.log(`Fetching item with id ${itemId}...`);
          const item = await itemData.getItemById(itemId);

          if (item) {
            // Store the fetched item in viewData
            viewData.item = item;
          } else {
            console.log(`Item with id ${itemId} not found.`);
          }
        } catch (error) {
          console.error("Error fetching item data:", error);
        }
      })(),
      // Fetch "categories" data
      (async () => {
        console.log("Fetching categories...");
        const categories = await itemData.getCategories();
        viewData.categories = categories;

        console.log("Fetched categories:", categories);
      })()
    ]);

    console.log("Rendering shop view with data:", viewData);
    // Render the "shop" view with all of the data (viewData)
    res.render("shop", { data: viewData });
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).send("Error fetching data for shop");
  }
});




//Display the login page
app.get("/login", (req, res) => {
  res.render("login")
})

//register
app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  let userData = req.body;

  // Call the RegisterUser method from authData with the user data
  authData
    .registerUser(userData)
    .then(() => {
      res.render('register', { successMessage: 'User created' });
    })
    .catch((err) => {
      res.render('register', { errorMessage: err, userName: userData.userName });
    });
});

app.post('/login', (req, res) => {
  req.body.userAgent = req.get('User-Agent');

  authData.checkUser(req.body).then((user) => {

    req.session.user = {
      userName: user.userName,
      email: user.email,
      loginHistory: user.loginHistory,
    };

    res.redirect('/items');
  })
  .catch((err) => {
    res.render('login', { errorMessage: err, userName: req.body.userName });

  });
});


app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/login")
})

app.get('/userHistory', (req, res) => {
  res.render('userHistory'); 
});






app.use((req, res) => {
  res.status(404).render("404");
});

