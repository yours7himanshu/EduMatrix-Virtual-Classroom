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

load_dotenv(dotenv_path='python_rec/.env')

mongo_URI = os.getenv("MONGO_URI")
client = MongoClient(f"{mongo_URI}")
db = client["test"]
collection1 = db["registrarfees"]
collection2 = db["studentmarksattendances"]
cursor1 = collection1.find()
cursor2 = collection2.find()
registrar = pd.DataFrame(list(cursor1))
teacher= pd.DataFrame(list(cursor2))
df=registrar.merge(teacher,on='RollNumber')

def adjust_placement(row):
    if (
        row['Marks'] >= 60 and
        row['Attendance'] >= 60 
   
    ):
        return 'Placed'
    else:
        return 'Unplaced'

df['Placed'] = df.apply(adjust_placement, axis=1)
df['Placed']=df['Placed'].astype('category')

branches=df.groupby("Branch")['Attendance'].mean().reset_index()['Branch']
att_mean=df.groupby("Branch")['Attendance'].mean().reset_index()['Attendance']
marks_mean=df.groupby("Branch")['Marks'].mean().reset_index()['Marks']

def create_bar_plot(x, y,title,xlabel):
    buf = io.BytesIO()
    plt.figure(figsize=(10,6))
    bars=plt.barh(x,y, color='skyblue', edgecolor='black')
    max_index =  np.argmax(y.values)
    min_index = np.argmin(y.values)
    bars[max_index].set_color('limegreen')
    bars[min_index].set_color('red')
    for bar in bars:
        width = bar.get_width()
        plt.text(width + 0.5, bar.get_y() + bar.get_height() / 2,
                f'{width:.2f}', va='center', fontsize=15, color='black')
    plt.title(title, fontsize=16, fontweight='bold')
    plt.xlabel(xlabel, fontsize=21,fontweight='bold', color='#34495e', labelpad=10, family='serif')
   
    plt.xlim(0, 100)
    plt.tight_layout()
    plt.gca().invert_yaxis()  
    plt.savefig(buf, format='png')
    plt.close()
    buf.seek(0)
    return base64.b64encode(buf.read()).decode('utf-8')


def top_students():
    buf = io.BytesIO()
    x=df.loc[df.groupby('Branch')['Marks'].idxmax()][['Branch', 'Marks', 'Name_x']]
    name=x['Name_x']
    marks=x['Marks']
    branch=x['Branch']
    plt.figure(figsize=(12,7))
    plot=sns.barplot(data=df, x=name, y=marks, hue=branch)
    for p in plot.patches:
        height = p.get_height()
        plot.annotate(f'{height:.1f}',
                    (p.get_x() + p.get_width() / 2., height),
                    ha='center', va='bottom',
                    color='black', fontsize=12, fontweight='bold')
    plt.legend(title='Branch', loc='center left', bbox_to_anchor=(1, 0.5), title_fontsize='medium')
    plt.xticks(rotation=70,fontsize=16,fontweight='bold',family='serif')
    plt.title("Student Marks by Branch")
    plt.tight_layout()
    plt.savefig(buf, format='png')
    plt.close()
    buf.seek(0)
    return base64.b64encode(buf.read()).decode('utf-8')
def pieplot():
        buf = io.BytesIO()
        plt.figure(figsize=(6,4))
        df['Branch'].value_counts().plot(kind='pie', autopct='%1.1f%%')
        plt.savefig(buf, format='png')
        plt.close()
        buf.seek(0)
        return base64.b64encode(buf.read()).decode('utf-8')




def scatter():
    buf = io.BytesIO()
    new_df=df[['Attendance','Marks','Branch']]
    plt.figure(figsize=(8, 6))
    sns.scatterplot(data=new_df, x=df['Attendance'], y=new_df['Marks'], hue=new_df['Branch'], s=100)
    plt.title("Attendance vs Marks")
    plt.xlabel("Attendance",fontsize=17,fontweight='bold')
    plt.ylabel("Marks",fontsize=17,fontweight='bold')
    plt.grid(True)
    plt.tight_layout()
    plt.savefig(buf, format='png')
    buf.seek(0)
    plt.close()
    return base64.b64encode(buf.read()).decode('utf-8')



