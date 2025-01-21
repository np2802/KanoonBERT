from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import fitz
from similar_cases_finder import SimilarCasesFinder
from flask import Flask, jsonify
import firebase_admin
from firebase_admin import credentials, storage
import datetime

app = Flask(__name__)
CORS(app)

# Initialize the Firebase Admin SDK
cred = credentials.Certificate('./service.json')
firebase_admin.initialize_app(cred, {
    'storageBucket': 'legal-retrieval-system.appspot.com'
})

expiration_time = datetime.datetime.utcnow() + datetime.timedelta(days=5)

def get_download_url_by_name(file_name):
    try:
        bucket = storage.bucket()

        blobs = bucket.list_blobs()
        for blob in blobs:
            if blob.name.endswith(file_name):
                server_path = blob.generate_signed_url(datetime.timedelta(seconds=999999999), method='GET')
                return server_path

        return None
    except Exception as e:
        print("Error retrieving download URL by name:", e)
        return None
    
@app.route('/response_query', methods=['GET'])
def get_data():
    query_param = request.args.get('query')
    top_similar_cases = SimilarCasesFinder.find_similar_cases(query_param)

    response_data = []
    for i, (file_name, similarity_score,summary) in enumerate(zip(top_similar_cases['File Name'].tolist(), top_similar_cases['Similarity Score'].tolist(),top_similar_cases['Summary'].tolist())):
        url=get_download_url_by_name(file_name)
        response_data.append({
            "question": f"Case {i+1}",
            "answer": f"{file_name} (Similarity Score: {similarity_score:.4f})",
            "url":url,
            "summary":f"{summary}"
        })

    return response_data

def extract_text_from_file(file_path, file_type):
    text = ""
    if file_type == 'txt':
        with open(file_path, 'r') as file:
            text = file.read()
    elif file_type == 'pdf':
        doc = fitz.open(file_path)
        for page in doc:
            text += page.get_text()
    return text

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        file_type = file.filename.split('.')[-1].lower()
        if file_type not in ['txt', 'pdf']:
            return jsonify({"error": "Unsupported file type"}), 400

        file_path = os.path.join(file.filename)
        file.save(file_path)
        
        extracted_text = extract_text_from_file(file_path, file_type)
        
        os.remove(file_path)

        top_similar_cases = SimilarCasesFinder.find_similar_cases(extracted_text)

        response_data = []
        for i, (file_name, similarity_score,summary) in enumerate(zip(top_similar_cases['File Name'].tolist(), top_similar_cases['Similarity Score'].tolist(),top_similar_cases['Summary'].tolist())):
            url=get_download_url_by_name(file_name)
            response_data.append({
                "question": f"Case {i+1}",
                "answer": f"{file_name} (Similarity Score: {similarity_score:.4f})",
                "url":url,
                "summary": summary
            })

        return response_data

if __name__ == '__main__':
    app.run(debug=True)