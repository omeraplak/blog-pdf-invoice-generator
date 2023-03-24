# #refineWeek

This is the opening post of another 2023 [**#refineWeek**]() series that is intended to provide a introduction to the series itself as well as to present **refine**, a React framework that is used to rapidly build data heavy tools like dashboards, admin panels and e-commerce storefronts.

This [**#refineWeek**]() is a five part guide that aims to help developers learn the ins-and-outs of **refine**'s powerful capabilities and get going with **refine** within a week.
<br />


## What is **refine** ?

**refine** is a highly customizable **React** based framework that comes with a headless core package and supplementary "pick-and-plug" modules for the UI, backend API clients and Internationalization support.

**refine**'s (intentionally decapitalized) core is strongly opinionated about RESTful conventions, HTTPS networking, state management, authentication and authorization. It is, however, unopinionated about the UI and render logic. This makes it customizable according to one's choice of UI library and frameworks.
<br />


## refine Architecture

Everything in **refine** is centered around the `<Refine />` component, which is mostly configured via a set of provider props that each requires a provider object to be passed in. A typical application of providers on the `<Refine />` component looks like this:

```TypeScript
// Inside App.tsx

<Refine
  dataProvider={DataProvider(API_URL + `/api`, axiosInstance)}
  authProvider={authProvider}
  routerProvider={{routerProvider}}
  resources={[]}
  // ... etc.
/>
```

The above snippet lists a few of the props and their objects. However, rather than precisely being a component, `<Refine />` is largely a monolith of provider configurations backed by a context for each. Hence, inside `dataProvider`, we have a standard set of methods for making API requests; inside `authProvider`, we have methods for dealing with authentication and authorization; inside `routerProvider`, we have methods for dealing with standard routing - both RESTful and non-RESTful, etc. And each of these providers comes with their own set of conventions and type definitions.

For example, a `dataProvider` object has the following signature to which any definition of a data provider should conform:

```TypeScript
// Data provider object signature

const dataProvider: DataProvider = {
  
    // required methods
    getList: ({
        resource,
        pagination,
        sorters,
        filters,
        meta,
    }) => Promise,
    create: ({ resource, variables, meta }) => Promise,
    update: ({ resource, id, variables, meta }) => Promise,
    deleteOne: ({ resource, id, variables, meta }) => Promise,
    getOne: ({ resource, id, meta }) => Promise,
    getApiUrl: () => "",

    // optional methods
    getMany: ({ resource, ids, meta }) => Promise,
    createMany: ({ resource, variables, meta }) => Promise,
    deleteMany: ({ resource, ids, variables, meta }) => Promise,
    updateMany: ({ resource, ids, variables, meta }) => Promise,
    custom: ({
        url,
        method,
        filters,
        sorters,
        payload,
        query,
        headers,
        meta,
    }) => Promise,
};
```

The underlying architecture facilitates any presentational component passed to `<Refine />` to be able to consume these configured methods via corresponding hooks. Each method in a provider has appropriate hooks via which a consumer component is able to fetch data from the backend. For instance, `useSimpleList()` is a high level data and UI hook via which the `dataProvider.getList()` provider method can be accessed.

An example hook usage from a UI component looks like this:

```TypeScript
// Inside a UI component

const { listProps } = useSimpleList<IClient>({
    meta: { populate: ["contacts"] },
});
```

The above `useSimpleList()` hook is a `@refinedev/antd` UI hook that is built on top of the low level `useList()` data hook. Low level hooks, in turn, leverage **React Query** hooks in order to make API calls invoked from inside the provider methods. Here's an early sneak peek into the action under the hood:

```TypeScript
// Inside useList() hook

const queryResponse = useQuery<GetListResponse<TData>, TError>(
  queryKey.list(config),
  ({ queryKey, pageParam, signal }) => {
    const { hasPagination, ...restConfig } = config || {};
    return getList<TData>({
      resource,
      ...restConfig,
      hasPagination,
      metaData: {
        ...metaData,
        queryContext: {
          queryKey,
          pageParam,
          signal,
        },
      },
    });
  },
  {
    ...queryOptions,
    onSuccess: (data) => {
        queryOptions?.onSuccess?.(data);

      const notificationConfig =
        typeof successNotification === "function"
          ? successNotification(
              data,
              { metaData, config },
              resource,
            )
          : successNotification;

      handleNotification(notificationConfig);
    },
    onError: (err: TError) => {
      checkError(err);
      queryOptions?.onError?.(err);

      const notificationConfig =
        typeof errorNotification === "function"
          ? errorNotification(err, { metaData, config }, resource)
          : errorNotification;

      handleNotification(notificationConfig, {
        key: `${resource}-useList-notification`,
        message: translate(
          "common:notifications.error",
          { statusCode: err.statusCode },
          `Error (status code: ${err.statusCode})`,
        ),
        description: err.message,
        type: "error",
      });
    },
  },
);
```

We'll be visiting code like this on [Day 4](), but if you examine the snippet above closely you can see that **refine** uses **React Query** to handle caching, state management as well as errors out-of-the-box.

The following diagram illustrates the interactions:

![1-refine-week](https://refine.ams3.cdn.digitaloceanspaces.com/website/static/img/guides-and-concepts/providers/data-provider/tutorial_dataprovider_flog.png)

<br />


## Providers and Hooks

**refine**'s power lies in the abstraction of various app component logic such as authentication, authorization, routing and data fetching - inside individual providers and their corresponding hooks.

Common providers include:

- [`authProvider`](https://refine.dev/docs/api-reference/core/providers/auth-provider/) - for authentication and authorization.
- [`dataProvider`](https://refine.dev/docs/api-reference/core/providers/data-provider/) - for CRUD operations.
- [`routerProvider`](https://refine.dev/docs/api-reference/core/providers/router-provider/) - for dealing with routing.

For an exhaustive list of providers, please visit the **refine** providers documentation from [here](https://refine.dev/docs/api-reference/core/).

As part of the core package, each method in these providers comes with a corresponding low level hook to be used from inside higher level hooks, partial UI components and pages. As mentioned above with the `useSimpleList()` hook, higher level hooks can be built on top of lower level hooks such as the `useList()` hook. For more details, please refer to the **refine** hooks documentation starting [here](https://refine.dev/docs/api-reference/core/hooks/accessControl/useCan/).
<br />


## Support Packages

**refine** is inherently headless in its core API and deliberately agnostic about the UI and backend layers. Being so, it is able to provide fantastic support for major UI libraries and frameworks as well as popular backend frameworks and services. To name a few, **refine**'s UI support packages include [**Ant Design**](https://refine.dev/docs/api-reference/antd/) and [**Material UI**](https://refine.dev/docs/api-reference/mui/). Backend supplementary modules include **GraphQL**, **NestJS** and **Strapi**.

For a complete list of all these modules, check out [this page](https://refine.dev/docs/packages/list-of-packages/).


## #refineWeek Series

In this tutorial series, we will be going through a few vital features of **refine** by building a basic **Pdf Invoice Generator** app. This section is intended to provide more details.

The final version of the **Pdf Invoice Generator** comprises of a dashboard that allows users to register their companies, add their clients and contacts, create tasks (missions) that they do for their clients and issue invoices for the tasks. Users are also able to generate a pdf document of the invoice.

We will be building this app day-by-day over a period of 5 days. And while doing so, we will dive deep into the details of related providers, hooks, UI components and how **refine** works behind the scenes.

As far as our features and functionalities go, we will cover some key concepts including `authProvider`, `dataProvider` `routerProvider` and `resources` props of `<Refine />`, the provider objects and their associated hooks. For the UI side, we will be using the optional **Ant Design** package supported by **refine**. For the backend, we will use a [**Strapi**](https://strapi.io) content management system.

<br />


Here are the detailed outlines split per day:

### Day One - On This #refineWeek

This opening post. Hello! :wave: :wave: We are here! :smile: :smile:

<br />


### Day Two - Setting Up the App

We start with setting up the **Pdf Invoice Generator** app using **refine** **CLI Wizard**. We choose **refine**'s optional **Ant Design** and **Strapi** modules as support packages. After initialization, we explore the boilerplate code created by the **CLI Wizard**, look into the details of the `dataProvider` and `authProvider` objects and briefly discuss their mechanisms.

In the later sections, we also initialize the **Strapi** backend app for our **Pdf Invoice Generator**. Here's what we do step by step after that:

1. Start the **Strapi** server and  sign up for an **admin** user to get access to the dashboard.
2. We create collections for our app using the `Content-Type Manager`.
3. We set up permissions for `authenticated` role for **refine** app users, i.e. our **Pdf Invoice Generator** app users.

<br />

### Day Three - Adding CRUD Actions & Authentication

On Day 3, we start off with generating and API Token for our **Strapi** backend app to be accessed from our **Pdf Invoice Generator**. We then update our `constants.ts` file with them.

We complete the app halfway by adding CRUD pages for `companies`, `clients` and `contacts`. While doing so, we get familiar with `dataProvider` methods such as `getList`, `create` and `delete` and some of the corresponding low level hooks: `useList()`, `useCreate()` and `useDelete()`.

We also examine the use of higher level hooks such as `useSimpleList()`, `useModalForm()`, `useDrawerForm()` and `useTable()` that integrate data hooks with **Ant Design** components.

We discuss authentication with the `authProvider` object and implement an email / password based authentication with the `<AuthPage />` component that is provided by **refine-Ant Design** (`@refinedev/antd`) package.

<br />

### Day Four - Adding Mission and Invoice Pages

On Day 4, we continue to add CRUD pages for `missions` and `invoices` resources. We first add **Strapi** collections for `missions` and `invoices` and set up permissions on them for `authenticated` user role. And then we go ahead and add the resource items, routes as well as the CRUD pages.

We also get an opportunity to dig into some low level code to make sense of how **refine** undertakes data heavy tasks behind the scenes and presents us with convenient, highly customizable hooks like `useTable()` and `useSelect()` to be used in our app.

Besides the above mentioned hooks, we examine the source code for the **refine-Ant Design** `<DeleteButton />` component.
<br />

### Day Five - Adding PDF Renderer

On the final day, we add a pdf renderer to generate pdf document and view for our invoices. We use the `@react-pdf/renderer` `npm` package for this.

We then wrap up the series by discussing the accomplishments we are about to achieve starting Day 2.


<br />

## Summary

In this post, we introduced the **refine** framework and the [**#refineWeek**]() series itself. We talked about **refine**'s underlying architecture which consists of providers, hooks and components that help rapidly build internal tools.

We layed out the plans for building a **Pdf Invoice Generator** app in considerable depth.

Tomorrow, on Day Two, we are ready to start [Setting Up the App](). See you soon!