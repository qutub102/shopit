import axios from "axios";
import {
  ADD_TO_CART,
  CLEAR_CART,
  REMOVE_CART,
  SAVE_SHIPPING_INFO,
} from "../constants/cartConstant";

export const addItemToCart = (id, quantity) => async (dispatch, getState) => {
  const { data } = await axios.get(`/api/v1/product/${id}`);

  dispatch({
    type: ADD_TO_CART,
    payload: {
      product: data.product._id,
      name: data.product.name,
      price: data.product.price,
      image: data.product.images[0].url,
      quantity,
    },
  });

  localStorage.setItem("cart", JSON.stringify(getState().cart.cartItems));
};

export const removeCart = (id) => (dispatch) => {
  dispatch({
    type: REMOVE_CART,
    payload: id,
  });
  localStorage.removeItem("cart");
};

export const clearCart = () => (dispatch) => {
  dispatch({
    type: CLEAR_CART,
  });
};

export const saveShippingInfo = (data) => async (dispatch) => {
  dispatch({
    type: SAVE_SHIPPING_INFO,
    payload: data,
  });

  localStorage.setItem("shippingInfo", JSON.stringify(data));
};
