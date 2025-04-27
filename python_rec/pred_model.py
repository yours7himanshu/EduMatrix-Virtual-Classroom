from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.compose import ColumnTransformer
from sklearn.metrics import accuracy_score,recall_score,f1_score
import numpy as np
import pandas as pd
from pymongo import MongoClient
import os
import sys
import json

# Load .env only in development
if os.getenv("ENV", "development") != "production":
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

mongo_URI = os.environ["MONGO_URI"]
client = MongoClient(mongo_URI)
db = client["test"]
collection = db["demo"]
cursor = collection.find()
df = pd.DataFrame(list(cursor))
def adjust_placement(row):
    if (
        row['Adjusted Marks'] >= 60 and
        row['Adjusted Attendance'] >= 60 
   
    ):
        return 1
    else:
        return 0

df['Placed'] = df.apply(adjust_placement, axis=1)
df=df[['Adjusted Marks','Adjusted Attendance','Branch','Placed']]
X=df.drop('Placed',axis=1)
Y=df['Placed']

onehot=OneHotEncoder()
feature_column=['Branch']
transformer=ColumnTransformer([(
    'onehot',onehot,feature_column
)],remainder='passthrough')
np.random.seed(42)
transform_x=transformer.fit_transform(X)
x_train,x_test,y_train,y_test=train_test_split(transform_x,Y,test_size=0.2,random_state=42)
model=RandomForestClassifier(n_estimators=100).fit(x_train,y_train)
def predictor(arr):
    arr = list(arr)
    input_text=pd.DataFrame([arr],columns=['Adjusted Marks','Adjusted Attendance','Branch'])
    y_pred=model.predict(transformer.transform(input_text))
    if(y_pred[0]==1):
        return "Placed"
    else:
        return "Not Placed"
    
if __name__ == "__main__":
    prompt1 = sys.argv[1]
    prompt2 = sys.argv[2]
    prompt3 = sys.argv[3] 
    prompt = [prompt1,prompt2,prompt3]
    output = predictor(prompt)
    print(json.dumps({"result": output})) 
