## Running Frontend locally
In the `frontend` directory, do the following steps:

Step 1: Run `npm install`
```sh
npm install
```

Step 2: Run app locally
```sh
npm run dev
```

## Running Backend locally
In the `backend` directory, do the following steps:

Step 1: Run `poetry install`
```sh
poetry install
```

Step 2: Run app locally
```sh
poetry run uvicorn main:app --reload
```