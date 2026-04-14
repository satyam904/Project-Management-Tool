import { http, HttpResponse } from 'msw'

export const handlers = [
  http.post('http://localhost:8000/api/v1/auth/login/', async ({ request }) => {
    const data = await request.json() as any
    if (data.email === 'test@test.com' && data.password === 'Password@1') {
      return HttpResponse.json({
        data: { access: 'tok', refresh: 'ref', user: { id: '1', email: 'test@test.com', first_name: 'Test', last_name: 'User' } }
      })
    }
    return HttpResponse.json({ error: 'Invalid config' }, { status: 400 })
  }),
  
  http.post('http://localhost:8000/api/v1/auth/register/', async ({ request }) => {
    const data = await request.json() as any
    if (data.email === 'test@test.com') {
      return HttpResponse.json({
        data: { access: 'tok', refresh: 'ref', user: { id: '1', email: 'test@test.com', first_name: 'Test', last_name: 'User' } }
      })
    }
    return HttpResponse.json({ error: 'Invalid config' }, { status: 400 })
  }),

  http.get('http://localhost:8000/api/v1/projects/', () => {
    return HttpResponse.json({
      data: {
        results: [
          { id: '1', title: 'Project one', status: 'active', task_count: 5 },
          { id: '2', title: 'Project two', status: 'completed', task_count: 0 },
          { id: '3', title: 'Project three', status: 'active', task_count: 2 },
        ]
      }
    })
  }),
  http.post('http://localhost:8000/api/v1/projects/', async () => {
    return HttpResponse.json({ data: { id: '4', title: 'New Project', status: 'active' } })
  }),
  http.put('http://localhost:8000/api/v1/projects/:id/', async () => {
    return HttpResponse.json({ data: { id: '1', title: 'Updated Project', status: 'active' } })
  }),
  http.delete('http://localhost:8000/api/v1/projects/:id/', () => {
    return HttpResponse.json({ message: 'Deleted' })
  }),
  http.get('http://localhost:8000/api/v1/projects/:id/tasks/', () => {
    return HttpResponse.json({
       data: {
         results: [
           { id: 't1', title: 'Task Todo', status: 'todo' },
           { id: 't2', title: 'Task In Prog', status: 'in_progress' },
           { id: 't3', title: 'Task Done', status: 'done' },
         ]
       }
    })
  }),
  http.get('http://localhost:8000/api/v1/projects/:id/', () => {
    return HttpResponse.json({
       data: { id: '1', title: 'Project one', status: 'active', task_count: 5 }
    })
  }),

  // Task endpoints
  http.get('http://localhost:8000/api/v1/tasks/', ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    let results = [
      { id: 't1', title: 'Task Todo', status: 'todo', priority: 'medium', due_date: null, assigned_to: null },
      { id: 't2', title: 'Task In Prog', status: 'in-progress', priority: 'high', due_date: null, assigned_to: null },
      { id: 't3', title: 'Task Done', status: 'done', priority: 'low', due_date: null, assigned_to: null }
    ]
    if (status) {
      results = results.filter(t => t.status === status)
    }
    return HttpResponse.json({ data: { results } })
  }),
  http.post('http://localhost:8000/api/v1/tasks/', async () => {
    return HttpResponse.json({ data: { id: 't99' } })
  }),
  http.get('http://localhost:8000/api/v1/tasks/:id/', () => {
    return HttpResponse.json({ data: { id: 't1', title: 'Task Todo', status: 'todo', priority: 'medium', due_date: null, assigned_to: null } })
  }),
  http.patch('http://localhost:8000/api/v1/tasks/:id/', async () => {
    return HttpResponse.json({ data: { id: 't1' } })
  }),
  http.delete('http://localhost:8000/api/v1/tasks/:id/', () => {
    return HttpResponse.json({ message: 'Deleted' })
  }),
  http.get('http://localhost:8000/api/v1/tasks/:id/comments/', () => {
    return HttpResponse.json({ data: { results: [] } })
  })
]
