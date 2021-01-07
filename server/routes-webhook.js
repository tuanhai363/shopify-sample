require('isomorphic-fetch');
const Shopify = require('shopify-api-node');
const Router = require('koa-router');

const { receiveWebhook } = require('@shopify/koa-shopify-webhooks');

const router = new Router();
const {
    SHOPIFY_API_SECRET_KEY,
    API_VERSION,
    SHOP_NAME, API_KEY, PASSWORD
} = process.env;

const shopify = new Shopify({
    shopName: SHOP_NAME,
    apiKey: API_KEY,
    password: PASSWORD,
});

const webhook = receiveWebhook({secret: SHOPIFY_API_SECRET_KEY});

router.post('/webhooks/products/create', webhook, (ctx) => {
    console.log('received webhook create product.', ctx.state.webhook.payload);
    console.log('End');
});

router.post('/ninjavan-shipping-rates', async ctx => {

    console.log(ctx.request.body)
    console.log(ctx.request.body.rate.items, '<<<<<<<<<<<<<')
    let result = {
        "rates": [
            {
                "service_name": "canadapost-overnight",
                "service_code": "ON",
                "total_price": "1295",
                "description": "This is the fastest option by far",
                "currency": "CAD",
                "min_delivery_date": "2013-04-12 14:48:45 -0400",
                "max_delivery_date": "2013-04-12 14:48:45 -0400"
            }, {
                "service_name": "fedex-2dayground",
                "service_code": "2D",
                "total_price": "2934",
                "currency": "USD",
                "min_delivery_date": "2013-04-12 14:48:45 -0400",
                "max_delivery_date": "2013-04-12 14:48:45 -0400"
            }
        ]
    };
    ctx.response.status = 200;
    ctx.response.body = result;
    console.log(ctx.response.body);
});

router.post('/webhooks/orders/create', webhook, (ctx) => {
    let orderId = ctx.state.webhook.payload.order_id;
    shopify.order.get(orderId).then(resOrder => {
        resOrder.line_items.forEach((orderLineItem) => {
            shopify.productVariant.get(orderLineItem.variant_id).then(resVariant => {
                shopify.inventoryLevel.list({
                    'inventory_item_ids': resVariant.inventory_item_id
                }).then(res => {
                    res.forEach((inventoryLevel) => {
                        let trackingNumber = 234556;
                        shopify.fulfillment.create(orderId, {
                            "location_id": inventoryLevel.location_id,
                            "tracking_number": trackingNumber,
                            "service": "Other",
                            "tracking_url": "https://www.ninjavan.co/en-vn/tracking?id=" + trackingNumber,
                            "notify_customer": true
                        }).then(res => {
                            console.log(res, 'CREATED FULFILLMENT')
                        }).catch(err => {
                            console.log(err, 'ERROR CREATED FULFILLMENT')
                        })
                    })
                })
            })
        })
    }).catch(reason => {
        console.log(reason, 'Could not get order.')
    })
    console.log('received webhook create Order.')
});

module.exports = router;