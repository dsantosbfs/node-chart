var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost:27017/challenge';

/*
* Retorna um produto pelo Id
*
* @param id:Integer - Id do produto
* @param callback:Function - Callback de retorno
* @return Product Collection - Coleção de produtos
*/
exports.findProductById = function (id, callback){
  MongoClient.connect(url, function (error, db) {
    var collection = db.collection('products');

    if (error) {
      console.warn('ProductService.findProductById error:', error);

      return;
    }

    collection.find({id: id}).toArray(function (error, result) {
      if (error) {
        callback(true, error);

        return;
      }

      callback(false, result[0] || null);

      db.close();
    });
  });
}
