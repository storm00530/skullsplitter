import "@babel/polyfill";
import dotenv from "dotenv";
import "isomorphic-fetch";
import createShopifyAuth, { verifyRequest } from "@shopify/koa-shopify-auth";
import graphQLProxy, { ApiVersion } from "@shopify/koa-shopify-graphql-proxy";
import Koa from "koa";
import next from "next";
import Router from "koa-router";
import session from "koa-session";
const cors = require("@koa/cors");
const bodyParser = require("koa-bodyparser");
dotenv.config();
const port = parseInt(process.env.PORT, 10) || 8081;
const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev,
});
const handle = app.getRequestHandler();
const {
  SHOPIFY_API_SECRET,
  SHOPIFY_API_KEY,
  SCOPES,
  SHOPIFY_ACCESS_TOKEN,
} = process.env;

const Model = require("./models/collection_schema");

app.prepare().then(() => {
  const server = new Koa();

  server.use(
    cors({
      methods: ["GET", "PUT", "POST", "PATCH", "DELETE"],
    })
  );
  const router = new Router();

  server.use(
    session(
      {
        sameSite: "none",
        secure: true,
      },
      server
    )
  );
  server.keys = [SHOPIFY_API_SECRET];
  server.use(
    createShopifyAuth({
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_API_SECRET,
      scopes: [SCOPES],

      async afterAuth(ctx) {
        // Access token and shop available in ctx.state.shopify
        const { shop } = ctx.state.shopify;
        // const { accessToken } = ctx.session;
        // access_token = accessToken;
        ctx.cookies.set("shopOrigin", shop, { httpOnly: false });
        // Redirect to app with shop parameter upon auth
        ctx.redirect(`/?shop=${shop}`);
      },
    })
  );
  server.use(
    graphQLProxy({
      version: ApiVersion.October19,
    })
  );

  router.get("(.*)", verifyRequest(), async (ctx) => {
    await handle(ctx.req, ctx.res);

    ctx.respond = false;
    ctx.res.statusCode = 200;
  });
  server.use(bodyParser());
  server.use(router.allowedMethods());
  server.use(router.routes());
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });

  router.post("/createDiscount", async (ctx) => {
    const discountData = ctx.request.body;
    let query = `mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
      discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
        codeDiscountNode {
          id
          codeDiscount {
            ... on DiscountCodeBasic {
              title
              summary
              status
              codes(first: 10) {
                edges {
                  node {
                    code
                  }
                }
              }
            }
          }
        }
        userErrors {
          message
        }
      }
    }`;
    let variables = {
      basicCodeDiscount: {
        appliesOncePerCustomer: true,
        code: discountData.discount_code,
        startsAt: "2021-01-01",
        appliesOncePerCustomer: true,
        customerGets: {
          items: {
            collections: {
              add: discountData.collectionID,
            },
          },
          value: {
            percentage: parseFloat(discountData.discount_percent),
          },
        },
        customerSelection: {
          all: true,
        },
        title: "one time discount code",
        usageLimit: 1,
      },
    };
    const data = await fetch(
      `https://menglan-app-dev.myshopify.com/admin/api/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({
          query,
          variables: variables,
        }),
      }
    ).then((result) => {
      return result.json();
    });
    ctx.body = data;
  });

  //deleteDiscount
  router.post("/deleteDiscount", async (ctx) => {
    const discountId = ctx.request.body;
    let query = `mutation discountCodeDelete($id: ID!) {
      discountCodeDelete(id: $id) {
        deletedCodeDiscountId
        userErrors {
          code
          extraInfo
          field
          message
        }
      }
    }`;
    let variables = {
      id: discountId.id,
    };
    const data = await fetch(
      `https://menglan-app-dev.myshopify.com/admin/api/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({
          query,
          variables: variables,
        }),
      }
    ).then((result) => {
      return result.json();
    });
    ctx.body = data;
  });

  // get Database
  router.post("/getData", async (ctx) => {
    const items = await Model.find({});
    ctx.body = items;
  });

  router.post("/postData", async (ctx) => {
    const collection_info = ctx.request.body;
    const remove = await Model.deleteMany({});
    Model.insertMany(collection_info);

    ctx.body = { success: true };
  });
});
