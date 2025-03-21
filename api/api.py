from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
from stable_baselines3 import PPO

app = FastAPI()

# Load the trained model
model = PPO.load("ppo_colormatch")

class Observation(BaseModel):
    obs: list  # List of observation values

@app.post("/predict")
def predict(observation: Observation):
    obs_array = np.array(observation.obs).reshape(1, -1)
    action, _states = model.predict(obs_array)
    return {"action": int(action)}