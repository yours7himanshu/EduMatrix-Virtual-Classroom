import numpy as np
import pandas as pd
from pymongo import MongoClient
import matplotlib.pyplot as plt
from dotenv import load_dotenv
import os
load_dotenv(dotenv_path='server/.env')
mongo_URI = os.getenv("MONGO_URI")
client = MongoClient(f"{mongo_URI}")
db = client["test"]
collection = db["demo"]
cursor = collection.find()
df = pd.DataFrame(list(cursor))
print(df.groupby('Branch')['Attendance (%)'].mean())

