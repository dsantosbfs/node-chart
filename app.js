var express = require('express');

var app = express();
var cartServices = require("./services/cart-service.js");
var cookieParser = require('cookie-parser')
var fs = require('fs');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var port = process.env.PORT || 3001;
var productServices = require("./services/product-service.js");
var url = 'mongodb://localhost:27017/products';

app.use(express.static('public'));
app.use(cookieParser());

/*
* Rota para listagem dos produtos adicionados ao carrinho
*/
app.get('/cart/', function getCart(request, response){
  var cartId = request.cookies.cart;

  cartServices.findCartById(cartId, function findCartById(error, cart) {
    if (cart){
      response.json(cart);

      return;
    }

    response.json({ items: [] });
  });
});

/*
* Rota para adicionar um produto ao carrinho pelo ID
*/
app.get('/cart/add/:id', function getCartAdd(request, response) {
  var cartId = request.cookies.cart;
  var id =  parseInt(request.params.id, 10);

  productServices.findProductById(id, function findProductById(error, product) {
    if (product){
      cartServices.addToCart(cartId, product, function addToCart(error, cart) {
        if (cart._id){
          response.cookie('cart', cart._id, {
            maxAge: 900000,
            httpOnly: true
          });
        }

        response.json(cart);
      });

      return;
    }

    response.json({"error": "product id " + request.params.id + " not found!"});
  });
});

/*
* Rota para remover um produto do carrinho pelo ID
*/
app.get('/cart/remove/:id', function getCartRemove(request, response){
  var cartId = request.cookies.cart;
  var productId =  parseInt(request.params.id);

  cartServices.findCartById(cartId, function findCartById(error, cart){
    var items = [];
    var key;
    var item;

    for(key in cart.items){
      if (cart.items.hasOwnPropety(key)) {
        item = cart.items[key];

        if (item.id != productId){
          items[items.length] = cart.items[key];
        }
      }
    }

    cart.items = items;

    cartServices.updateToCart(cart, function updateToCart(){
        response.json(cart);
    });
  });
});

/*
* Rota para listagem dos produtos
*/
app.get('/products', function getProducts(request, response){
  MongoClient.connect(url, function connect(error, db) {
    var collection = db.collection('products');

    if (error) {
      console.warn('Unable to connect to the mongoDB server. Error:', err);

      return;
    }

    collection.find({}).toArray(function find(error, result) {
      if (error) {
        console.warn('Something went wrong! :(', error);

        return;
      }

      response.json(result);

      db.close();
    });
  });
});

/*
* Rota para recuperar o produto pelo ID
*/
app.get('/product/:id', function getProductId(request, response){
  MongoClient.connect(url, function (error, db) {
    var collection = db.collection('products');
    var id =  parseInt(request.params.id);

    if (error) {
      console.warn('Unable to connect to the mongoDB server. Error:', err);

      return;
    }

    collection.find({id: id}).toArray(function find(error, result) {
      if (error) {
        console.warn('Somethig went wrong!', result);

        return;
      }

      response.json(result);

      db.close();
    });
  });
});

app.listen(port, function listen() {
  console.log('Listening on ' + port, '- http://localhost:' + port);
});
