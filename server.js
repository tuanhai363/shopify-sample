require('isomorphic-fetch');
const dotenv = require('dotenv');
const Koa = require('koa');
const next = require('next');
const { default: createShopifyAuth } = require('@shopify/koa-shopify-auth');
const { verifyRequest } = require('@shopify/koa-shopify-auth');
const session = require('koa-session');
const bodyParser = require('koa-bodyparser');
const mysql = require('mysql');

dotenv.config();
const { default: graphQLProxy } = require('@shopify/koa-shopify-graphql-proxy');
const { ApiVersion } = require('@shopify/koa-shopify-graphql-proxy');
const Router = require('koa-router');
const {receiveWebhook, registerWebhook} = require('@shopify/koa-shopify-webhooks');
const router = require('./server/routes-webhook');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const Shopify = require('shopify-api-node');

const {
    SHOPIFY_API_SECRET_KEY,
    SHOPIFY_API_KEY,
    HOST,
    API_VERSION,
    SHOP_NAME,
    API_KEY,
    PASSWORD
} = process.env;
app.prepare().then(() => {
    const server = new Koa();
    const shopify = new Shopify({
        shopName: SHOP_NAME, apiKey: API_KEY, password: PASSWORD
    });
    // const router = new Router();
    server.use(session({ secure: true, sameSite: 'none' }, server));
    server.keys = [SHOPIFY_API_SECRET_KEY];
    // server.use(bodyParser());
    server.use(
        createShopifyAuth({
            apiKey: SHOPIFY_API_KEY,
            secret: SHOPIFY_API_SECRET_KEY,
            scopes: ['read_products', 'write_products', 'read_orders', 'write_orders', 'read_shipping', 'write_shipping'],
            async afterAuth(ctx) {
                const { shop, accessToken } = ctx.session;
                ctx.cookies.set('shopOrigin', shop, {
                    httpOnly: false,
                    secure: true,
                    sameSite: 'none'
                });

                const registration = await registerWebhook({
                    address: `${HOST}/webhooks/products/create`,
                    topic: 'PRODUCTS_CREATE',
                    accessToken,
                    shop,
                    apiVersion: ApiVersion.October20
                });

                const registrationOrder = await registerWebhook({
                    address: `${HOST}/webhooks/orders/create`,
                    topic: 'ORDER_TRANSACTIONS_CREATE',
                    accessToken,
                    shop,
                    apiVersion: ApiVersion.October20
                });

                let carrierServiceName = "NinjaVan Shipping Rates";
                let isCreated = false;
                shopify.carrierService.list().then(res => {
                    res.forEach((carrier) => {
                        if (carrier["name"] === carrierServiceName) {
                            isCreated = true;
                        }
                    })
                })
                if (!isCreated) {
                    shopify.carrierService.create({
                        active: true,
                        callback_url: HOST + "/ninjavan-shipping-rates",
                        carrier_service_type: "api",
                        name: "NinjaVan Shipping Rates",
                        service_discovery: true,
                        format: "json"
                    }).then(res => {
                        console.log(res, 'Already create carrier service');
                    }).catch(err => {
                        console.log(err, 'could not create carrier service');
                    })
                }
                ctx.redirect('/');
            },
        }),
    );

    // const pool = mysql.createPool({
    //     connectionLimit: 10,
    //     host: "localhost",
    //     user: "root",
    //     password: "root@123",
    //     database : 'ninjavan_middleware'
    // });
    //
    // pool.getConnection(function(err, connection) {
    //     if (err) throw err;
    //     console.log("Connected!");
    //     connection.query('SELECT merchant FROM ninjavan_account', function (error, results, fields) {
    //         console.log(results,'>>>');
    //         console.log(fields, '<<<<<<<<<')
    //         // When done with the connection, release it.
    //         connection.release();
    //         if (error) throw error;
    //     });
    // });

    server.use(graphQLProxy({version: ApiVersion.October20}));

    server.use(bodyParser());

    // const webhook = receiveWebhook({secret: SHOPIFY_API_SECRET_KEY});
    //
    // router.post('/webhooks/products/create', webhook, (ctx) => {
    //     console.log('received webhook create product.', ctx.state.webhook.payload);
    //     console.log('End');
    // });
    //
    // router.post('/ninjavan-shipping-rates', async ctx => {
    //
    //     console.log(ctx.request.body)
    //     console.log(ctx.request.body.rate.items, '<<<<<<<<<<<<<')
    //     let result = {
    //         "rates": [
    //             {
    //                 "service_name": "canadapost-overnight",
    //                 "service_code": "ON",
    //                 "total_price": "1295",
    //                 "description": "This is the fastest option by far",
    //                 "currency": "CAD",
    //                 "min_delivery_date": "2013-04-12 14:48:45 -0400",
    //                 "max_delivery_date": "2013-04-12 14:48:45 -0400"
    //             }, {
    //                 "service_name": "fedex-2dayground",
    //                 "service_code": "2D",
    //                 "total_price": "2934",
    //                 "currency": "USD",
    //                 "min_delivery_date": "2013-04-12 14:48:45 -0400",
    //                 "max_delivery_date": "2013-04-12 14:48:45 -0400"
    //             }
    //         ]
    //     };
    //     ctx.response.status = 200;
    //     ctx.response.body = result;
    //     console.log(ctx.response.body);
    // });
    //
    // router.post('/webhooks/orders/create', webhook, (ctx) => {
    //     let orderId = ctx.state.webhook.payload.order_id;
    //     shopify.order.get(orderId).then(resOrder => {
    //         resOrder.line_items.forEach((orderLineItem) => {
    //             shopify.productVariant.get(orderLineItem.variant_id).then(resVariant => {
    //                 shopify.inventoryLevel.list({
    //                     'inventory_item_ids': resVariant.inventory_item_id
    //                 }).then(res => {
    //                     res.forEach((inventoryLevel) => {
    //                         let trackingNumber = 234556;
    //                         shopify.fulfillment.create(orderId, {
    //                             "location_id": inventoryLevel.location_id,
    //                             "tracking_number": trackingNumber,
    //                             "service": "Other",
    //                             "tracking_url": "https://www.ninjavan.co/en-vn/tracking?id=" + trackingNumber,
    //                             "notify_customer": true
    //                         }).then(res => {
    //                             console.log(res, 'CREATED FULFILLMENT')
    //                         }).catch(err => {
    //                             console.log(err, 'ERROR CREATED FULFILLMENT')
    //                         })
    //                     })
    //                 })
    //             })
    //          })
    //     }).catch(reason => {
    //         console.log(reason, 'Could not get order.')
    //     })
    //     console.log('received webhook create Order.')
    // });


    router.get('(.*)', verifyRequest(), async (ctx) => {
        await handle(ctx.req, ctx.res);
        ctx.respond = false;
        ctx.res.statusCode = 200;
    });

    server.use(router.allowedMethods());
    server.use(router.routes());

    server.listen(port, () => {
        console.log(`> Ready on http://localhost:${port}`);
    });
});

