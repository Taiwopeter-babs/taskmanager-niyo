# Niyo Group Backend Developer Assessment Documentation

Welcome to the documentation for the backend developer assessment. Please ensure that all the instructions for using the API (REST and Socket) are carefully read and followed.

The REST and Socket APIs are in separate sections, with the request and response body parameters for each specified.

## Content

- [How to use](#how-to-use)
  - [Locally with docker](#locally-with-docker)
  - [Using the deployed application](#using-the-deployed-application)
- [API](#api)
  - [REST](#restful)
    - [Add user](#add-a-user)
    - [Login user](#login-a-user)
    - [Get a user](#get-a-user)
  - [Socket](#socket)
    - [Events](#socket-events)
      - [createTask](#createtask)
      - [readAllTasks](#readalltasks)
      - [readTask](#readtask)
      - [updateTask](#updatetask)
      - [deleteTask](#deletetask)
      - [dataError](#dataerror)
      - [disconnectionError](#disconnectionerror)

## How To Use

There are two ways to run application:

- **Locally with docker**
- **using the deployed application**

## Locally With Docker

Note: **Ensure you have docker installed on linux or Docker desktop on windows or mac**

- See [here](https://docs.docker.com/desktop/install/linux-install/) for Linux
- See [here](https://docs.docker.com/desktop/install/windows-install/) for Windows
- See [here](https://docs.docker.com/desktop/install/mac-install/) for Mac

- ### Clone the repository and install the dependencies

```bash
git clone https://github.com/Taiwopeter-babs/taskmanager-niyo.git

npm install
```

- ### Set environment variables

  > The application itself is not containerized, but uses a `PostgreSQL` image to run the database. In order to use the image, please ensure that you have the environment variables listed below in your `.env` file (some have default values you can change):

  - NODE_ENV=development
  - PORT=3001
  - POSTGRES_HOST=localhost
  - POSTGRES_PORT=5432
  - POSTGRES_USER=niyo_db_user
  - POSTGRES_DB=niyo_db
  - POSTGRES_PASSWORD=ALTSREC07BF or `<any password>`
  - JWT_SECRET=`<any secret key or string>`
  - JWT_VALID_TIME=18000

- ### Run the application

  - Start the docker postgresql image. See the file [here](compose.yaml)

  ```bash
  docker compose up -d
  ```

  - Start the application

  ```bash
  npm run start:dev
  ```

### Note: The base url for the local connection is `localhost:3001`

[Back to content](#content)

## Using the deployed application

The deployed version runs on Render, so all you need to do is to use the url specified below as the base url for all the API endpoints when testing. I recommend using `Postman` for testing this API if there is no client-side script because of the socket connection.

**Base URL**:

```bash
https://taskmanager-niyo.onrender.com
```

[Back to content](#content)

---

## API

- REST
- Socket

All the endpoints here are suffixed with the base url.

## RESTful

The REST API in the application comprises of the authentication and user management endpoints.

The section below contains details of the endpoint

### REST Endpoints

- ### **Add a user**

  `POST /api/v1/auth/user/register`

  - Request body

  ```ts
  interface CreateUserDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    gender: 'male' | 'female' | 'other';
  }
  ```

  > Any request which does not satisfy one or more of the predefined parameters will return a `400 Bad Request` error:

  ```json
  {
    "statusCode": 400,
    "error": "Bad request",
    "message" [] // details of the error
  }
  ```

  > A succesful request will return the object type below:

  ```ts
  interface UserDto {
    statusCode: 200,
    message: "Registration successful",
    id: number,
    firstName: string,
    lastName: string,
    email: string,
    gender: 'male' | 'female' | 'other'
  }

  ```

  [Back to content](#content)

  ---

- ### **Login a user**

  `POST /api/v1/auth/user/login`

  - Request body

  ```ts
  interface LoginUserDto {
    email: string;
    password: string;
  }
  ```

  > A succesful request will return the object type below:

  ```ts
  interface UserDto {
    statusCode: 200,
    message: "Login successful",
    id: number,
    firstName: string,
    lastName: string,
    email: string,
    gender: 'male' | 'female' | 'other'
  }
  ```

[Back to content](#content)

---

- ### **Get a user**

  `GET /api/v1/users/:id`

  > You must be logged in to use this endpoint, otherwise an unauthorized error is returned:

  ```json
  {
    "statusCode": 401,
    "error": "Unauthorized"
  }
  ```

  > The `id` parameter must be a valid number, otherwise a `400 Bad request` error will be returned.

  - Request body

      A succesful request will return the object type below:

      ```ts
      interface UserDto {
        statusCode: 200,
        id: number,
        firstName: string,
        lastName: string,
        email: string,
        gender: 'male' | 'female' | 'other'
      }
      ```

[Back to content](#content)

---

## Socket

The socket api has a single endpoint: **/api/sockets** that deals with task creation, reading, updating, and deleting. There are multiple events that can be listened to as long as you are connected.

For extra security, your JWT value is verified before any connection handshake is made.

In your API client (POSTMAN OR ANY OTHERS), please ensure that you copy all the cookies (key and value) that was issued after successful login, and paste them in the `Cookies` value of the Socket headers tab.

**SEE THIS [LINK](https://learning.postman.com/docs/sending-requests/websocket/create-a-websocket-request/) ON HOW TO CREATE A WEBSOCKET CLIENT IN POSTMAN.**

---

## Socket Events

> **All the request data must be sent in JSON format**

- ### `createTask`  
  
   Creates a new task

  - Message body object type

  ```ts
  interface CreateTaskDto {
    title: string;
    description: string;
    userId: number; 
  }  
  ```

  This event, on completion, streams to clients listening on `createTask` and `readAllTasks` events. The data is paginated for `readAllTasks`, hence only the first 10 tasks are returned on page 1. See [readAllTasks](#readalltasks)

  - Response data type for `createTask` event

  ```ts
  interface Task {
    id: number;
    title: string;
    description: string;
    isCompleted: 'pending' | 'completed'
    userId: number;
    createdAt: Date;
    updatedAt: Date;
  }
  ```

  - Response data type for `readAllTasks` event

    See [readAllTasks](#readalltasks) event.

  [Back to content](#content)

- ### `readAllTasks`  
  
   Reads tasks by page

  - Message body object type

  ```ts
  interface TaskQueryDto {
    pageNumber: number | undefined;
    pageSize: number | undefined;
    taskStatus: 'pending' | 'completed' | undefined; 
  }  
  ```

  Default values of 1 and 10 are assigned to `pageNumber` and `pageSize` if undefined.

  - Response data type for `readAllTasks` event

  ```ts
  interface Task {
    id: number;
    title: string;
    description: string;
    isCompleted: 'pending' | 'completed'
    userId: number;
    createdAt: Date;
    updatedAt: Date;
  };

  interface AllTasks {
    tasks: Task[];
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }
  ```

  [Back to content](#content)

- ### `readTask`  
  
   Reads a single task

  - Message body object type

  ```ts
  interface TaskQueryDto {
    taskId: number; 
  }  
  ```

  - Response data type

    If the task is not found, an object with a message property is returned

    ```json
    { "message": "Task with the id <taskId> was not found" }
    ```

    A successful response is of the type:

    ```ts
    interface Task {
      id: number;
      title: string;
      description: string;
      isCompleted: 'pending' | 'completed'
      userId: number;
      createdAt: Date;
      updatedAt: Date;
    };
    ```

    [Back to content](#content)

- ### `updateTask`  
  
   Updates a single task and streams to [readAllTasks](#readalltasks) and [updateTask](#updatetask) events.

  - Message body object type

  ```ts
  interface UpdateTaskDto {
    title: string;
    description: string;
    isCompleted: 'pending' | 'completed'; 
  }  
  ```

  - Response data type

    A successful response is of the type:

    ```ts
    interface Task {
      id: number;
      title: string;
      description: string;
      isCompleted: 'pending' | 'completed'
      userId: number;
      createdAt: Date;
      updatedAt: Date;
    };
    ```

    [Back to content](#content)

- ### `deleteTask`  
  
   Delete a single task and streams to [readAllTasks](#readalltasks) and [deleteTask](#deletetask) events.

  - Message body object type

  ```ts
  interface UpdateTaskDto {
    title: string;
    description: string;
    isCompleted: 'pending' | 'completed'; 
  }  
  ```

  - Response data type for `deleteTask` event
  
    - Successful deletion:

    ```json
    {
      "message": "Task deleted successfully"
    }
    ```

    - Unsuccessful deletion

    ```json
    {
      "message": "Task with id <taskId>, was not found"
    }
    ```

  - Response data type for `readAllTasks`:

    See [readAllTasks](#readalltasks) event.

    [Back to content](#content)

- ### `dataError`

  Listen to this event to get error details on message body parameters.
  
  - Response
  
    ```json
    {
      "event": "dataError",
      "error": "<error_message> or <error_object>"
    }
    ```

    [Back to content](#content)

- ### `disconnectionError`

  This event is triggered when a client is not authorized.
  
  - Response
  
    ```json
    {
      "event": "disconnectionError",
      "error": "Unauthorized access"
    }
    ```

    [Back to content](#content)
