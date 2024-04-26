from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import List
import asyncio
import uuid
import configs
import json
from iterative_ai import generate_codemod
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

# WS message:
# "execution_status": "in-progress" | "finished" | "error"
# message: string
# error?: string (only when status is 'error')
# codemod?: string (only when status is 'finished' )

def create_ts_file(file_path, content):
    with open(file_path, "w") as f:
        f.write(content)

@app.websocket("/ws")
async def websocket_status(websocket: WebSocket):
    await websocket.accept()
    print("connection open")
    while True:
        try:
            print('----> waiting for data <-----')
            await asyncio.sleep(0)
            data = await websocket.receive_json()
            before = data.get('input')
            after = data.get('after')
            create_ts_file('tests/before_tmp.ts', before)
            create_ts_file('tests/after_tmp.ts', after)
            async def logger(message):
                print(message)
                await websocket.send_json(message)
                await asyncio.sleep(0)
            result = await generate_codemod('tests/before_tmp.ts', 'tests/after_tmp.ts', '.temp', configs.cmd_args.max_correction_attempts, configs.cmd_args.llm_engine, configs.cmd_args.codemod_engine, logger)
            await logger({
                "result": "finished",
                "message": "Codemod created",
                "codemod": result
            })
            print('----> end of iteration <-----')
        except WebSocketDisconnect as e:
                print(f"WebSocket disconnected")
