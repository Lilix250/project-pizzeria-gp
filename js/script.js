/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
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
      });
    }

    processOrder(){
      const thisProduct = this;
      
      const formData = utils.serializeFormToObject(thisProduct.form);

      console.log('thisProduct', thisProduct);
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
              } else if (img) {
                img.classList.remove(classNames.menuProduct.imageVisible);
              }
            }
          }            
        }
      }

      price *= thisProduct.amountWidget.value;
      thisProduct.priceElem = price;
      console.log('thisProduct.priceElem', thisProduct.priceElem);
    }
  }
  
  class AmountWidget {
    constructor(element){
      const thisWidget = this;
      
      thisWidget.value = settings.amountWidget.defaultValue;
      thisWidget.getElements(element);
      thisWidget.initActions();

      console.log('AmountWidget', thisWidget);
      console.log('constructor arguments:', element);
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
      };
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

      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
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

    
    init: function(){
      const thisApp = this;
      
      console.log('thisApp.data', thisApp.data);
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      
      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}