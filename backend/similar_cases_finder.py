import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
import torch
from transformers import AutoTokenizer, AutoModel

# Load the tokenizer and model
model_path = './KanoonBert'
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModel.from_pretrained(model_path)

# Load the CSV file with topic modeling and content
csv_file_path = "./dataset.csv"
df = pd.read_csv(csv_file_path).dropna()
df = df.astype(str)

# Define the function for processing documents
def split_and_merge(doc_text):
    if isinstance(doc_text, str):
        tokens = tokenizer([doc_text], return_tensors='pt', padding=True, truncation=True)
    else:
        tokens = tokenizer(doc_text, return_tensors='pt', padding=True, truncation=True)

    with torch.no_grad():
        outputs = model(**tokens)

    last_hidden_state = outputs.last_hidden_state
    sentence_embeddings = torch.mean(last_hidden_state, dim=1)
    sentence_embeddings = torch.nn.functional.normalize(sentence_embeddings, p=2, dim=1)
    document_embedding = torch.mean(sentence_embeddings, dim=0)
    document_embedding = torch.nn.functional.normalize(document_embedding, p=2, dim=0)

    return document_embedding

# Define the class that will find similar cases
class SimilarCasesFinder:
    @staticmethod
    def find_similar_cases(query, new_df=df):
        if isinstance(query, str) and '.txt' in query:
            query_doc = new_df[new_df['File Name'] == query]['Content'].values[0]
            query_embedding = split_and_merge(query_doc)
            with open(query, 'r') as file:
                query_text = file.read()
            query_embedding = split_and_merge(query_text)
        else:
            query_embedding = split_and_merge(query)

        doc_embeddings = np.load('./document_embeddings.npy')

        if len(query_embedding.shape) == 1:
            query_embedding = query_embedding.reshape(1, -1)

        if len(doc_embeddings.shape) == 1:
            doc_embeddings = doc_embeddings.reshape(len(new_df), -1)

        similarities = cosine_similarity(query_embedding, doc_embeddings).flatten()

        top_k = 5
        top_indices = similarities.argsort()[-(top_k):][::-1]
        top_similar_cases = new_df.iloc[top_indices]
        top_similar_scores = similarities[top_indices]

        top_similar_cases['Similarity Score'] = top_similar_scores
        top_similar_cases = top_similar_cases[top_similar_cases['File Name'] != query]

        return top_similar_cases
