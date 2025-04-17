CREATE TABLE public.addresses (
    addressid integer NOT NULL,
    userid integer NOT NULL,
    addresstype character varying(4) NOT NULL,
    username character varying(64) NOT NULL,
    contactnumber character varying(10) NOT NULL,
    addressline1 character varying(128) NOT NULL,
    addressline2 character varying(128),
    city character varying(60) NOT NULL,
    state character varying(16) NOT NULL,
    country character varying(56) NOT NULL,
    postalcode character varying(8) NOT NULL,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updatedat timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_default boolean NOT NULL
);

CREATE TABLE public.articles (
    article_id integer NOT NULL,
    category character varying(24),
    title character varying(255) NOT NULL,
    imglink character varying(255),
    imgalt character varying(255),
    author character varying(100) NOT NULL,
    published_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    content text
);

CREATE TABLE public.banners (
    bannerid integer NOT NULL,
    toptitle character varying(255) NOT NULL,
    middletitle character varying(255) NOT NULL,
    bottomtitle character varying(255) NOT NULL,
    imglink character varying(255) NOT NULL,
    startprice numeric(10,2) NOT NULL,
    buttontitle character varying(255) NOT NULL,
    redirect_link character varying(255) DEFAULT ''::character varying,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updatedat timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.cartitems (
    cartitemid integer NOT NULL,
    userid integer,
    productid integer,
    quantity integer NOT NULL,
    sizeid integer,
    colorid integer,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updatedat timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.categories (
    categoryid integer NOT NULL,
    name character varying(50) NOT NULL,
    slug character varying(100) NOT NULL,
    maincategory character varying(15)
);

CREATE TABLE public.contact_queries (
    queryid integer NOT NULL,
    name character varying(255),
    email character varying(255),
    number character varying(10),
    method character varying(10),
    message text
);

CREATE TABLE public.coupons (
    couponid integer NOT NULL,
    code character varying(50) NOT NULL,
    description text,
    discountpercentage numeric(5,2),
    maxdiscountamount numeric(10,2),
    minpurchaseamount numeric(10,2),
    validfrom timestamp without time zone,
    validuntil timestamp without time zone,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updatedat timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.deals (
    dealid integer NOT NULL,
    productid integer NOT NULL,
    end_time timestamp without time zone NOT NULL,
    sold integer,
    available integer
);

CREATE TABLE public.giftcards (
    cardid integer NOT NULL,
    cardname character varying(255) NOT NULL,
    cardcode character varying(100) NOT NULL,
    description text,
    balance numeric(10,2) NOT NULL,
    currency character varying(10) NOT NULL,
    expirydate date NOT NULL,
    recipientname character varying(100),
    recipientemail character varying(100),
    sendername character varying(100),
    senderemail character varying(100),
    message text,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updatedat timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(50) DEFAULT 'Active'::character varying
);

CREATE TABLE public.orderitems (
    orderitemid integer NOT NULL,
    orderid integer,
    productid integer,
    quantity integer,
    shippingid integer,
    paymentid integer,
    colorid integer,
    sizeid integer
);

CREATE TABLE public.orders (
    orderid integer NOT NULL,
    userid integer,
    totalamount numeric(10,2) NOT NULL,
    orderstatus character varying(50) DEFAULT 'Pending'::character varying,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updatedat timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    order_code character varying(4)
);

CREATE TABLE public.payments (
    paymentid integer NOT NULL,
    orderid integer,
    paymentmethod character varying(100),
    paymentstatus character varying(50) DEFAULT 'Pending'::character varying,
    amount numeric(10,2) NOT NULL,
    transactionid character varying(100),
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updatedat timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    billingaddress integer,
    paymentgateway_id character varying(255)
);

CREATE TABLE public.productcolors (
    colorid integer NOT NULL,
    productid integer,
    colorname character varying(50) NOT NULL,
    colorclass character varying(50)
);

CREATE TABLE public.productimages (
    imageid integer NOT NULL,
    productid integer,
    imglink character varying(255) NOT NULL,
    imgalt character varying(255),
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    isprimary boolean
);

CREATE TABLE public.productparams (
    productid integer NOT NULL,
    issale boolean,
    isnew boolean,
    isdiscount boolean,
    stars double precision,
    views integer DEFAULT 0,
    sold integer DEFAULT 0,
    rating integer DEFAULT 0
);

CREATE TABLE public.products (
    productid integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    categoryid integer,
    price numeric(10,2) NOT NULL,
    discount numeric(5,2),
    stock integer NOT NULL,
    tags character varying(255),
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updatedat timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    imgid character varying(50),
    seller_id integer
);

CREATE TABLE public.productsizes (
    sizeid integer NOT NULL,
    productid integer,
    sizename character varying(10) NOT NULL,
    instock boolean NOT NULL
);

CREATE TABLE public.reviews (
    reviewid integer NOT NULL,
    userid integer NOT NULL,
    productid integer NOT NULL,
    rating double precision NOT NULL,
    comment text,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedat timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    title character varying(50) NOT NULL,
    CONSTRAINT reviews_rating_check CHECK (((rating >= (1)::double precision) AND (rating <= (5)::double precision)))
);

CREATE TABLE public.savedpaymentcards (
    cardid integer NOT NULL,
    userid integer NOT NULL,
    cardnumber character varying(16) NOT NULL,
    cardholdername character varying(100) NOT NULL,
    expirymonth integer NOT NULL,
    expiryyear integer NOT NULL,
    cardtype character varying(50),
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updatedat timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.sellers (
    seller_id integer NOT NULL,
    name character varying(100),
    email character varying(100),
    password character varying(255),
    phone_number character varying(20),
    company_name character varying(255),
    tax_id character varying(50),
    registration_number character varying(50),
    store_url character varying(255),
    business_description text,
    profile_image_url character varying(255),
    join_date date,
    rating numeric(3,2),
    addressline1 character varying(255),
    addressline2 character varying(255),
    city character varying(100),
    state character varying(100),
    country character varying(100),
    postalcode character varying(20)
);


CREATE TABLE public.shipping (
    shippingid integer NOT NULL,
    orderid integer,
    addressid integer,
    shippingmethod character varying(100),
    shippingcost numeric(10,2),
    trackingnumber character varying(100),
    shippedat timestamp without time zone,
    deliveredat timestamp without time zone,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updatedat timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.usercoupons (
    usercouponid integer NOT NULL,
    userid integer NOT NULL,
    couponid integer NOT NULL,
    usedat timestamp without time zone,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updatedat timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.users (
    userid integer NOT NULL,
    username character varying(64) NOT NULL,
    email character varying(128) NOT NULL,
    password character varying(255) NOT NULL,
    mobile_number character varying(10) NOT NULL,
    dob character varying(10) NOT NULL,
    creation_ip inet,
    role character varying(50) DEFAULT 'customer'::character varying,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedat timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_ip inet,
    otp character varying(4),
    promotional boolean
);

CREATE TABLE public.wishlistitems (
    wishlistitemid integer NOT NULL,
    userid integer NOT NULL,
    productid integer NOT NULL,
    addedat timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
