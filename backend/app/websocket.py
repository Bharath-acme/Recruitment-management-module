# app/websocket.py
from fastapi import WebSocket
from typing import Dict

connected_clients: Dict[int, WebSocket] = {}

async def connect_user(user_id: int, websocket: WebSocket):
    await websocket.accept()
    connected_clients[user_id] = websocket
    print(f"✅ User {user_id} connected")

async def disconnect_user(user_id: int):
    if user_id in connected_clients:
        del connected_clients[user_id]
        print(f"❌ User {user_id} disconnected")

async def send_notification(user_id: int, data: dict):
    websocket = connected_clients.get(user_id)
    if websocket:
        await websocket.send_json(data)
