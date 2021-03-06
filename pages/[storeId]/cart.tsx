import type { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useCallback, useState } from "react";
import { Breadcrumb, Form } from "react-bootstrap";
import { IoInformationCircleOutline } from "react-icons/io5";
import { PageHeader } from "../../components/PageHeader";
import { ProductPricingCard } from "../../components/ProductPricingCard";
import { DELIVERY_METHOD } from "../../constants/appConstants";
import { serviceLinks } from "../../constants/serviceLinks";
import { useCartContext } from "../../contexts/CartContext";
import { StoreDetails } from "../../models/StoreDetails";
import { createDefaultAxios } from "../../service/axios";
import styles from "./Cart.module.scss";

type CartPageProps = {
  storeDetails: StoreDetails;
};

const CartPage: NextPage<CartPageProps> = (props) => {
  const { storeDetails } = props;
  const { products, cartDispatch } = useCartContext();
  const [deliveryMethod, setDeliveryMethod] = useState(
    DELIVERY_METHOD.STORE_PICKUP.value
  );
  const router = useRouter();
  const { storeId } = router.query;

  const incrementQuantity = useCallback(
    (id: string) => {
      cartDispatch({
        type: "increment",
        id: id,
      });
    },
    [cartDispatch]
  );

  const decrementQuantity = useCallback(
    (id: string) => {
      cartDispatch({
        type: "decrement",
        id: id,
      });
    },
    [cartDispatch]
  );

  const removeFromCart = useCallback(
    (id: string) => {
      cartDispatch({
        type: "remove",
        id: id,
      });
    },
    [cartDispatch]
  );

  const onCheckoutClicked = async () => {
    await router.push({
      pathname: `/${storeId}/checkout`,
      query: { deliveryMethod: deliveryMethod },
    });
  };

  return (
    <div className="mx-0 mx-md-auto col-12 col-md-10 col-lg-8 col-xl-6 mt-3">
      <PageHeader storeDetails={storeDetails} />

      <Breadcrumb className="mt-4">
        <Breadcrumb.Item>
          <Link href={`/${storeId}/store`}>STORE</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item active>CART</Breadcrumb.Item>
      </Breadcrumb>

      <div className={`mt-4 mx-auto  ${styles.cartContainer}`}>
        {products.length ? (
          <>
            <h5 className="primary font-weight-bold">DELIVERY METHOD</h5>
            <Form className="mt-2">
              <Form.Check
                inline
                name="delivery"
                type="radio"
                id={DELIVERY_METHOD.HOME_DELIVERY.value}
                label="Home Delivery"
                onChange={(event) => setDeliveryMethod(event.target.id)}
              />
              <Form.Check
                inline
                name="delivery"
                type="radio"
                id={DELIVERY_METHOD.STORE_PICKUP.value}
                label="Store Pickup"
                onChange={(event) => setDeliveryMethod(event.target.id)}
                defaultChecked
              />
            </Form>

            <div className="d-flex mt-1">
              <IoInformationCircleOutline
                size={20}
                className={styles.infoIcon}
              />
              <h6 className="text-muted ml-1">
                For home delivery, additional charge might be added. Please
                discuss with seller beforehand.
              </h6>
            </div>

            <div className="mt-3">
              <h5 className="primary font-weight-bold">YOUR CART</h5>
              <span className="primary">
                INCREASE OR DECREASE QUANTITY BASED ON YOUR NEEDS
              </span>
            </div>

            <div className="mt-4">
              <div className="d-flex justify-content-between">
                <h6 className="primary font-weight-bold w-50">
                  PRODUCT DETAILS
                </h6>
                <h6 className="primary font-weight-bold w-25 text-center">
                  QUANTITY
                </h6>
                <h6 className="primary font-weight-bold w-25 text-center">
                  PRICE
                </h6>
              </div>
            </div>

            <div className={`mt-2 ${styles.productContainer}`}>
              {products
                .sort((firsProduct, secondProduct) => {
                  if (firsProduct.id > secondProduct.id) return 1;
                  else return -1;
                })
                .map((product) => (
                  <ProductPricingCard
                    key={product.id}
                    product={product}
                    increment={incrementQuantity}
                    decrement={decrementQuantity}
                    remove={removeFromCart}
                  />
                ))}
            </div>

            <hr className={styles.divider} />
            <div className="d-flex justify-content-between">
              <h5 className="w-75 font-weight-bold">TOTAL PRICE</h5>
              <h5 className="w-25 font-weight-bold text-center">
                {products.reduce((prev, current) => {
                  return prev + current.numberOrdered * current.price;
                }, 0)}
              </h5>
            </div>

            <div className="d-flex justify-content-end mt-3">
              <div className="w-25 d-flex justify-content-center">
                <button
                  type="submit"
                  className="btn colored-button"
                  onClick={onCheckoutClicked}
                >
                  CHECKOUT
                </button>
              </div>
            </div>
          </>
        ) : (
          <h3 className="text-center">
            You haven&apos;t added any products to cart.{" "}
            <Link href={`/${storeId}/store`} passHref>
              <span className="primary" role="button">
                Go to store
              </span>
            </Link>
          </h3>
        )}
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const axios = createDefaultAxios();
  const storeUrlName = context.params?.storeId || "";
  let storeDetails: StoreDetails = {
    address: "",
    phoneNumber: "",
    storeName: "",
  };
  let error = null;
  if (typeof storeUrlName === "string") {
    try {
      const { data } = await axios.get(serviceLinks.storeDetails(storeUrlName));
      storeDetails = data;
    } catch (e: unknown) {
      error = "ERRORRR!!!";
    }
  } else {
    error = "ERRORRR!!!";
  }
  return {
    props: {
      storeDetails,
      error,
    },
  };
};

export default CartPage;
