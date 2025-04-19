import numpy as np
import pandas as pd
from pymongo import MongoClient
import matplotlib.pyplot as plt
from dotenv import load_dotenv
import os
load_dotenv(dotenv_path='./env')
mongo_URI = os.getenv("MONGO_URI")
client = MongoClient(f"{mongo_URI}")
db = client["test"]
collection = db["demo"]
cursor = collection.find()
df = pd.DataFrame(list(cursor))
# print(df.groupby('Branch')['Attendance (%)'].mean())
grouped = df.groupby("Branch")[["Attendance (%)", "Marks (%)"]].mean().sort_values("Marks (%)", ascending=False)

plt.style.use('fivethirtyeight')  # You can also try: 'ggplot', 'fivethirtyeight', 'bmh'

# Set up the plot
fig, ax = plt.subplots(1, 2, figsize=(14, 6))

# Bar plot for Attendance
grouped["Attendance (%)"].plot(kind="bar", ax=ax[0], color='#4682B4')
ax[0].set_title("Average Attendance by Branch", fontsize=14, weight='bold')
ax[0].set_ylabel("Attendance (%)")
ax[0].tick_params(axis='x', rotation=45)

# Bar plot for Marks
grouped["Marks (%)"].plot(kind="bar", ax=ax[1], color='#FF7F50')
ax[1].set_title("Average Marks by Branch", fontsize=14, weight='bold')
ax[1].set_ylabel("Marks (%)")
ax[1].tick_params(axis='x', rotation=45)

plt.suptitle("Branch-wise Mean Attendance and Marks", fontsize=16, weight='bold')
plt.tight_layout(rect=[0, 0.03, 1, 0.95])
plt.show()