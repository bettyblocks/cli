# Preview

With this project you can preview components in Betty component sets.

## Local development

1. Install dependencies

```bash
$ yarn
```

2. Set url where your component set is hosted as environment variable:

In `.env`:

```
REACT_APP_COMPONENT_SET_URL=<URL>
```

Defaults to: `http://localhost:5001/clara`

3. Serve

```bash
$ yarn start
```

4. The preview is now available at http://localhost:3003
