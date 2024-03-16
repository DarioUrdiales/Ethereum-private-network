# Ethereum private network

**Introduction**

This project is part of the curriculum for the "Master's in Blockchain Engineering" program at CodeCrypto Academy. The initiative involves the development of an application that enables the creation of private Ethereum blockchain networks.

The project was carried out in collaboration with a multidisciplinary team, following an agile methodology that encompassed everything from user story planning to progress tracking and task allocation. The implementation was completed within a period of 4 weeks, divided into two sprints. The primary goal of this application is to provide companies with Ethereum technology to develop internal protocols.

This application proves to be a valuable tool as it allows companies to harness the power of smart contracts for various use cases within their organizations.

**Development Team**

* Alejandro Del Medico
* Natalia Molina
* Dario Rodriguez
* Jacky Barraza


**Getting Started**

**Installation**

To set up the application, follow these steps:

1.  Clone this repository to your local machine:

    ```
    git clone https://github.com/gregoryvicent/backend_and_frontend_connection.git
    ```
2.  Navigate to the project directory:

    ```
    cd backend
    ```
3.  Install project dependencies:

    ```
    npm install
    ```

**Usage**

Start the application with the following command:

```
npm start
```

or

```
npx nodemon index.js
```

**APIs**

The server will launch, allowing you to access the following routes:

* `/ping`: Check if the server is running.
* \`/: Get the current block number.
* `/block/:block`: Retrieve information about a specific block using its block hash or block number.
* `/tx/:tx`: Obtain details about a specific transaction using its transaction hash.
* `/balance/:address`: Retrieve the balance of an Ethereum address.

**Frontend**

**Dependencies**

This frontend code relies on the following libraries and tools:

* React: The JavaScript library for building user interfaces.
* React Router: A library for handling routing in React applications.
* React Query: A data fetching and state management library.
* React Hook Form: A library for managing form state in React.
* React-JSON-Pretty: A library for displaying JSON data in a visually appealing format.
* CSS: Styling is applied through CSS stylesheets.

**Getting Started**

To run this frontend code locally, follow these steps:

1. Clone the repository to your local machine.
2. Navigate to the project directory `frontend` using your terminal.
3.  Install project dependencies using:

    ```
    npm install
    ```
4. Ensure that the backend server (API) is running and accessible. Check the Backend section.
5.  Start the frontend application with the following command:

    ```
    npm start
    ```

    or

    ```
    npm run dev
    ```

The application should start locally, and you can access it through your web browser.

Explore Ethereum blockchain data and enjoy using the Ethereum Explorer App!

