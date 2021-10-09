import React, {Dispatch, useContext, useReducer} from "react";

const EMPTY: CartContext = {
    products: [],
    cartDispatch: () => console.error("Dispatch was uninitialized")
}

type CarProviderProps = {
    children: React.ReactNode
}

export type CartProduct = {
    id: string
    name: string
    price: number
    description: string
    quantity: number
    featuredImage: string
    stock: number
}

type CartActions = {
    type: 'add',
    product: CartProduct
} | {
    type: 'increment' | 'decrement' | 'remove',
    id: string,
}

type CartContext = {
    products: CartProduct[]
    cartDispatch: Dispatch<CartActions>
}

const cartReducer = (state: CartProduct[], action: CartActions): CartProduct[] => {
    switch (action.type) {
        case "add":
            let newState = state.
            filter(item => item.id !== action.product.id)
            return [...newState, action.product];
        case "remove":
            return state.filter(item => item.id !== action.id)
        case "increment":
            let productToIncrement = state.find(product => product.id === action.id)
            if (productToIncrement) {
                let newState = state.filter(item => item.id !== action.id);
                let newAmount = productToIncrement.quantity + 1;
                return [...newState, {...productToIncrement,quantity: newAmount}];
            }
            return state;
        case "decrement":
            let productToDecrement = state.find(product => product.id === action.id)
            if (productToDecrement) {
                let newState = state.filter(item => item.id !== action.id);
                let newAmount = productToDecrement.quantity - 1;

                return [...newState, {...productToDecrement, quantity: newAmount}];
            }
            return state;
    }
}

const CartContext = React.createContext(EMPTY);

export const useCartContext = () => {
    return useContext(CartContext);
}

export const CartContextProvider = (props: CarProviderProps) => {
    const [state, dispatch] = useReducer(cartReducer, EMPTY.products)

    return (
        <CartContext.Provider value={{products: state, cartDispatch: dispatch}}>
            {props.children}
        </CartContext.Provider>
    )
}
