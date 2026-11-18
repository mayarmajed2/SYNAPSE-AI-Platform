"""Real-time WebSocket event broadcaster for live multi-agent execution."""

import json
from typing import Any, Dict, List
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        # Maps project_id to list of active WebSockets
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # Global listeners (for overview, logs, status)
        self.global_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, project_id: str = "global"):
        await websocket.accept()
        if project_id == "global":
            self.global_connections.append(websocket)
        else:
            if project_id not in self.active_connections:
                self.active_connections[project_id] = []
            self.active_connections[project_id].append(websocket)

    def disconnect(self, websocket: WebSocket, project_id: str = "global"):
        if project_id == "global":
            if websocket in self.global_connections:
                self.global_connections.remove(websocket)
        else:
            if project_id in self.active_connections:
                if websocket in self.active_connections[project_id]:
                    self.active_connections[project_id].remove(websocket)
                if not self.active_connections[project_id]:
                    del self.active_connections[project_id]

    async def broadcast_to_project(self, project_id: str, event_type: str, data: Dict[str, Any]):
        """Broadcast an event payload to all clients viewing a specific project."""
        message = json.dumps({"event": event_type, "project_id": project_id, "data": data})
        
        # Send to project subscribers
        if project_id in self.active_connections:
            dead_connections = []
            for connection in self.active_connections[project_id]:
                try:
                    await connection.send_text(message)
                except Exception:
                    dead_connections.append(connection)
            for dead in dead_connections:
                self.disconnect(dead, project_id)

        # Also forward to global listeners
        dead_globals = []
        for connection in self.global_connections:
            try:
                await connection.send_text(message)
            except Exception:
                dead_globals.append(connection)
        for dead in dead_globals:
            self.disconnect(dead, "global")

    async def broadcast_global(self, event_type: str, data: Dict[str, Any]):
        """Broadcast a platform-wide event to all global WebSocket listeners."""
        message = json.dumps({"event": event_type, "project_id": None, "data": data})
        dead_globals = []
        for connection in self.global_connections:
            try:
                await connection.send_text(message)
            except Exception:
                dead_globals.append(connection)
        for dead in dead_globals:
            self.disconnect(dead, "global")

    def get_stats(self) -> Dict[str, Any]:
        """Return current connection statistics."""
        return {
            "project_connections": {pid: len(conns) for pid, conns in self.active_connections.items()},
            "global_connections": len(self.global_connections),
            "total_active": sum(len(c) for c in self.active_connections.values()) + len(self.global_connections),
        }


ws_manager = ConnectionManager()

