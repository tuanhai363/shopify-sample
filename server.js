require('isomorphic-fetch');
const dotenv = require('dotenv');
const Koa = require('koa');
const next = require('next');
const { default: createShopifyAuth } = require('@shopify/koa-shopify-auth');
const { verifyRequest } = require('@shopify/koa-shopify-auth');
const session = require('koa-session');

dotenv.config();
const { default: graphQLProxy } = require('@shopify/koa-shopify-graphql-proxy');
const { ApiVersion } = require('@shopify/koa-shopify-graphql-proxy');
const {registerWebhook} = require('@shopify/koa-shopify-webhooks');
const router = require('./server/routes');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const {SHOPIFY_API_SECRET_KEY, SHOPIFY_API_KEY, HOST} = process.env;

app.prepare().then(() => {
    const server = new Koa();
    server.use(session({ secure: true, sameSite: 'none' }, server));
    server.keys = [SHOPIFY_API_SECRET_KEY];
    server.use(
        createShopifyAuth({
            apiKey: SHOPIFY_API_KEY,
            secret: SHOPIFY_API_SECRET_KEY,
            scopes: ['read_products', 'write_products', 'read_orders', 'write_orders'],
            async afterAuth(ctx) {
                const { shop, accessToken } = ctx.session;
                ctx.cookies.set('shopOrigin', shop, {
                    httpOnly: false,
                    secure: true,
                    sameSite: 'none'
                });
                // await getSubscriptionUrl(ctx, accessToken, shop);
                const registration = await registerWebhook({
                    address: `${HOST}/webhooks/products/create`,
                    topic: 'PRODUCTS_CREATE',
                    accessToken,
                    shop,
                    apiVersion: ApiVersion.October20
                });
                if (registration.success) {
                    console.log('Successfully registered webhook Products!');
                } else {
                    console.log('Failed to register webhook Products: ', registration.result);
                }

                // await getSubscriptionUrl(ctx, accessToken, shop);
                const registrationOrder = await registerWebhook({
                    address: `${HOST}/webhooks/orders/create`,
                    topic: 'ORDER_TRANSACTIONS_CREATE',
                    accessToken,
                    shop,
                    apiVersion: ApiVersion.October20
                });

                if (registrationOrder.success) {
                    console.log('Successfully registered webhook Orders!');
                } else {
                    console.log('Failed to register webhook Order: ', registrationOrder.result);
                }
            },
        }),
    );

    server.use(graphQLProxy({version: ApiVersion.October19}));

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

