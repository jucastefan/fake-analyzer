# FakeAnalyzer

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.1.2.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Deploying to Render

Follow these steps to deploy this app to Render:

- Push the repo to GitHub, GitLab, or Bitbucket and connect it to Render.
- In Render, create a new Web Service and select this repository and branch.
- Use these settings in Render:
  - **Build Command:** `NPM_CONFIG_PRODUCTION=false npm ci && npm run build`
  - **Start Command:** `npm run server`
  - **Environment:** `Node`
- Add the following environment variable in Render (mark as secret):
  - `GROQ_API_KEY` — your Groq API key.
- Optional: set `GROQ_MODEL` if you want to override the default model (`llama-3.1-70b-versatile`).
- Deploy. The server listens on the port provided by Render via `process.env.PORT`.

Alternatively you can use the included `render.yaml` for Infrastructure-as-Code. Do NOT commit your API keys — set them in the Render dashboard.
