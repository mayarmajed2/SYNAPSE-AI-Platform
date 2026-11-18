from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.websocket_manager import ws_manager

router = APIRouter(tags=["WebSocket"])


@router.websocket("/ws/projects/{project_id}")
async def websocket_project_endpoint(websocket: WebSocket, project_id: str):
    """Real-time bidirectional event channel for live workflow and agent tracking."""
    await ws_manager.connect(websocket, project_id=project_id)
    try:
        while True:
            # Keep connection open and accept ping / client messages
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text('{"event": "pong"}')
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, project_id=project_id)


@router.websocket("/ws/global")
async def websocket_global_endpoint(websocket: WebSocket):
    """Global system status and cross-project activity streaming."""
    await ws_manager.connect(websocket, project_id="global")
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text('{"event": "pong"}')
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, project_id="global")

