require('isomorphic-fetch');
const next = require('next');
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const Router = require('koa-router');

const { receiveWebhook } = require('@shopify/koa-shopify-webhooks');

const router = new Router();
const {
    SHOPIFY_API_SECRET_KEY, SHOPIFY_API_KEY, HOST,
    SHOP_NAME, API_KEY, PASSWORD
} = process.env;

const webhook = receiveWebhook({secret: SHOPIFY_API_SECRET_KEY});

/** webhook create products **/
router.post('/webhooks/products/create', webhook, (ctx) => {

    console.log('received webhook create product.', ctx.state.webhook.payload);
    // app.render(webhook, ctx, '/process-create-order')
    // server.use(serverExpress.get('/process-create-order', (req, res) => {
    //     console.log('go go go!!!!');
    //     return app.render(req, res, '/process-create-order', req.query)
    // }))

    console.log('EnDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD');
});

/** webhook create order **/
router.post('/webhooks/orders/create', webhook, (ctx) => {
    console.log('received webhook orders: ', ctx.state.webhook.payload);
    console.log('received webhook create Order.')
});


module.exports = router;