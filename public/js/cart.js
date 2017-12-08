var App = App || {};

App.Challenge = {

  /*
  * Adiciona um novo produto ao carrinho
  *
  * @param id:Integer - Product Id
  */
  addItemToCart: function addItemToCart(id){
    axios.get('/cart/add/' + id).then(function get(response) {
      App.Challenge.buildCartItemMrkp(response);
      App.Challenge.updateLockIcon();
    });
  },

  /*
  * Adiciona os eventos a lista de produtos
  */
  bindItem: function bindItem(){
    // Adiciona um item ao carrinho
    $('.product-list').on('click', 'li', function click(){
      var id = this.getAttribute("data-id");

      App.Challenge.addItemToCart(id);
      App.Challenge.showCart();
    });

    // Remove um item do carrinho
    $('#cart').on('click', '.remove-bt', function click(){
      App.Challenge.removeCartItem($(this).data('id'));
    });

    // Mostra o carrinho de compras
    $('body').on('click', '.has-items', function click(){
      App.Challenge.showCart();
    });
  },

  /*
  * Cria o markup da lista de produtos no carrinho
  * TODO: trocar por uma engine de template
  *
  * @param response:Object - Lista de produtos
  */
  buildCartItemMrkp: function buildCartItemMrkp(response){
    var cartList = document.getElementById('cart');
    var html;
    var item;
    var items = response.data.items;
    var key;

    cartList.innerHTML = '';

    for (key in items){
      item = items[key];

      console.log(item);

      html = '<li>';
      html += '<figure class="thumb"><img src="images/' + item.image + '" /></figure>';
      html += '<div class="details">';
      html += '<span class="cart-item-title">' + item.title + '</span>';
      html += '<span class="cart-item-size">' + item.availableSizes.toString() + '</span>';
      html += '<span class="cart-item-qtd">Quantidade: ' + item.quantity + '</span>';
      html += '<div class="action-area">';
      html += '<button type="button" class="remove-bt" data-id="' + item.id + '">X</button>';
      html += '</div>';
      html += '<span class="cart-item-price">R$49,90</span>';
      html += '</div>';
      html += '</li>';

      $('#cart-list ul').append(html);
    }
  },

  /*
  * Cria o markup da lista de produtos
  * TODO: trocar por uma engine de template
  *
  * @param response:Object - Lista de produtos
  */
  buildProductList: function buildProductList(response) {
    var html = '<ul class="product-list">';
    var item;
    var key;
    var priceBig;
    var priceDecimal;

    for (key in response.data) {
      if (response.data.hasOwnProperty(key)) {
        item = response.data[key];

        priceBig = item.price.toString().split(".")[0];
        priceDecimal = item.price.toString().split(".")[1];

        html += '<li class="item" data-id="' + item.id + '">';
        html += '<figure><img src="images/' + item.image + '" alt="' + item.title + '" /></figure>';
        html += '<span class="item-title">' + item.title + '</span>';
        html += '<span class="wrap-hr"><hr></span>';
        html += '<span class="item-price">'+ item.currencyFormat + '<b>' + priceBig + '</b>.' + priceDecimal + '</span>';
        html += '<span class="item-installment">ou '+ item.installments + 'x de ' + item.currencyFormat + (item.price / item.installments).toFixed(2) +'</span>';
        html +=  '</li>';
      }
    }

    html +=  '</ul>';

    $('.store').append(html);

    App.Challenge.bindItem();
  },

  /*
  * Carrega a lista de produtos adicionas do carrinho
  */
  getCartList: function getCartList() {
    axios.get('/cart/').then(function success(response) {
      App.Challenge.buildCartItemMrkp(response);
    });
  },

  /*
  * Executa requisições ajax
  *
  * @param url:String - Url da requisição
  */
  getData: function getData(url){
    axios.get(url).then(function get(response) {
      App.Challenge.buildProductList(response);
    });
  },

  /*
  * Esconde o carrinho de compras
  */
  hiddenCart: function hiddenCart(){
    $('.toogle-cart').on('click', function click(){
      $('#cart-list').removeClass('open');
    });
  },

  /*
  * Construtor da classe Challenge
  */
  init: function init() {
    App.Challenge.getData('/products');
    App.Challenge.getCartList();
    App.Challenge.bindItem();
    App.Challenge.updateLockIcon();
    App.Challenge.hiddenCart();
  },

  /*
  * Remove um item do carrinho de compras
  *
  * @param id:Integer - Product Id
  */
  removeCartItem: function removeCartItem(id){
    axios.get('/cart/remove/' + id).then(function get(response) {
      App.Challenge.buildCartItemMrkp(response);
      App.Challenge.getCartList();
      App.Challenge.updateLockIcon();
    });
  },

  /*
  * Mostra o carrinho de compras
  */
  showCart: function showCart(){
    $('#cart-list').addClass('open');
  },

  /*
  * Atualiza o contador de produtos no carrinho
  */
  updateLockIcon: function updateLockIcon(){
    var hasItemsInside = document.getElementsByClassName('header-cart');
    var hasItemsOut = document.getElementsByClassName('has-items');

    $('.has-items, .header-cart').find('.badge, .lock').remove();

    axios.get('/cart/').then(function get(response) {
      var data = response.data.items;
      var html
      var key;
      var quantityVal = [];
      var sum;

      if(data){
        for (key in data) {
          quantityVal.push(data[key].quantity);
        }

        sum = quantityVal.reduce(function reduce(a, b) {
          return a + b;
        }, 0);

        html = '<i class="lock"></i><span class="badge">' + sum + '</span>';

        if (quantityVal && sum > 0) {
          $(hasItemsOut).append(html);
          $(hasItemsInside).append(html);
        }

        return;
      }

      $('#cart-list')
        .animate({
          right: -700
        }, 'fast')
        .removeClass('visible');
    });
  },
};

App.Challenge.init();
