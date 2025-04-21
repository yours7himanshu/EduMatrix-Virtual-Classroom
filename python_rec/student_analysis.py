import io
import base64
import json
import sys
import numpy as np
import pandas as pd
from pymongo import MongoClient
import matplotlib.pyplot as plt
from dotenv import load_dotenv
import seaborn as sns
import os
load_dotenv(dotenv_path='.env')
mongo_URI = os.getenv("MONGO_URI")
client = MongoClient(f"{mongo_URI}")
db = client["test"]
collection = db["demo"]
cursor = collection.find()
df = pd.DataFrame(list(cursor))
branches=df.groupby("Branch")['Attendance (%)'].mean().reset_index()['Branch']
att_mean=df.groupby("Branch")['Attendance (%)'].mean().reset_index()['Attendance (%)']
marks_mean=df.groupby("Branch")['Marks (%)'].mean().reset_index()['Marks (%)']

def create_bar_plot(x, y,title,xlabel):
    buf = io.BytesIO()
    plt.figure(figsize=(6,4))
    bars=plt.barh(x,y, color='skyblue', edgecolor='black')
    max_index =  np.argmax(y.values)
    min_index = np.argmin(y.values)
    bars[max_index].set_color('limegreen')
    bars[min_index].set_color('red')
    for bar in bars:
        width = bar.get_width()
        plt.text(width + 0.5, bar.get_y() + bar.get_height() / 2,
                f'{width:.2f}', va='center', fontsize=10, color='black')
    plt.title(title, fontsize=16, fontweight='bold')
    plt.xlabel(xlabel, fontsize=12)
    plt.xlim(0, 100)
    plt.tight_layout()
    plt.gca().invert_yaxis()  
    plt.savefig(buf, format='png')
    buf.seek(0)
    return base64.b64encode(buf.read()).decode('utf-8')


def top_students():
    buf = io.BytesIO()
    x=df.loc[df.groupby('Branch')['Marks (%)'].idxmax()][['Branch', 'Marks (%)', 'Name']]
    name=x['Name']
    marks=x['Marks (%)']
    branch=x['Branch']
    plt.figure(figsize=(12,5))
    plot=sns.barplot(data=df, x=name, y=marks, hue=branch)
    for p in plot.patches:
        height = p.get_height()
        plot.annotate(f'{height:.1f}',
                    (p.get_x() + p.get_width() / 2., height),
                    ha='center', va='bottom',
                    fontsize=9, color='black')
    plt.legend(title='Branch', loc='center left', bbox_to_anchor=(1, 0.5), fontsize='small', title_fontsize='small')
    plt.xticks(rotation=45)
    plt.title("Student Marks by Branch")
    plt.tight_layout()
    plt.savefig(buf, format='png')
    buf.seek(0)
    return base64.b64encode(buf.read()).decode('utf-8')
def pieplot():
        buf = io.BytesIO()
        df['Branch'].value_counts().plot(kind='pie', autopct='%1.1f%%')
        plt.savefig(buf, format='png')
        buf.seek(0)
        return base64.b64encode(buf.read()).decode('utf-8')




def scatter():
    buf = io.BytesIO()
    new_df=df[['Attendance (%)','Marks (%)','Branch']]
    plt.figure(figsize=(8, 6))
    sns.scatterplot(data=new_df, x=df['Attendance (%)'], y=new_df['Marks (%)'], hue=new_df['Branch'], s=100)

    plt.title("Attendance vs Marks")
    plt.xlabel("Attendance (%)")
    plt.ylabel("Marks (%)")
    plt.grid(True)
    plt.tight_layout()
    plt.savefig(buf, format='png')
    buf.seek(0)
    return base64.b64decode(buf.read()).decode('latin-1')







print(json.dumps({'result':{
     'barplot1':create_bar_plot(branches,att_mean,"Engineering Branch Scores","Attendance"),
     'barplot2':create_bar_plot(branches,marks_mean,"Engineering Branch Scores","Marks"),
     'scatter':scatter(),
     'top_students':top_students(),
     'pieplot':pieplot()
}}))

