import React from 'react'
import { useQuery, useMutation, useQueryClient, UseQueryResult } from "react-query";
import { getTodos, addTodo, updateTodo, deleteTodo } from "../../api/todosApi";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faUpload } from "@fortawesome/free-solid-svg-icons";

import { useState } from "react";
import "../../styles/Todos.css";
import { TodoObject } from '../../api/types';

interface TodosProps { }

// interface MyUseQueryResult extends UseQueryResult {
//     isLoading: boolean;
//     isError: boolean;
//     error: any;
//     data: TodoObject[];
// }

const TodoList: React.FC<TodosProps> = (props) => {
    const [newTodo, setNewTodo] = useState("");
    const queryClient = useQueryClient();

    const { isLoading, isError, error, data: todos }: UseQueryResult = useQuery("todos", getTodos, {
        // reverse the list so the newest todos are at the top:
        select: (data) => data.sort((a: TodoObject, b: TodoObject) => b.id - a.id),
    });
    // const result: UseQueryResult = useQuery("todos", getTodos);

    const addTodoMutation = useMutation(addTodo, {
        onSuccess: () => {
            console.log("OnSuccess of addTodoMutation");
            // Invalidates the `todo` cache when we add a new todo and then it triggers the refetch so we get the new todos list with the new todo added.
            queryClient.invalidateQueries("todos");
        }
    });

    const updateTodoMutation = useMutation(updateTodo, {
        onSuccess: () => {
            // Invalidates the `todo` cache when we update a new todo and then it triggers the refetch so we get the new todos list with the todo updated.
            queryClient.invalidateQueries("todos");
        }
    });

    const deleteTodoMutation = useMutation(deleteTodo, {
        onSuccess: () => {
            // Invalidates the `todo` cache when we delete a  todo and then it triggers the refetch so we get the new todos list with the todo deleted.
            queryClient.invalidateQueries("todos");
        }
    });

    // So now we have integrated our axios methods with react-query and we have the data from the server and we have the methods to add, update and delete todos.

    const handleSubmit = (e: any) => {
        e.preventDefault();
        addTodoMutation.mutate({
            userId: 1,
            title: newTodo,
            completed: false,
        });
        setNewTodo("");
    }

    const NewItemSection = (
        <form onSubmit={handleSubmit}>
            <label htmlFor="new-todo">What needs to be done?</label>
            <div className="new-todo">
                <input
                    id="new-todo"
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="New todo"
                />
            </div>
            <button className="submit">
                <FontAwesomeIcon icon={faUpload} />
            </button>
        </form>
    );

    let Content;
    if (isLoading) {
        Content = <div>Loading...</div>;
    }
    else if (isError) {
        Content = <p>{(error as any).message}</p>
    }
    else {
        Content = (todos as TodoObject[]).map((todo: TodoObject) => {
            return (
                <article key={todo.id}>
                    <div className="todo">
                        <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => {
                                updateTodoMutation.mutate({ ...todo, completed: !todo.completed });
                            }}
                        />
                        <label htmlFor={todo.id + ""}>{todo.title}</label>
                    </div>
                    <button
                        className="trash"
                        onClick={() => deleteTodoMutation.mutate({ id: todo.id })}
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                </article>
            )
        });
    }



    return (
        <main>
            <>
                <h1>Todo List</h1>
                {NewItemSection}
                {Content}
            </>
        </main>
    )

}
export default TodoList
