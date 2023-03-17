# #refineWeek

This is the opening post of another 2023 **[#refineWeek]()** series that is intended to provide a introduction to the series as well as to present **refine**, a React framework that is used to rapidly build data heavy tools like dashboards, admin panels and e-commerce storefronts.

This **[#refineWeek]()** is a 5 part quickfire guide that aims to help developers learn the ins-and-outs of **refine**'s powerful capabilities and get going with **refine** within a week.
<br />


## What is **refine** ?

**refine** is a highly customizable **React** based framework that comes with a headless core package and supplementary "pick-and-plug" modules for the UI, backend API clients and Internationalization support.

**refine**'s (intentionally decapitalized) core is strongly opinionated about RESTful conventions, HTTPS networking, state management, authentication and authorization. It is, however, unopinionated about the UI and render logic. This makes it customizable according to one's choice of UI library and frameworks.
<br />


## refine Architecture

Everything in **refine** is centered around the `<Refine />` component, which is configured via a set of provider props that each requires a provider object to be passed in. A typical application of providers on the `<Refine />` component looks like this:

```TypeScript
// Inside App.tsx

<Refine
  dataProvider={dataProvider(supabaseClient)}
  authProvider={authProvider}
  routerProvider={{routerProvider}}
  resources={[]}
  // ... etc.
/>
```

The above snippet lists a few of the props and their objects. However, rather than precisely being a component, `<Refine />` is largely a monolith of provider configurations backed by a context for each. Hence, inside `dataProvider`, we have a standard set of methods for making API requests; inside `authProvider`, we have methods for dealing with authentication and authorization; inside `routerProvider`, we have _exact_ definitions of routes and the components to render for that route, etc. And each provider comes with its own set of conventions and type definitions.

For example, a `dataProvider` object has the following signature to which any definition of a data provider should conform:

```TypeScript
// Data provider object signature

const dataProvider = {
	create: ({ resource, variables, metaData }) => Promise,
	createMany: ({ resource, variables, metaData }) => Promise,
	deleteOne: ({ resource, id, variables, metaData }) => Promise,
	deleteMany: ({ resource, ids, variables, metaData }) => Promise,

	// Highlight start
  getList: ({
		resource,
		pagination,
		hasPagination,
		sort,
		filters,
		metaData,
	}) => Promise,
  // Highlight end

	getMany: ({ resource, ids, metaData }) => Promise,
	getOne: ({ resource, id, metaData }) => Promise,
	update: ({ resource, id, variables, metaData }) => Promise,
	updateMany: ({ resource, ids, variables, metaData }) => Promise,
	custom: ({
		url,
		method,
		sort,
		filters,
		payload,
		query,
		headers,
		metaData,
	}) => Promise,
	getApiUrl: () => "",
};
```

The underlying architecture facilitates any presentational component passed to `<Refine />` to be able to consume these configured methods via corresponding hooks. Each method in a provider has appropriate hooks via which a consumer component is able to fetch data from the backend. For instance, the `useSimpleList()` is a high level data UI hook via which the `dataProvider.getList()` provider method can be accessed.

An example hook usage from a UI component looks like this:

```TypeScript
// Inside a UI component

const { listProps } = useSimpleList<IClient>({
    metaData: { populate: ["contacts"] },
});
```

The above `useSimpleList()` hook is `@pankod/refine-antd` UI hook that is built on top of the lower level `useList()` data hook and **Ant Design**. Low level hooks, in turn, leverage **React Query** hooks in order to make API calls defined inside the provider methods. Here's an early sneak peek into the action under the hood:

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

We'll be visiting code like this often, but if you examine closely you can see that **refine** uses **React Query** to handle caching, state management as well as errors out-of-the-box.

The following diagram illustrates the interactions:

![1-refine-week](https://imgbox.com/gV0PJ5Mo)
<br />


## Providers and Hooks

**refine**'s power lies in the abstraction of various app component logic such as authentication, authorization, routing and data fetching - inside individual providers and their corresponding hooks.

Common providers include:

- [`authProvider`](https://refine.dev/docs/api-reference/core/providers/auth-provider/) - for authentication and authorization.
- [`dataProvider`](https://refine.dev/docs/api-reference/core/providers/data-provider/) - for CRUD operations.
- [`routerProvider`](https://refine.dev/docs/api-reference/core/providers/router-provider/) - for defining routes, RESTful and non-RESTful.

For an exhaustive list of providers, please visit the **refine** providers documentation from [here](https://refine.dev/docs/api-reference/core/).

Each method in these providers comes with a corresponding low level hook to be used from inside higher level hooks, UI components and pages. As mentioned above with the `useSimpleList()` hook, higher level hooks can be built on top of lower level hooks such as the `useList()` hooj. For more details, please refer to the **refine** hooks documentation starting [here](https://refine.dev/docs/api-reference/core/hooks/accessControl/useCan/).
<br />


## Support Packages

**refine** is inherently headless in its core API and deliberately agnostic about the UI and backend layers. Being so, it is able to provide fantastic support for major UI libraries and frameworks as well as popular backend frameworks and services. To name a few, **refine**'s UI support packages include [**Ant Design**](https://refine.dev/docs/api-reference/antd/) and [**Material UI**](https://refine.dev/docs/api-reference/mui/). Backend supplementary modules include **GraphQL**, **NestJS** and **Supabase**.

For a complete list of all these modules, check out [this page](https://refine.dev/docs/packages/list-of-packages/).


## AWeekOfRefine

In this tutorial series, we will be going through a few vital features of **refine** by building a basic **Pdf Invoice Generator**. We will cover This section is intended to provide more details.

The final version of the **Pdf Invoice Generator** comprises of a dashboard that allows users to register their companies, add their clients and contacts, create tasks that they do for their clients and invoices for the tasks. Users are also able to generate a pdf document of the invoice.

We will be building this app day-by-day over a period of 5 days. And while doing so, we will dive deep into the details of related providers, hooks, UI components and how **refine** works behind the scenes.

As far as our features and functionalities go, we will cover some key concepts including `authProvider`, `dataProvider` `routerProvider` and `resources` props of `<Refine />`, the providers and their associated hooks. For the UI side, we will be using the optional **Ant Design** package supported by **refine**. For the backend, we will use a [**Strapi**]() content management system hosted in the **Strapi Cloud**.

<br />


Here are the detailed outlines split per day:

### Day One - On AWeekOfRefine

This opening post. Hello! :wave: :wave: We are here! :smile: :smile:

<br />


### Day Two - Setting Up the Client App

<br />

### Day Three - Adding CRUD Actions & Authentication

<br />

### Day Four - Adding Realtime Collaboration

<br />

### Day Five - Initialize and Build Pixels Admin App

<br />

## Summary

In this post, we introduced the **refine** framework and the [**#refineWeek**]() series itself. We talked about **refine**'s underlying architecture which consists of providers, hooks and components that help rapidly build internal tools.

We layed out the plans for building a **Pdf Invoice Generator** app in considerable depth.

Tomorrow, on Day Two, we are ready to start [Setting Up the App](). See you soon!