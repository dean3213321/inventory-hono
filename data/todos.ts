import { type Context } from "hono"

// Simulated in-memory database for todos
let todos = [
    { id: 1, title: "Learn Hono", completed: false },
    { id: 2, title: "Build a Todo API", completed: false },
]

export function getTodosData(c: Context) {
    return c.json(todos)
}

export function getTodoData(c: Context) {
    const id = Number(c.req.param('id'))
    const todo = todos.find(t => t.id === id)
    if (todo) {
        return c.json(todo)
    }
    return c.json({ error: 'Todo not found' }, 404)
}

export async function createTodoData(c: Context) {
    try {
        const body = await c.req.json<{ title: string }>()
        
        if (!body?.title) { 
            return c.json({ error: 'Title is required' }, 400) 
        }

        const newTodo = { id: todos.length + 1, title: body.title, completed: false }
        todos.push(newTodo)

        return c.json(newTodo, 201)

    } catch (error) {
        console.error("Error creating todo:", error)
        return c.json({ error: "Invalid request body" }, 400)
    }
}

export async function updateTodoData(c: Context) {
    try {
        const id = Number(c.req.param('id'))
        const body = await c.req.json<{ title?: string; completed?: boolean }>()

        const index = todos.findIndex(t => t.id === id)
        if (index === -1) { 
            return c.json({ error: 'Todo not found' }, 404) 
        }

        todos[index] = { ...todos[index], ...body }
        return c.json(todos[index])

    } catch (error) {
        console.error("Error updating todo:", error)
        return c.json({ error: "Invalid request body" }, 400)
    }
}

export function deleteTodoData(c: Context) {
    const id = Number(c.req.param('id'))
    const index = todos.findIndex(t => t.id === id)
    if (index === -1) {
        return c.json({ error: 'Todo not found' }, 404)
    }
    const deletedTodo = todos.splice(index, 1)
    return c.json(deletedTodo[0])       
}
