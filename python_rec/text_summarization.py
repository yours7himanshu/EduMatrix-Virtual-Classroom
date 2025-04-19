import PyPDF2
import requests
from io import BytesIO
from dotenv import load_dotenv
import os
load_dotenv(dotenv_path='.env')
GROQ_API_KEY= os.getenv("GROQ_API_KEY")
from groq import Groq

client = Groq(api_key=GROQ_API_KEY)
text = """Introduction

In the age of digital transformation, data has become one of the most valuable assets for businesses, organizations, and governments alike. Data science, an interdisciplinary field that uses scientific methods, algorithms, and systems to extract knowledge and insights from structured and unstructured data, is at the heart of this revolution. With the growing volume of data generated daily, the importance of data science cannot be overstated. From healthcare to business analytics, data science is transforming industries and shaping the future. This essay explores the significance of data science in various domains, its applications, and the role it plays in decision-making.

Data Science in Business

Data science has dramatically altered the way businesses make decisions. In the past, companies relied on intuition and experience to make business decisions, but now, with the power of data science, organizations are able to leverage data to make more informed, objective decisions. Data-driven decision-making enables businesses to analyze customer behavior, identify market trends, and optimize operational processes.

Predictive analytics, a branch of data science, allows businesses to forecast future trends and behaviors by analyzing historical data. This is especially valuable in areas such as marketing, where understanding customer preferences can guide targeted campaigns. A prime example is Amazon’s recommendation system, which analyzes past customer behaviors to predict future purchases, leading to increased sales.

Additionally, data science tools like business intelligence (BI) dashboards enable executives and managers to visualize data in real-time, making it easier to identify opportunities and address challenges. Companies such as Netflix and Uber also use data science to optimize their services, providing users with a personalized experience that keeps them engaged and satisfied.

Applications of Data Science in Healthcare

In healthcare, data science is transforming patient care, medical research, and hospital management. By analyzing vast amounts of medical data, including patient records, diagnostic results, and treatment outcomes, data scientists can help doctors and researchers make better decisions. For example, predictive analytics can be used to forecast disease outbreaks, allowing for early intervention and preventive measures.

Data science is also playing a crucial role in personalized medicine. By analyzing genetic information, lifestyle factors, and medical history, data scientists can help tailor treatments to individual patients, improving outcomes and reducing costs. One successful application is IBM’s Watson for Oncology, which analyzes large volumes of medical literature and patient data to assist doctors in making more accurate cancer treatment decisions.

Moreover, healthcare data science is being used for improving hospital management and operations. By analyzing patient flow and resource usage, hospitals can optimize staffing, reduce waiting times, and enhance overall efficiency. The widespread adoption of electronic health records (EHRs) has also provided a rich source of data for analysis, enabling better patient care and more efficient healthcare delivery.

Data Science in Finance

In the financial sector, data science has revolutionized how banks, insurance companies, and investment firms operate. One of the most significant applications of data science in finance is risk management. Financial institutions use data science techniques to build models that predict and mitigate risks, such as credit default or market crashes. For instance, credit scoring algorithms analyze a borrower’s credit history and other factors to determine their likelihood of repaying a loan.

Fraud detection is another critical application. By analyzing transaction data in real-time, data scientists can identify patterns of fraudulent activity and flag suspicious transactions. Machine learning algorithms continuously learn from new data, making fraud detection systems more effective over time.

Algorithmic trading, where complex algorithms analyze market data and execute trades at high speed, is another example of how data science is reshaping the finance industry. These algorithms can predict market movements and make trading decisions in fractions of a second, potentially yielding higher profits. Firms like Goldman Sachs and JPMorgan use data science to gain an edge in the highly competitive financial markets.

Machine Learning and Artificial Intelligence in Data Science

Machine learning (ML) and artificial intelligence (AI) are integral components of data science. ML algorithms can automatically learn from data and make predictions or decisions without being explicitly programmed. There are two primary types of machine learning: supervised learning, where the model is trained on labeled data, and unsupervised learning, where the model finds patterns and structures in unlabeled data.

One of the most significant contributions of ML and AI to data science is the ability to handle large, complex datasets and extract meaningful insights. For example, in natural language processing (NLP), AI systems can analyze and understand human language, leading to applications such as chatbots, language translation, and sentiment analysis.

AI-driven systems are also used in image recognition, where data scientists train models to identify objects or patterns in images. In healthcare, this has led to advancements in medical imaging, where AI systems can assist doctors in detecting diseases such as cancer from X-rays or MRI scans.

The combination of data science, machine learning, and AI has also led to the rise of autonomous systems, such as self-driving cars, which rely on vast amounts of data and advanced algorithms to navigate and make decisions in real-time.

Conclusion

As we move further into the digital age, the role of data science will only continue to grow. From helping businesses make data-driven decisions to revolutionizing healthcare and finance, data science is playing a crucial role in shaping the future. However, as with any powerful tool, there are challenges that need to be addressed. Data privacy, security, and ethical concerns around the use of personal data are some of the key issues that need to be carefully considered as data science continues to evolve.

The future of data science is bright, with continuous advancements in machine learning, artificial intelligence, and big data analytics. As more industries embrace data-driven approaches, the demand for skilled data scientists will only increase. With its transformative potential, data science will undoubtedly continue to drive innovation and provide solutions to some of the world's most pressing problems."""

def text_summarizer(text):
        # response = requests.get(pdfUrl)
        # if response.status_code == 200:
        #     file_data = BytesIO(response.content) 
        #     reader = PyPDF2.PdfReader(file_data)
        #     text = ""
        #     for page in reader.pages:
        #         text += page.extract_text()
        # else:
        #     print("Failed to download file.")
      



        chat_completion = client.chat.completions.create(
    
        messages=[
            # Set an optional system message. This sets the behavior of the
            # assistant and can be used to provide specific instructions for
            # how it should behave throughout the conversation.
            {
                "role": "system",
                "content": "You are helpful teacher assistant which summarises the content in the most precise way"
            },
            # Set a user message for the assistant to respond to.
            {
                "role": "user",
                "content": text,
            }
        ],

        # The language model which will generate the completion.
        model="llama-3.3-70b-versatile",

        #
        # Optional parameters
        #

        # Controls randomness: lowering results in less random completions.
        # As the temperature approaches zero, the model will become deterministic
        # and repetitive.
        temperature=0.5,

        # The maximum number of tokens to generate. Requests can use up to
        # 32,768 tokens shared between prompt and completion.
        max_completion_tokens=1024,

        # Controls diversity via nucleus sampling: 0.5 means half of all
        # likelihood-weighted options are considered.
        top_p=1,

        # A stop sequence is a predefined or user-specified text string that
        # signals an AI to stop generating content, ensuring its responses
        # remain focused and concise. Examples include punctuation marks and
        # markers like "[end]".
        stop=None,

        # If set, partial message deltas will be sent.
        stream=False,
)

# Print the completion returned by the LLM.
        return chat_completion.choices[0].message.content

# if __name__ == "__main__":
#     prompt = sys.argv[1]  # Get input from Node.js
#     output = text_summarizer(prompt)   
#     print(json.dumps({"result": output}))  

print(text_summarizer(text))