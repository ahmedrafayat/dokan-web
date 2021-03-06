import {GetServerSideProps, NextPage} from "next";
import Link from "next/link";
import {useRouter} from "next/router";
import React, {useState} from "react";
import {Breadcrumb, Button, Form, InputGroup} from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import {useForm} from "react-hook-form";
import {IoBagCheck, IoCall, IoCard, IoCheckmarkCircleOutline, IoClipboard, IoClose, IoPerson,} from "react-icons/io5";
import {ConfirmSection} from "../../components/ConfirmSection";
import {PageHeader} from "../../components/PageHeader";
import {PAYMENT_METHOD} from "../../constants/appConstants";
import {serviceLinks} from "../../constants/serviceLinks";
import {useAlertContext} from "../../contexts/AlertContext";
import {useCartContext} from "../../contexts/CartContext";
import {OrderRequest} from "../../models/OrderRequest";
import {StoreDetails} from "../../models/StoreDetails";
import {createDefaultAxios} from "../../service/axios";
import {createNewOrder} from "../../service/services";
import styles from "./Checkout.module.scss";


const BD_PHONE_REGEX = /^01[3456789][0-9]{8}\b/g;

type FormData = {
    name: string;
    phone: string;
    address: string;
    notes: string;
};

const FIELD_NAMES = {
    name: "name",
    phone: "phone",
    address: "address",
    notes: "notes",
};

type CheckoutPageProps = {
    storeDetails: StoreDetails;
};

