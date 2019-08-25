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
      thisProduct.processOrder();
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
      console.log('final price', price);
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