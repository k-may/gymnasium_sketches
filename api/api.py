from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
from stable_baselines3 import PPO

app = FastAPI()

# Load the trained model
palette = PPO.load("./api/palette")

class Observation(BaseModel):
    target_color : list  # List of observation values
    current_color : list

@app.post("/predict")
def predict(observation: Observation):

    current_color = np.array(observation.current_color)
    target_color = np.array(observation.target_color)

    result = []
    done = False
    count = 0
    while not done:
        count += 1
        obs = np.concatenate([current_color, target_color])
        action, _ = palette.predict(obs)

        step_size = 1
        if action == 0: current_color[0] += step_size  # Increase R
        elif action == 1: current_color[0] -= step_size  # Decrease R
        elif action == 2: current_color[1] += step_size  # Increase G
        elif action == 3: current_color[1] -= step_size  # Decrease G
        elif action == 4: current_color[2] += step_size  # Increase B
        elif action == 5: current_color[2] -= step_size  # Decrease B

        # done = np.all(np.array(current_color) == np.array(target_color))
        if count > 100000:
            result = [count]
            done = True
        else:
            done = np.linalg.norm(current_color - target_color) < 0.01
            result.append(current_color.tolist())
        # action, _states = palette.predict(obs)
    return {"result": result}