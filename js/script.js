/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };
  
  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };
  
  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
  
  };
  
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };
  
  class Product {
    constructor(id, data){
      const thisProduct = this; 

      thisProduct.id = id;
      thisProduct.data = data;
      
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
    }

    initAmountWidget() {
      const thisProduct = this; 

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

      thisProduct.amountWidgetElem.addEventListener('updated', function() {
        thisProduct.processOrder();
      });
    }

    renderInMenu(){
      const thisProduct = this;

      const generatedHTML = templates.menuProduct(thisProduct.data);
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      const menuContainer = document.querySelector(select.containerOf.menu);
      menuContainer.appendChild(thisProduct.element);
    }
    
    getElements(){
      const thisProduct = this;
    
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }
    
    initAccordion(){
      const thisProduct = this;
      thisProduct.accordionTrigger.addEventListener('click', function(event) {
        event.preventDefault();
        thisProduct.element.classList.add('active');
        const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
        for(let activeProduct of activeProducts){
          if (activeProduct != thisProduct.element){
            activeProduct.classList.remove('active');
          }
        }
      });
    
    }

    initOrderForm(){
      const thisProduct = this;

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
      
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    processOrder(){
      const thisProduct = this;
      
      const formData = utils.serializeFormToObject(thisProduct.form);

      thisProduct.params = {

      };
      let price = thisProduct.data.price;

      const allProducts = dataSource.products;
      if (allProducts[thisProduct.id].params){
        const ingredientParams = allProducts[thisProduct.id].params;
        for (let ingredientParamKey in ingredientParams){
          const ingredientOptions = ingredientParams[ingredientParamKey].options;
          for (let key in ingredientOptions){
            if (formData[ingredientParamKey]) {
              let selectedIngredient = false; 
              for(let ingredient of formData[ingredientParamKey]){
                if (key == ingredient){
                  selectedIngredient = true;
                }
              }
              if (selectedIngredient == true && !ingredientOptions[key].default){
                price += ingredientOptions[key].price;
              } else if (selectedIngredient == false && ingredientOptions[key].default == true){
                price -= ingredientOptions[key].price;
              }
              const img = thisProduct.imageWrapper.querySelector('.' + ingredientParamKey + '-' + key);
              if (img && selectedIngredient == true){
                img.classList.add(classNames.menuProduct.imageVisible);

                if(!thisProduct.params[ingredientParamKey]){
                  thisProduct.params[ingredientParamKey] = {
                    label: ingredientParams[ingredientParamKey].label,
                    options: {},
                  };
                }
                thisProduct.params[ingredientParamKey].options[key] = ingredientParams[ingredientParamKey].options[key].label;

              } else if (img) {
                img.classList.remove(classNames.menuProduct.imageVisible);
              }
            }
          }            
        }
      }

      //price *= thisProduct.amountWidget.value;
      //thisProduct.priceElem = price;//
      /* multiply price by amount */
      thisProduct.priceSingle = price;
      thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

      /* set the contents of thisProduct.priceElem to be the value of variable price */
      thisProduct.priceElem.innerHTML = thisProduct.price;

      //console.log('thisProduct.priceElem', thisProduct.priceElem);
    }

    addToCart() {
      const thisProduct = this;

      thisProduct.name = thisProduct.data.name;

      thisProduct.amount = thisProduct.amountWidget.value;

      app.cart.add(thisProduct);
    }

  }
  
  class AmountWidget {
    constructor(element){
      const thisWidget = this;
      
      thisWidget.value = settings.amountWidget.defaultValue;
      thisWidget.getElements(element);
      thisWidget.initActions();
    }
    
    getElements(element){
      const thisWidget = this;
    
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
      thisWidget.setValue(thisWidget.input.value);
    }
    
    setValue(value){
      const thisWidget = this;

      const newValue = parseInt(value);

      if (thisWidget.value != newValue && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
        thisWidget.value = newValue;
        thisWidget.announce();
      }
      thisWidget.input.value = thisWidget.value;
    }
    
    initActions(){
      const thisWidget = this;
      thisWidget.input.addEventListener('change', function() {
        thisWidget.setValue(thisWidget.input.value);
      }); 
      thisWidget.linkDecrease.addEventListener('click', function(){
        thisWidget.setValue(thisWidget.value -1);
      });
      thisWidget.linkIncrease.addEventListener('click', function() {
        thisWidget.setValue(thisWidget.value +1);
      });
    }

    announce() {
      const thisWidget = this; 

      const event = new CustomEvent('updated', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);
    }
  }

  class Cart {
    constructor(element){
      const thisCart = this;

      thisCart.products = [];
      
      thisCart.getElements(element);
      thisCart.initActions();

      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    }

    initActions(){
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function() {
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
      
      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      });

      thisCart.dom.productList.addEventListener('remove', function(event){
        thisCart.remove(event.detail.cartProduct);
      });

    }

    remove(cartProduct){
      const thisCart = this;
      const index = thisCart.products.indexOf(cartProduct);
      console.log('cartProduct.dom.wrapper', cartProduct.dom.wrapper);
      thisCart.products.splice(index, 1);

      cartProduct.dom.wrapper.remove();
      thisCart.update();
    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {};

      thisCart.dom.wrapper = element;

      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);

      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      
      thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];

      for(let key of thisCart.renderTotalsKeys){
        thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
      }
    }



    add(menuProduct) {
      const thisCart = this;

      const generatedHTML = templates.cartProduct(menuProduct);
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);

      thisCart.dom.productList += generatedDOM;

      const menuContainer = document.querySelector(select.cart.productList);
      menuContainer.appendChild(generatedDOM);

      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));

      thisCart.update();
    }

    update(){
      const thisCart = this;
      
      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;

      for(let thisCartProduct of thisCart.products){
        thisCart.subtotalPrice = thisCart.subtotalPrice + thisCartProduct.price;
        thisCart.totalNumber = thisCart.totalNumber + thisCartProduct.amount;
      }
      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
     
      console.log('thisCart.totalNumber', thisCart.totalNumber);
      console.log('thisCart.subtotalPrice', thisCart.subtotalPrice);
      console.log('thisCart.totalPrice',thisCart.totalPrice);

      for(let key of thisCart.renderTotalsKeys) {
        for(let elem of thisCart.dom[key]) {
          elem.innerHTML = thisCart[key];
        }
      }
    }
  }

  class CartProduct {
    constructor(menuProduct, element){
      const thisCartProduct = this;
     
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.price = menuProduct.priceSingle*menuProduct.amount;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.amount = menuProduct.amount;

      thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));
      thisCartProduct.getElements(element); 
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();
    }

    getElements(element){
      const thisCartProduct = this;
      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = select.cartProduct.amountWidget;
      thisCartProduct.dom.price = select.cartProduct.price;
      thisCartProduct.dom.edit = select.cartProduct.edit;
      thisCartProduct.dom.remove = select.cartProduct.remove;
    }

    initAmountWidget() {
      const thisCartProduct = this; 

      const wrapper = thisCartProduct.dom.wrapper;
      const amountWidget = wrapper.querySelector(thisCartProduct.dom.amountWidget);
      thisCartProduct.amountWidget = new AmountWidget(amountWidget);

      amountWidget.addEventListener('updated', function() {
        thisCartProduct.price = thisCartProduct.priceSingle*thisCartProduct.amount;
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        wrapper.querySelector(thisCartProduct.dom.price).innerHTML = thisCartProduct.price;

      });
    }

    remove() {
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });
      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }

    initActions() {
      const thisCartProduct = this;
      console.log('thisCartProduct', thisCartProduct);
      const editBtn = thisCartProduct.dom.wrapper.querySelector(thisCartProduct.dom.edit);
      editBtn.addEventListener('click', function(event) {
        event.preventDefault();
      });
      const removeBtn = thisCartProduct.dom.wrapper.querySelector(thisCartProduct.dom.remove);
      removeBtn.addEventListener('click', function(event) {
        event.preventDefault();
        console.log('removing');
        thisCartProduct.remove();
      });

    }
  }
    
  const app = {
    initMenu: function(){
      const thisApp = this;

      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },
    
    initData: function(){
      const thisApp = this;
    
      thisApp.data = dataSource;
    },


    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },


    
    init: function(){
      const thisApp = this;
      
  

      
      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();
}