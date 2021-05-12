import {
  ADD_TO_CART,
  CLEAR_CART,
  REMOVE_CART,
  SAVE_SHIPPING_INFO,
} from "../constants/cartConstant";

export const addToCartReducer = (
  state = { cartItems: [], shippingInfo: {} },
  action
) => {
  switch (action.type) {
    case ADD_TO_CART:
      const item = action.payload;
      const isItemExist = state.cartItems.find(
        (i) => i.product === item.product
      );

      if (isItemExist) {
        return {
          ...state,
          cartItems: state.cartItems.map((i) =>
            i.product === isItemExist.product ? item : i
          ),
        };
      } else {
        return {
          ...state,
          cartItems: [...state.cartItems, item],
        };
      }
    case REMOVE_CART:
      const newCart = state.cartItems.filter(
        (i) => i.product !== action.payload
      );
      localStorage.setItem("cart", JSON.stringify(newCart));
      return {
        ...state,
        cartItems: newCart,
      };
    case SAVE_SHIPPING_INFO:
      return {
        ...state,
        shippingInfo: action.payload,
      };
    case CLEAR_CART:
      return {
        ...state,
        cartItems: [],
      };
    default:
      return state;
  }
};
