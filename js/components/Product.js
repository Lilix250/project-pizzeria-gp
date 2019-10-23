import AmountWidget from './AmountWidget.js';
import {select, classNames, templates } from '../settings.js';
import utils from '../utils.js';
import { app } from '../app.js';

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

    const allProducts = app.data.products;
    const product = allProducts.find(function (prod) { return prod.id === thisProduct.id; });
    if (product && product.params){
      const ingredientParams = product.params;
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

    //app.cart.add(thisProduct);//

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });
    
    thisProduct.element.dispatchEvent(event);
  }

}

export default Product;