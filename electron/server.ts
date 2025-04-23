import express, { type Request, type Response } from "express"
import type { Server } from "http"
import  cors from 'cors'
interface ApiData {
  message: string
  timestamp: string
}

interface SubmitResponse {
  success: boolean
  receivedData: any
}
const app = express()
const PORT = 3002
app.use(cors())
app.use(express.json())

// Define a basic route
app.get('/api/data', (_req: Request, res: Response) => {
  // console.log(req.body);
  const data: ApiData = { 
    message: 'Data from Express server', 
    timestamp: new Date().toISOString() 
  }
  res.json(data)
})

app.post('/api/submit', (req: Request, res: Response) => {
  const data = req.body
  console.log('Received data:', data)
  
  const response: SubmitResponse = { 
    success: true, 
    receivedData: data 
  }
  res.json(response)
})

let server: Server | null = null

export function startServer(): Server {
  server = app.listen(PORT, () => {
    console.log(`Express server is running on port ${PORT}`)
  })
  return server
}

export function stopServer(): void {
  if (server) {
    server.close()
  }
}
