from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import List
import asyncio
import uuid
from iterative_ai import generate_codemod_from_api
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def send_codemod_updates(websocket: WebSocket):
    while True:
        try:
            execution_status = "Running"
            message = "Execution started"
            await websocket.send_json({
                "execution_status": execution_status,
                "message": message
            })
        except WebSocketDisconnect:
            print("WebSocket disconnected (send loop)")
            break

async def receive_messages(websocket: WebSocket):
    while True:
        try:
            data = await websocket.receive_json()
            input = data.get('input')
            after = data.get('after')
            print(f"Received from client - Input: {input}, After: {after}")
            generate_codemod_from_api(before, after, websocket)
        except WebSocketDisconnect:
            print("WebSocket disconnected (receive loop)")
            break
        except Exception as e:
            print(f"Error receiving message: {e}")

@app.websocket("/ws/status")
async def websocket_status(websocket: WebSocket):
    await websocket.accept()
    send_task = asyncio.create_task(send_codemod_updates(websocket))
    receive_task = asyncio.create_task(receive_messages(websocket))

    done, pending = await asyncio.wait(
        [send_task, receive_task],
        return_when=asyncio.FIRST_COMPLETED
    )

    for task in pending:
        task.cancel()

    print("WebSocket communication finished.")