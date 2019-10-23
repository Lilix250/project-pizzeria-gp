import AmountWidget from './AmountWidget.js';
import { select } from '../settings.js';

class CartProduct {
  constructor(menuProduct, element) {
    const thisCartProduct = this;

    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.price = menuProduct.priceSingle * menuProduct.amount;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.amount = menuProduct.amount;

    thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));
    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();
  }

  getElements(element) {
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

    amountWidget.addEventListener('updated', function () {
      thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
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

  getData(){
    const thisCartProduct = this;
    
    return {
      id: thisCartProduct.id,
      amount: thisCartProduct.amount,
      price: thisCartProduct.price,
      priceSingle: thisCartProduct.proceSingle,
      params: thisCartProduct.params,
    };
  }
}

export default CartProduct;