def fees_status():
    
    buf = io.BytesIO()
    grouped = df.groupby(['Branch', 'Fees_status']).size().reset_index(name='count')
    plt.figure(figsize=(10,7))
    sns.barplot(data=grouped, x='Branch', y='count', hue='Fees_status', palette='Set2',)
    plt.title('Fee Status by Branch')
    plt.xlabel('Branch',fontsize=17,fontweight='bold')
    plt.ylabel('Number of Students',fontsize=17,fontweight='bold')
    plt.legend(title='Fees Status',loc='upper right')
    plt.xticks(rotation=80, fontsize=12,fontweight='bold', color='#34495e', family='serif')
    for p in plt.gca().patches:
                plt.gca().annotate(f'{int(p.get_height())}', 
                                (p.get_x() + p.get_width() / 2., p.get_height()), 
                                ha='center', va='bottom', fontsize=12, fontweight='bold')
            
    plt.tight_layout()
    plt.grid(True)
    plt.savefig(buf, format='png')
    plt.close()
    buf.seek(0)
    return base64.b64encode(buf.read()).decode('utf-8')
def placement_status():
            buf = io.BytesIO()
            plt.figure(figsize=(6,5))
            sns.set(style="whitegrid")
            palette = {'Placed': "#1f77b4", 'Unplaced': "#ff7f0e"}
            sns.countplot(data=df, x='Placed',palette=palette,width=0.3)
            plt.legend(title='Placement Status', loc='upper right', labels=['Placed', 'Unplaced'], fontsize=12)
            plt.title("Number of Students Placed vs Unplaced", fontsize=16, fontweight='bold')
            plt.xlabel("Placement Status",fontsize=17,fontweight='bold')
            plt.ylabel("Number of Students",fontsize=17,fontweight='bold')
            for p in plt.gca().patches:
                plt.gca().annotate(f'{int(p.get_height())}', 
                                (p.get_x() + p.get_width() / 2., p.get_height()), 
                                ha='center', va='bottom', fontsize=12, fontweight='bold')
            plt.tight_layout()
            plt.savefig(buf, format='png')
            plt.close()
            buf.seek(0)
            return base64.b64encode(buf.read()).decode('utf-8')

def branch_placement():
            buf=io.BytesIO()
            plt.figure(figsize=(10, 6))

            palette = {'Placed': "#5B21B6", 'Unplaced': "#f78fb3"}

            sns.countplot(data=df, x='Branch', hue='Placed', palette=palette)

            plt.title("Branch-wise Placement Status", fontsize=16, fontweight='bold')
            plt.xlabel("Branch", fontsize=17,fontweight='bold')
            plt.ylabel("Number of Students", fontsize=17,fontweight='bold')
            plt.xticks(rotation=45,fontsize=12,fontweight='bold', color='#34495e', family='serif')
            for p in plt.gca().patches:
                height = p.get_height()
                if height > 0:
                    plt.gca().annotate(f'{int(height)}',
                                    (p.get_x() + p.get_width() / 2., height),
                                    ha='center', va='bottom',
                                    fontsize=10, fontweight='bold')


            plt.legend(title='Placement Status', loc='upper right', fontsize=11)
            plt.tight_layout()
            plt.savefig(buf,format='png')
            plt.close()
            buf.seek(0)
            return base64.b64encode(buf.read()).decode('utf-8')



print(json.dumps({'result':{
     'barplot1':create_bar_plot(branches,att_mean,"Engineering Branch Scores","Attendance (Mean)"),
     'barplot2':create_bar_plot(branches,marks_mean,"Engineering Branch Scores","Marks (Mean)"),
     'scatter':scatter(),
     'top_students':top_students(),
     'pieplot':pieplot(),
     'fees_status':fees_status(),
     'placement_status':placement_status(),
     'branch_placement':branch_placement()
}}))

