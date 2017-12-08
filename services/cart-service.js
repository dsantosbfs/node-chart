var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost:27017/products';

/*
* Adiciona um produto ao carrinho
*
* @param cartId:Integer - Id do carrinho
* @param product:Object - Model do produto
* @param callback:Function - Callback de retorno
*/
exports.addToCart = function addToCart(cartId, product, callback) {
  exports.findCartById(cartId, function findCartById(error, cart) {
    var cartItem;

    // Caso não exista um carrinho, cria um
    if (cart == null){
      cartItem = exports.createCartItem(product);
      cart = {
          items: [
            cartItem
          ]
      };

      exports.openCart(cart, function openCart(error, cartSaved) {
        callback(false, cartSaved);
      });

      return;
    }

    cartItem = exports.findCartItemById(cart, product.id);

    // Caso o item não exita no carrinho, adiciona. Se não, incrementa
    if (cartItem == null){
      cartItem = exports.createCartItem(product);
      cart.items[cart.items.length] = cartItem;

    } else{
      cartItem.quantity ++;
    }

    exports.updateToCart(cart, function updateToCart(error, cartSaved) {
      exports.findCartById(cartId, function findCartById(error, cart) {
        callback(false, cart);
      });
    });
  });
}

/*
* Cria um objeto do tipo produto para o carrinho
*
* @param product:Object - Objeto do produto
* @return Object : Produto
*/
exports.createCartItem = function createCartItem(product){
  var cartItem = {
    id:  product.id,
    title:  product.title,
    image:  product.image,
    availableSizes:  product.availableSizes,
    quantity: 1,
    price: product.price
  }

  return cartItem;
};

/*
* Carrega o model de um carrinho pelo ID
*
* @param id:Integer - Id do carrinho
* @param callback:Function - Callback de retorno
*/
exports.findCartById = function findCartById(id, callback){
  MongoClient.connect(url, function connect(error, db) {
    var collection = db.collection('carts');
    var objectId;

    if (error) {
      console.warn('CartService.findCartById error:', error);

      return;
    }

    objectId = new mongodb.ObjectID(id);

    collection.find({ _id: objectId }).toArray(function find(error, result) {
      if (error) {
        callback(true, null);

        return;
      }

      callback(false, result[0] || null);

      db.close();
    });
  });
}

/*
* Carrega o model de um produto do carrinho pelo ID
*
* @param cart:Object - Model do carrinho
* @param productId:Integer - Id do produto
* @return product:Object - Model do produto
*/
exports.findCartItemById = function findCartItemById(cart, productId) {
  var item;
  var key;

  // TODO: mudar para map function
  for(key in cart.items){
    if (cart.items.hasOwnProperty(key)) {
      item = cart.items[key];

      if (item.id == productId){
        return item;
      }
    }
  }

  return null;
}

/*
* Abre o carrinho de compras
*
* @param cart:Object - Carrinho
* @param callback:Function - Callback de retorno
* @return Cart Collection
*/
exports.openCart = function openCart(cart, callback){
  MongoClient.connect(url, function connect(error, db) {
    var collection = db.collection('carts');

    collection.insert(cart, function insert(error, result) {
      if (error) {
        console.warn('CarService.openCart error', error);

        return;
      }

      callback(false, result.ops[0])

      db.close();
    });
  });
}

/*
* Atualiza o carrinho
*
* @param cart:Object - Model do carrinho
* @param callback:Function - Função de retorno
* @return product:Object - Model do produto
*/
exports.updateToCart = function updateToCart(cart, callback) {
  MongoClient.connect(url, function connect(err, db) {
    var collection = db.collection('carts');

    collection.update({_id: cart._id}, cart, function update(error, result) {
      if (error) {
        console.warn('CartService.updateToCart error:', error);

        return;
      }

      callback(false, result)

      db.close();
    });
  });
}
