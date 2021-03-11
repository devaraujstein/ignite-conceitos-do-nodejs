const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user){
    return response.status(404).send({error: 'User doesn\'t exists!'});
  }

  request.username = username;

  return next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;

  const userExists = users.some(user => user.username === username);

  if(userExists){
    return response.status(400).send({error: 'User already exists!'});
  }

  const user = {
    name,
    username,
    id: uuidv4(),
    todos: []
  }

  users.push(user);

  return response.status(201).send(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request;

  const user = users.find(user => user.username === username);

  return response.status(200).send(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request;

  const {title, deadline} = request.body;

  const user = users.find(user => user.username === username);

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).send(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const {id} = request.params;
  const updatedTodo = request.body;
  
  const user = users.find(user => user.username === username);

  const todoIndex = user.todos.findIndex(todo => todo.id === id);

  if(todoIndex < 0){
    return response.status(404).send({error: 'Todo doesnt exists! '});
  }

  const todo = {...user.todos[todoIndex], ...updatedTodo };

  user.todos[todoIndex] = todo;

  return response.send(todo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const user = users.find(user => user.username === username);

  const todo = user.todos.find(todo => todo.id === id);
  
  if(!todo){
    return response.status(404).send({error: 'Todo doesnt exists! '});
  }

  todo.done = true;

  return response.send(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const user = users.find(user => user.username === username);

  const todo = user.todos.find(todo => todo.id === id);

  if(!todo){
    return response.status(404).send({error: 'Todo doesnt exists! '});
  }

  user.todos.splice(todo, 1);

  return response.status(204).send();
});

module.exports = app;