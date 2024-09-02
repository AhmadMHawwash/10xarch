"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { P } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useState } from "react";

export interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

const TodoList = ({
  todos,
  setTodos,
}: {
  todos: TodoItem[];
  setTodos: (todos: TodoItem[]) => void;
}) => {
  const [newTodo, setNewTodo] = useState("");

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, { id: Date.now(), text: newTodo, completed: false }]);
      setNewTodo("");
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <div className="p-1">
      <div className="mb-4 flex items-center">
        <Input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          className="mr-2 flex-grow"
          placeholder="Add a new todo"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addTodo();
            }
          }}
        />
        <Button variant="secondary" size="sm" onClick={addTodo}>
          Add
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-250px)]">
        <ul>
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="group mb-2 flex items-center justify-center p-2"
            >
              <Checkbox
                checked={todo.completed}
                onCheckedChange={() => toggleTodo(todo.id)}
                className="mr-2"
              />
              <P
                className={cn(
                  "!m-0 text-center",
                  todo.completed ? "line-through" : "",
                )}
              >
                {todo.text}
              </P>
              <Button
                variant="outline"
                size="xs"
                onClick={() => deleteTodo(todo.id)}
                className="ml-auto rounded-full opacity-10 group-hover:opacity-100"
              >
                <X size={12} />
              </Button>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
};

export default TodoList;