const CheckoutPage: NextPage<CheckoutPageProps> = (props) => {
    const {storeDetails} = props;
    const router = useRouter();
    const {storeId, deliveryMethod} = router.query;

    const {products, cartDispatch} = useCartContext();
    const {alertDispatch} = useAlertContext();
    const {
        register,
        formState: {errors},
        handleSubmit,
    } = useForm();

    const [confirmed, setConfirmed] = useState(false);
    const [showConfirmedModal, setShowConfirmedModal] = useState(false)
    const [orderId, setOrderId] = useState("");

    const getError = (fieldName: string) => {
        let errorKey = Object.keys(errors).find((value) => value === fieldName);
        if (errorKey) {
            return errors[errorKey].message;
        }
        return "";
    };

    const submitForm = async (data: FormData) => {
        const orderRequest: OrderRequest = {
            ...data,
            deliveryMethod: deliveryMethod as string,
            paymentMethod: PAYMENT_METHOD.cashOnDelivery.value,
            totalPrice: products.reduce((prev, current) => {
                return prev + current.numberOrdered * current.price;
            }, 0),
            totalQuantity: products.reduce((prev, current) => {
                return prev + current.numberOrdered;
            }, 0),
            products: products.map((product) => ({
                productId: product.id,
                quantity: product.numberOrdered,
                unitPrice: product.price,
            })),
        };

        try {
            const {data} = await createNewOrder(storeId as string, orderRequest);
            setShowConfirmedModal(true);
            setConfirmed(true);
            setOrderId(data.id);
            alertDispatch({
                type: "show",
                content: {type: "success", message: "Order was successfully placed"},
            });
        } catch (e: any) {
            alertDispatch({
                type: "show",
                content: {
                    type: "danger",
                    message: e.response?.data?.message || "Failed to place order",
                },
            });
        }
    };

    const onBrowseMoreClicked = () => {
        products.forEach((product) => {
            cartDispatch({type: "remove", id: product.id});
        });
        router.push(`/${storeId}/store`).then();
    };

    return (
        <div className="mx-0 mx-md-auto col-12 col-md-10 col-lg-8 col-xl-6 mt-3">
            <PageHeader storeDetails={storeDetails}/>

            <Breadcrumb className="mt-4">
                <Breadcrumb.Item>
                    <Link href={`/${storeId}/store`}>STORE</Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    <Link href={`/${storeId}/cart`}>CART</Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item active>CHECKOUT</Breadcrumb.Item>
            </Breadcrumb>

            <div className={`mt-5 mx-auto  ${styles.checkoutContainer}`}>
                {products.length > 0 ? (
                    <>
                        <h5 className="primary font-weight-bold">
                            {confirmed && orderId
                                ? `ORDER CONFIRMED ${orderId}`
                                : " ORDER INFORMATION"}
                        </h5>
                        <div className="primary">
                            {confirmed && orderId
                                ? "CONGRATULATIONS! YOUR ORDER HAS BEEN PLACED"
                                : "PLEASE FILL OUT THE INFORMATION"}
                        </div>

                        <Form className="mt-4" onSubmit={handleSubmit(submitForm)}>
                            <div className="d-flex flex-column flex-sm-row justify-content-around">
                                <div>
                                    <div className="mb-3">
                                        <InputGroup className="mb-2">
                                            <Form.Control
                                                placeholder="John Doe"
                                                aria-label="name"
                                                aria-describedby="person-icon"
                                                {...register(FIELD_NAMES.name)}
                                                isInvalid={FIELD_NAMES.name in errors}
                                            />
                                            <InputGroup.Text id="person-icon">
                                                <IoPerson size={18} className="primary"/>
                                            </InputGroup.Text>
                                            <Form.Control.Feedback type="invalid">
                                                {getError(FIELD_NAMES.name)}
                                            </Form.Control.Feedback>
                                        </InputGroup>
                                        <div className="text-muted">Name</div>
                                    </div>
                                    <div className="mb-3">
                                        <InputGroup className="mb-2">
                                            <Form.Control
                                                placeholder="01XX XXXXXXX"
                                                aria-label="name"
                                                aria-describedby="phone-icon"
                                                {...register(FIELD_NAMES.phone, {
                                                    required: "Phone Number is required",
                                                    pattern: {
                                                        value: BD_PHONE_REGEX,
                                                        message: "Enter a valid number",
                                                    },
                                                })}
                                                isInvalid={FIELD_NAMES.phone in errors}
                                            />
                                            <InputGroup.Text id="phone-icon">
                                                <IoCall size={18} className="primary"/>
                                            </InputGroup.Text>
                                            <Form.Control.Feedback type="invalid">
                                                {getError(FIELD_NAMES.phone)}
                                            </Form.Control.Feedback>
                                        </InputGroup>
                                        <div className="text-muted">Phone</div>
                                    </div>
                                    <div className="mb-3">
                                        <InputGroup className="mb-2">
                                            <Form.Control
                                                placeholder="Narnia"
                                                aria-label="Address"
                                                aria-describedby="address-icon"
                                                {...register(FIELD_NAMES.address, {
                                                    required: "Address is required",
                                                })}
                                                isInvalid={FIELD_NAMES.address in errors}
                                            />
                                            <InputGroup.Text id="address-icon">
                                                <IoCard size={18} className="primary"/>
                                            </InputGroup.Text>
                                            <Form.Control.Feedback type="invalid">
                                                {getError(FIELD_NAMES.address)}
                                            </Form.Control.Feedback>
                                        </InputGroup>
                                        <div className="text-muted">Address</div>
                                    </div>
                                    <div className="mb-3">
                                        <InputGroup className="mb-2">
                                            <Form.Control
                                                placeholder="Call beforehand"
                                                aria-label="special-note"
                                                aria-describedby="note-icon"
                                                {...register(FIELD_NAMES.notes)}
                                                isInvalid={FIELD_NAMES.notes in errors}
                                            />
                                            <InputGroup.Text id="note-icon">
                                                <IoClipboard size={18} className="primary"/>
                                            </InputGroup.Text>
                                            <Form.Control.Feedback type="invalid">
                                                {getError(FIELD_NAMES.notes)}
                                            </Form.Control.Feedback>
                                        </InputGroup>
                                        <div className="text-muted">Special Note</div>
                                    </div>
                                </div>
                                <div>
                                    <ConfirmSection deliveryMethod={deliveryMethod}/>
                                    {confirmed && orderId ? (
                                        <div className="mb-3">
                                            <InputGroup className="mb-2">
                                                <Form.Control
                                                    value={orderId}
                                                    aria-label="orderId"
                                                    aria-describedby="bag-icon"
                                                />
                                                <InputGroup.Text id="bag-icon">
                                                    <IoBagCheck size={18} className="primary"/>
                                                </InputGroup.Text>
                                            </InputGroup>
                                            <div className="text-muted">Name</div>
                                        </div>
                                    ) : (
                                        <div className="mb-3 d-flex justify-content-end">
                                            <button
                                                type="submit"
                                                className="btn colored-button d-flex align-items-center"
                                            >
                                                <IoCheckmarkCircleOutline size={25} className="pr-2"/>
                                                <span>CONFIRM ORDER</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Form>
                        {confirmed && orderId && (
                            <div className="d-flex flex-column align-items-center">
                                <div className="primary mb-2">
                                    SAVE ORDER ID FOR FUTURE REFERENCE
                                </div>
                                <button
                                    className="btn colored-button"
                                    onClick={onBrowseMoreClicked}
                                >
                                    BROWSE FOR MORE PRODUCTS
                                </button>
                            </div>
                        )}
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
          <Modal show={showConfirmedModal} onHide={()=> setShowConfirmedModal(false)} animation={true} centered>
              <Modal.Header>
                  <Modal.Title className="primary">Congratulations !!</Modal.Title>
                  <Button variant="light" onClick={()=>setShowConfirmedModal(false)}>
                      <IoClose size={20} />
                  </Button>
              </Modal.Header>

              <Modal.Body>
                  <p>Your order has been placed. Please save order id : {orderId} for future reference</p>
              </Modal.Body>
          </Modal>
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
            const {data} = await axios.get(serviceLinks.storeDetails(storeUrlName));
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

export default CheckoutPage;
