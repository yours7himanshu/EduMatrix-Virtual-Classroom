from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.compose import ColumnTransformer
from sklearn.metrics import accuracy_score,recall_score,f1_score
import numpy as np
import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv
import os
load_dotenv(dotenv_path='python_rec/.env')
mongo_URI = os.getenv("MONGO_URI")
client = MongoClient(f"{mongo_URI}")
db = client["test"]
collection = db["demo"]
cursor = collection.find()
df = pd.DataFrame(list(cursor))
def adjust_placement(row):
    if (
        row['Adjusted Marks'] >= 60 and
        row['Adjusted Attendance'] >= 70 and
        row['Branch'] in ['Computer Science', 'Information Technology', 'Electronics and Communication','Electrical Engineering','Biotechnology']
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
y_pred=model.predict(x_test)
print(accuracy_score(y_test,y_pred)*100)
