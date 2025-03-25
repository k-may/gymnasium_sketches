from typing import Optional

from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
from stable_baselines3 import PPO
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:3002",  # Allow frontend in React/Vue/Angular
    "http://127.0.0.1:3002",   # Allow Vite frontend
    "http://127.0.0.1:5500",  # Allow local HTML files
    "*",  # Allow all origins (not recommended for production)
]
# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow specific origins
    allow_credentials=True,  # Allow cookies
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)
# Load the trained model
palette_exp = PPO.load("./fast_api/palette")
palette_lin = PPO.load("./fast_api/palette_lin")

class Observation(BaseModel):
    target : list  # List of observation values
    current : list
    type : Optional[str] = "LIN"

@app.post("/predict")
def predict(observation: Optional[Observation] = None):

    model = palette_lin

    if observation is None:
        target_color = np.random.randint(0, 255, 3)
        current_color = np.random.randint(0, 255, 3)
    else:
        current_color = np.array(observation.current)
        target_color = np.array(observation.target)

        if observation.type == "EXP":
            model = palette_exp


    result = []
    done = False
    count = 0
    while not done:
        count += 1
        obs = np.concatenate([current_color, target_color])
        action, _ = model.predict(obs)

        step_size = 1
        if action == 0: current_color[0] += step_size  # Increase R
        elif action == 1: current_color[0] -= step_size  # Decrease R
        elif action == 2: current_color[1] += step_size  # Increase G
        elif action == 3: current_color[1] -= step_size  # Decrease G
        elif action == 4: current_color[2] += step_size  # Increase B
        elif action == 5: current_color[2] -= step_size  # Decrease B

        current_color = np.clip(current_color, 0, 255)

        # done = np.all(np.array(current_color) == np.array(target_color))
        if count > 100000:
            result = [count]
            done = True
        else:
            done = np.linalg.norm(current_color - target_color) < 0.01
            result.append(current_color.tolist())
        # action, _states = palette.predict(obs)
    return {"result": result, "current": current_color.tolist(), "target": target_color.tolist()}