# Betty Blocks Component CLI

@import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false}

<!-- code_chunk_output -->

- [Betty Blocks Component CLI](#betty-blocks-component-cli)
  - [Betty Blocks](#betty-blocks)
  - [Introduction](#introduction)
  - [Installation](#installation)
  - [Development](#development)
    - [Create a new Component Set](#create-a-new-component-set)
    - [Start the development server](#start-the-development-server)
    - [Preview Components in the Page Builder](#preview-components-in-the-page-builder)
    - [Publish the Component Set](#publish-the-component-set)
  - [Core concepts](#core-concepts)
    - [JSX](#jsx)
    - [Styles](#styles)
    - [Theme](#theme)
    - [Options](#options)
  - [Component API](#component-api)
    - [Prefabs](#prefabs)
      - [`name: string`](#name-string)
      - [`icon: string`](#icon-string)
      - [`category: string`](#category-string)
      - [`structure: object[]`](#structure-object)
    - [Component Configurations](#component-configurations)
      - [`name: string`](#name-string-1)
      - [`options: object[]`](#options-object)
        - [`value: string`](#value-string)
        - [`label: string`](#label-string)
        - [`key: string`](#key-string)
        - [`type: string`](#type-string)
      - [`descendants: object[]`](#descendants-object)
    - [Component](#component)
      - [`name: string`](#name-string-2)
      - [`type: string`](#type-string-1)
      - [`allowedType: string[]`](#allowedtype-string)
      - [`orientation: 'HORIZONTAL' | 'VERTICAL'`](#orientation-horizontal-vertical)
      - [`jsx: JSX`](#jsx-jsx)
      - [`styles: Function`](#styles-function)
    - [Component Helpers](#component-helpers)
      - [`classes: object`](#classes-object)
      - [`options: object`](#options-object-1)
      - [`children: object[]`](#children-object)
      - [`B.Link: Component`](#blink-component)
      - [`B.getRoute: Function`](#bgetroute-function)
      - [`B.getVar: Function`](#bgetvar-function)
      - [`B.Query: Component`](#bquery-component)
      - [`B.getModelQuery: Function`](#bgetmodelquery-function)
      - [`B.getProperty: Function`](#bgetproperty-function)
      - [`useRouter: Function`](#userouter-function)
      - [`useState: Function`](#usestate-function)
  - [Attachments](#attachments)
    - [Default theme](#default-theme)

<!-- /code_chunk_output -->

## Betty Blocks

Betty Blocks is a no-code platform for business users. Not using Betty Blocks yet? No worries: find out more at [https://www.bettyblocks.com](https://www.bettyblocks.com).

## Introduction

Use the Betty Blocks Component CLI to build Component Sets compatible with the Betty Blocks platform. The CLI is the first part of the Betty Blocks Component System available as open-source software. More tools are planned for release. This package was initially used internally by Betty Blocks to build Components for the [Page Builder](https://docs.bettyblocks.com/en/articles/998115-what-is-the-page-builder). We want the Page Builder to be flexible and easy to use. The Betty Blocks Component System gives developers a framework to build Component Sets. The Components in these Sets directly integrate with the platform.

## Installation

To install the CLI you will need [a recent version of Node.js](https://nodejs.org/en/).

```bash
$ npm install -g @betty-blocks/cli
```

## Development

### Create a new Component Set

```bash
$ bb components create hello-world
$ cd hello-world/
$ npm install
```

### Start the development server

```bash
$ npm run dev

> component-sets@1.0.0 dev ~/hello-world
> nodemon --watch src --exec 'yarn build && yarn start'

[nodemon] 1.19.1
[nodemon] to restart at any time, enter `rs`
[nodemon] watching: ~/hello-world/src/**/*
[nodemon] starting `yarn build && yarn start`
yarn run v1.13.0
$ bb components build
Built Component Set.
_  Done in 0.40s.
yarn run v1.13.0
$ bb components serve
Serving "hello-world" component set at http://localhost:5001
```

<!---
### Build your first component

@TODO: Step by step guide

### Preview Components locally

// @TODO: The preview is not part of the CLI yet

```bash
$ bb components preview
```
-->

### Preview Components in the Page Builder

1. Create a new page in the Page Builder.
2. Navigate to the page settings tab.
3. Open `advanced`.
4. Paste your Component Set URL in the input field.
5. Reload the page. Now your Components are loaded in the sidebar.

### Publish the Component Set

Currently we support publishing to [Azure Blob Storage](https://azure.microsoft.com/en-us/services/storage/blobs).
The publish command requires you to set the following environment variables:

- `AZURE_BLOB_ACCOUNT`
- `AZURE_BLOB_ACCOUNT_KEY`

When you have these set up you can publish:

```bash
$ bb components publish --bucket=hello-world
Upload succesfully.

Use the following URL in the Page Builder to start working with your Component Set:

https://ide.blob.core.windows.net/hello-world
```

We recommend that you set this up in your CI pipeline.

## Core concepts

A component is essentially just a JavaScript object with configuration. Betty Blocks uses this configuration to render components. Before you start building components, make sure you are familiar with these core concepts:

### JSX

Component markup is written in [JSX](https://facebook.github.io/jsx) syntax. This allows you combine HTML with JavaScript for interactivity.

A heading Component might look like this in JSX:

```jsx
<div>
  <h1>Hello World</h1>
</div>
```

We can add logic between brackets (`{}`) to conditionally render the title:

```jsx
<div>
  <h1>{1 === 1 ? 'Hello World' : 'Foo bar'}</h1>
</div>
```

For a more in-depth guide on how to use JSX, you can check out the [React documentation](https://reactjs.org/docs/introducing-jsx.html).

### Styles

Building Components without styling is boring; fortunately you can safely style your Components using the Component styles. If you're familiar with [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) you've probably encountered issues with scoping. To make sure styles don't interfere with each other, they are scoped to a Component. The following example will spice up the heading with some color:

```javascript
{
  heading: {
    color: '#E9004C';
  }
}
```

The keys we define in our styles object will be translated to classes. These classes can be used inside the JSX:

```jsx
<div>
  <h1 className={classes.heading}>Hello World</h1>
</div>
```

If you want to read more on how to use styles, see [the JSS documentation](https://cssinjs.org/jss-syntax).

### Theme

Adding theme support to your Components is a good practice. By doing this you allow the user to change the appearance of all Components used in the application at once. Themes are a safe and predictable way to apply global styling to your application. A theme variable can be applied by using the theme object inside of the styles:

```javascript
{
  heading: {
    color: theme.colors.default;
  }
}
```

See the [default theme](#default-theme) to see the keys you can use.

### Options

Sometimes you want parts of your Components to be configurable by the no-code developer. You can leverage the Betty Blocks platform by using Options. Options will be visible in the Page Builder sidebar on Component selection, and can be used to configure all sorts of things. When building a heading Component, it makes sense to make the text configurable:

```javascript
{
  label: 'Heading text',
  key: 'text',
  value: 'Hello World',
  type: TEXT
}
```

The Option will be shown as a text input in the Page Builder sidebar, allowing the no-code developer to override the `value`. The output of the Option can be used in the JSX by accessing the `options` object:

```jsx
<div>
  <h1>{options.text}</h1>
</div>
```

You can also use the `value` of your Options inside the styles. For example, to allow the no-code developer to select a heading color:

```javascript
{
  label: 'Heading color',
  key: 'color',
  value: '#E9004C',
  type: 'COLOR'
}
```

```javascript
{
  heading: {
    color: ({ options }) => options.color;
  }
}
```

<!---

// @TODO: add link?

Read more about the kind of Options you can use [insert_link_here].

-->

## Component API

Components can integrate with core features of the Betty Blocks platform such as Endpoints, Webservices and Models, through usage of the Component API.

### Prefabs

A Prefab is something you can drag onto a Page inside the Page Builder. A Prefab is configured by a JavaScript object with predefined keys.

This example configures a heading Prefab:

```javascript
(function Prefab() {
  return {
    name: 'Hello World',
    icon: HEADING_ICON,
    category: CONTENT,
    structure: [
      {
        component: 'Heading',
        options: [
          {
            label: 'Heading text',
            key: 'text',
            value: 'Hello World',
            type: 'TEXT',
          },
        ],
        descendants: [],
      },
    ],
  };
})();
```

<!---
@TODO: add list of available icons
-->

These keys can be used to configure a Prefab:

#### `name: string`

The name of the Prefab in the Page Builder sidebar.

#### `icon: string`

The icon in the Page Builder sidebar next to the Prefab name.

#### `category: string`

The category among which the Prefab will appear in the Page Builder sidebar.

The order of the first 6 categories cannot be changed. Custom categories are ordered alphabetically:

1. `LAYOUT`
2. `CONTENT`
3. `DATA`
4. `TABLE`
5. `NAVIGATION`
6. `FORM`
7. Custom categories

#### `structure: object[]`

An array of [Component Configurations](#component-configuration) for the Components in the Prefab.

### Component Configurations

Component Configurations appear in the `structure` of a [Prefab](#prefabs), and recursively in the `descendants` of another Component Configuration.

Each Configuration must contain the following keys:

#### `name: string`

Name of the [Component](#components). Has to correspond to a name of a [Component](#components).

#### `options: object[]`

An array of [Option](#options) objects. These represent the [Options](#options) available within the Component.

##### `value: string`

The default value of the [Option](#options).

##### `label: string`

The label shown in the Page Builder sidebar once the [Component](#components) is selected.

##### `key: string`

The key referring to this [Option](#options) inside a [Component](#components). For example, the value of the [Option](#options) with key `titleText` will be available in a Betty Component as `options.titleText`.

##### `type: string`

The type of the [Option](#options). The type of the [Option](#options) will configure what data type the [Option](#options) will accept and return. Applications can show a different interface based on this type.

<!---
// @TODO: add list of option types
-->

#### `descendants: object[]`

An array of nested [Component Configurations](#component-configuration).

### Component

A Component is essentially just a JavaScript object telling Betty Blocks how to render a part of your Page. A Component is always part of a [Prefab](#prefabs).

This example configures a heading Component:

```jsx
(function Component() {
  return {
    name: 'Heading',
    type: 'HEADING',
    allowedTypes: [],
    orientation: HORIZONTAL,
    jsx: (
      <div>
        <h1 className={classes.heading}>{options.text}</h1>
      </div>
    ),
    styles: B => theme => ({
      heading: {
        color: '#E9004C',
      },
    }),
  };
})();
```

#### `name: string`

Name of the Component, used as a reference inside the structure of a [Prefab](#prefabs).

#### `type: string`

This sets the type of a Component. The type can be used in the `allowedTypes` of other Components to determine whether this type can be nested.

#### `allowedType: string[]`

A list of types which the Component allows as children.

#### `orientation: 'HORIZONTAL' | 'VERTICAL'`

States whether the drop indicator in the Page Builder will be shown vertically or horizontally when the Component is dragged or moved on the canvas.

#### `jsx: JSX`

The template of the Component. See [Introducing JSX](https://reactjs.org/docs/introducing-jsx.html) and [JSX in depth](https://reactjs.org/docs/jsx-in-depth.html) to learn more about this templating language. Inside the JSX you can make use of [Component Helpers](#component-helpers).

#### `styles: Function`

The styles scoped to the [Component](#components). See [CSS in JS](https://cssinjs.org/) to learn more about the framework.

### Component Helpers

Component Helpers provide convenient objects and [Components](#components) that make it easier to integrate your [Components](#components) with the Betty Blocks platform. The following objects are available inside the JSX of a [Component](#components):

#### `classes: object`

An object supplied by JSS to apply styling to elements. The keys and values are based on the `styles` object defined in the [Component](#components). [Read more about JSS](https://cssinjs.org/#react-jss-example).

#### `options: object`

An object containing the values of the [Options](#options). The [Options](#options) are defined inside the `options` of the [Prefab](#prefabs), and their values are supplied by the builder in the Page Builder sidebar.

If an [Option](#options) with `name` `'titleText'` was defined in the [Prefab](#prefabs), its value may be used in JSX like so:

```jsx
<h1>{options.titleText}</h1>
```

#### `children: object[]`

Marks the place to render child [Components](#components). [Read more about child components](https://reactjs.org/docs/react-api.html#reactchildren).

#### `B.Link: Component`

The predefined `B.Link` Component creates a link to another Page.

Render the link to the endpoint with the `B.Link` Component:

```jsx
<div>
  <B.Link to={url}>Link to a page</B.Link>
</div>
```

See [the React Router documentation on the Link component](https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/api/Link.md) for more information.

#### `B.getRoute: Function`

Use `B.getRoute` to get the URL of a selected endpoint.

Use an [Option](#options) of type `ENDPOINT` to allow the builder to select an Endpoint:

```javascript
{
  label: 'Link to an endpoint',
  key: 'linkTo',
  value: null,
  type: 'ENDPOINT'
}
```

Pass the option value to `B.getRoute` to get a URL that can be used with the `B.Link` Component:

```jsx
<div>
  <B.Link to={B.getRoute(options.linkTo)}>Link to a page</B.Link>
</div>
```

#### `B.getVar: Function`

If you know the `id` of an Input Variable, use `B.getVar` to retrieve the value:

```jsx
<div>
  <p>You are {B.getVar(id)} years old.</p>
</div>
```

If the Variable with id `id` has name `age`, and the URL contains a parameter `age`, the value of this parameter will be rendered inside the JSX.

#### `B.Query: Component`

Use the `B.Query` Component to retrieve Betty Blocks Model data. To query data, you will need to provide a GraphQL query to the `B.Query` Component, along with the appropriate variables. Use `B.getModelQuery` to create such a query based on a Model.

The Component must contain a function exposing three objects:

- `loading` is a boolean indicating whether data is being retrieved.
- `error?` is a either an `Error` or `undefined`.
- `data` is `undefined`, or an object with two keys:
  - `results` contains a key-value map from Model name to a list of Model records. A Model record is itself also a key-value map from Property name to value.
  - `totalCount` contains the total number of Model records in the database.

Use these objects to render data inside your JSX. In the following example, we want to render a list of values of a certain Property for each record of a given Model.

```jsx
<B.Query query={modelQuery}>
  {({ loading, error, data }) => {
    if (loading) {
      return <span>Loading...</span>;
    }

    if (error) {
      return <span>Something went wrong: {error.message} :(</span>;
    }

    const modelName = Object.keys(data)[0];
    const { totalCount, results } = data[modelName];

    return (
      <div>
        <p>There are {totalCount} records.</p>
      </div>
      <ul>
        results.map({id} => <li key={id}>id</li>);
      </ul>
    );
  }}
</B.Query>
```

See [the Apollo GraphQL documentation on the queries](https://www.apollographql.com/docs/react/v2.5/essentials/queries/) for more information.

#### `B.getModelQuery: Function`

The Builder can specify a Model through a [Component Option](#options) of type `MODEL`. Pass the value of this [Option](#options) to `B.getModelQuery` to create a GraphQL query.

The Model [Option](#options) listed in the [Prefab](#prefabs) might look like:

```javascript
{
  value: '',
  label: 'Model',
  key: 'model',
  type: 'MODEL',
}
```

Passing the value to `B.getModelQuery` returns a GraphQL query:

```javascript
const modelQuery = B.getModelQuery(options.model);
```

The query can be used to create a `B.Query` Component.

#### `B.getProperty: Function`

The Builder can specify a Property through a [Component Option](#options) of type `PROPERTY`. Pass the value of this [Option](#options) to `B.getProperty` to obtain information about the property:

The Property [Option](#options) listed in the [Prefab](#prefabs) might look like:

```javascript
{
  value: '',
  label: 'Property',
  key: 'property',
  type: 'PROPERTY',
}
```

Passing the value to `B.getProperty` returns information about the Property:

```javascript
const { kind, modelId, name } = B.getProperty(options.property);
```

You can use this information to interpret the data returned inside a `<B.Query>`, or to display the Property value differently for certain Property kinds.

#### `useRouter: Function`

Use `useRouter` to base the behavior of your [Component](#components) on history or the current URL. Calling `useRouter` returns an object with three keys:

```jsx
const { history, location, match } = useRouter();
```

- `history` returns an object with several useful methods that read and manipulate the history of the Application. [Read more about the `history` library](https://github.com/ReactTraining/history). Some of the more useful methods include:
  - `history.push`
  - `history.goBack`
  - `history.goForward`
- `location` contains information about the current location like path_name, hash, parameters, etc. [Read more about the `location` object](https://reacttraining.com/react-router/web/api/location).
- `match` tells you how the current route matches the current URL. [Read more about the `match` object](https://reacttraining.com/react-router/web/api/match).

**Note:** this function only works within the runtime environment. In the builder environment it does nothing.

#### `useState: Function`

Use `useState` to keep track of state within your [Component](#components). In the following example, a button toggles the state of a paragraph:

```jsx
const [enabled, setEnabled] = useState(false);

return (
  <div>
    <p>I'm {enabled ? 'enabled' : 'disabled'}</p>
    <button onClick={() => setEnabled(prevState => !prevState)}>
      {enabled ? 'Disable' : 'Enable'}
    </button>
  </div>
);
```

[Read more about the `useState` hook](https://reactjs.org/docs/hooks-state.html).

<!---
#### Read more

Read more about how and when to use the Component API [insert_link_here].

## API Documentation

// @TODO: Link to generated typedocs
-->

## Attachments

### Default theme

```javascript
const defaultTheme = {
  colors: {
    primary: '#3F51B5',
    secondary: '#90a4ae',
    success: '#8bc34a',
    info: '#90caf9',
    warning: '#ff9800',
    danger: '#f44336',
    black: '#000',
    white: '#fff',
    dark: '#4D4D4D',
    medium: '#999999',
    light: '#CCCCCC',
    accent1: '#d8d8d8',
    accent2: '#828282',
    accent3: '#666666',
  },
  typography: {
    title1: {
      color: '#000000',
      desktopSize: '6rem',
      tabletLandscapeSize: '6.625rem',
      tabletPortraitSize: '4.6875rem',
      mobileSize: '3.5625rem',
      fontFamily: 'Roboto, sans-serif',
      textTransform: 'inherit',
      fontWeight: '300',
      letterSpacing: 'normal',
    },
    title2: {
      color: '#000000',
      desktopSize: '3.75rem',
      tabletLandscapeSize: '3.25rem',
      tabletPortraitSize: '3.25rem',
      mobileSize: '2.4375rem',
      fontFamily: 'Roboto, sans-serif',
      textTransform: 'inherit',
      fontWeight: '300',
      letterSpacing: 'normal',
    },
    title3: {
      color: '#000000',
      desktopSize: '3rem',
      tabletLandscapeSize: '2.75rem',
      tabletPortraitSize: '2.5rem',
      mobileSize: '1.6875rem',
      fontFamily: 'Roboto, sans-serif',
      textTransform: 'inherit',
      fontWeight: '400',
      letterSpacing: 'normal',
    },
    title4: {
      color: '#000000',
      desktopSize: '2.125rem',
      tabletLandscapeSize: '1.625rem',
      tabletPortraitSize: '1.625rem',
      mobileSize: '1.25rem',
      fontFamily: 'Roboto, sans-serif',
      textTransform: 'inherit',
      fontWeight: '400',
      letterSpacing: 'normal',
    },
    title5: {
      color: '#000000',
      desktopSize: '1.5rem',
      tabletLandscapeSize: '1.375rem',
      tabletPortraitSize: '1.25rem',
      mobileSize: '1.125rem',
      fontFamily: 'Roboto, sans-serif',
      textTransform: 'inherit',
      fontWeight: '400',
      letterSpacing: 'normal',
    },
    title6: {
      color: '#000000',
      desktopSize: '1.25rem',
      tabletLandscapeSize: '1.125rem',
      tabletPortraitSize: '1.125rem',
      mobileSize: '1rem',
      fontFamily: 'Roboto, sans-serif',
      textTransform: 'inherit',
      fontWeight: '500',
      letterSpacing: 'normal',
    },
    subtitle1: {
      color: '#000000',
      desktopSize: '1rem',
      tabletLandscapeSize: '1rem',
      tabletPortraitSize: '1rem',
      mobileSize: '0.875rem',
      fontFamily: 'Roboto, sans-serif',
      textTransform: 'inherit',
      fontWeight: '400',
      letterSpacing: 'normal',
    },
    subtitle2: {
      color: '#000000',
      desktopSize: '0.875rem',
      tabletLandscapeSize: '0.875rem',
      tabletPortraitSize: '0.875rem',
      mobileSize: '0.75rem',
      fontFamily: 'Roboto, sans-serif',
      textTransform: 'inherit',
      fontWeight: '500',
      letterSpacing: 'normal',
    },
    body1: {
      color: '#000000',
      desktopSize: '1rem',
      tabletLandscapeSize: '1rem',
      tabletPortraitSize: '1rem',
      mobileSize: '0.875rem',
      fontFamily: 'Roboto, sans-serif',
      textTransform: 'inherit',
      fontWeight: '400',
      letterSpacing: 'normal',
    },
    body2: {
      color: '#000000',
      desktopSize: '0.875rem',
      tabletLandscapeSize: '0.875rem',
      tabletPortraitSize: '0.875rem',
      mobileSize: '0.75rem',
      fontFamily: 'Roboto, sans-serif',
      textTransform: 'inherit',
      fontWeight: '400',
      letterSpacing: 'normal',
    },
    caption1: {
      color: '#000000',
      desktopSize: '0.75rem',
      tabletLandscapeSize: '0.75rem',
      tabletPortraitSize: '0.75rem',
      mobileSize: '0.75rem',
      fontFamily: 'Roboto, sans-serif',
      textTransform: 'inherit',
      fontWeight: '400',
      letterSpacing: 'normal',
    },
    caption2: {
      color: '#000000',
      desktopSize: '0.625rem',
      tabletLandscapeSize: '0.625rem',
      tabletPortraitSize: '0.625rem',
      mobileSize: '0.625rem',
      fontFamily: 'Roboto, sans-serif',
      textTransform: 'inherit',
      fontWeight: '400',
      letterSpacing: 'normal',
    },
    button: {
      color: '#ffffff',
      desktopSize: '0.875rem',
      tabletLandscapeSize: '0.875rem',
      tabletPortraitSize: '0.875rem',
      mobileSize: '0.875rem',
      fontFamily: 'Roboto, sans-serif',
      textTransform: 'uppercase',
      fontWeight: '500',
      letterSpacing: 'normal',
    },
  },
  icons: {
    iconSmall: '2.125rem',
    iconMedium: '3rem',
    iconLarge: '3.75rem',
    iconXLarge: '6rem',
  },
  borders: {
    borderSize: {
      small: '0.0625rem',
      medium: '0.125rem',
      large: '0.25rem',
      xLarge: '0.5rem',
    },
    borderRadius: {
      small: '0.0625rem',
      medium: '0.125rem',
      large: '0.25rem',
      xLarge: '0.5rem',
    },
  },
  spacing: {
    small: {
      desktopSpacing: '0.5rem',
      tabletLandscapeSpacing: '0.5rem',
      tabletPortraitSpacing: '0.25rem',
      mobileSpacing: '0.25rem',
    },
    medium: {
      desktopSpacing: '1rem',
      tabletLandscapeSpacing: '1rem',
      tabletPortraitSpacing: '0.5rem',
      mobileSpacing: '0.5rem',
    },
    large: {
      desktopSpacing: '1.5rem',
      tabletLandscapeSpacing: '1.5rem',
      tabletPortraitSpacing: '1rem',
      mobileSpacing: '1rem',
    },
    xLarge: {
      desktopSpacing: '2rem',
      tabletLandscapeSpacing: '2rem',
      tabletPortraitSpacing: '1.5rem',
      mobileSpacing: '1.5rem',
    },
  },
};
```

[Back to top](#)
