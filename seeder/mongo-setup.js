/*
* Seeder de produtos
*/
var fs = require('fs');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost:27017/products';

MongoClient.connect(url, function connect(err, db) {
  var productsData = JSON.parse(fs.readFileSync('./data/products.json', 'utf8'));

  db.collection('products').insert(productsData.products, function insert(error, result) {
    if (error) {
      console.warn('Seeder Error:', error);

      return;
    }

    console.log('Seeder Success!');

    db.close();
  });
});
