from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import math
import os
import orjson
import time
from collections import defaultdict
from nltk.tokenize import word_tokenize
from utility import preprocess, calculate_byte_offset, load_lexicon, load_lexicon_trie, build_trie, read_row_by_byte_offset, autocomplete

app = Flask(__name__)
CORS(app)

lexicon = {}
df = pd.DataFrame()

top_10_results = [(6835, {'byte_offset': 9040287}), (124369, {'byte_offset': 173489852}), (22679, {'byte_offset': 29713425}), (33470, {'byte_offset': 44328753}), (21085, {'byte_offset': 27681541}), (24494, {'byte_offset': 32075782}), (167004, {'byte_offset': 232005384}), (5229, {'byte_offset': 7111431}), (3885, {'byte_offset': 5416440}), (4112, {'byte_offset': 5708273})]

def compute_bm25(query_terms, k1=1.5, b=0.75):
    base_path = "D:\\code\\DSAProject\\reSearch\\barrels\\"
    scores = defaultdict(lambda: {"score": 0.0, "byte_offset": None})
    total_time = 0
    
    for term in query_terms:
        term = term.lower()
        print(f"Processing query term: {term}")
        term_id = lexicon.get(term)
        if term_id is None:
            print(f"Term '{term}' not found in lexicon.")
            continue

        barrel_index = int(term_id) % 120
        barrel_path_parquet = os.path.join(base_path, f"barrel_{barrel_index}.parquet")
        barrel_df = pd.read_parquet(barrel_path_parquet)

        term_row_no = math.floor(term_id / 120)
        barrel = {barrel_df.iloc[term_row_no]["WordId"]: orjson.loads(barrel_df.iloc[term_row_no]["DocumentDetails"])}
        print(barrel)
        print(term_id)
        if str(term_id) in barrel:
            print(f"Found term '{term}' in barrel.")
            postings = barrel[str(term_id)]
            doc_freq = len(postings)
            num_docs = 200000
            idf = math.log((num_docs - doc_freq + 0.5) / (doc_freq + 0.5) + 1)

            for posting in postings:
                doc_id = posting["DocumentID"]
                byte_offset = posting["byte_offset"]
                
                term_freq = (5 * posting["frequency"][0]/posting["length"][0] + 3 * posting["frequency"][2]/(posting["length"][2]*5) + posting["frequency"][1]/posting["length"][1])
                doc_length = sum(posting["length"])
                avg_doc_length = 112.766185
                numerator = term_freq * (k1 + 1)
                denominator = term_freq + k1 * (1 - b + b * (doc_length / avg_doc_length))
                scores[doc_id]["score"] += idf * (numerator / denominator)
                scores[doc_id]["byte_offset"] = byte_offset
    
    print(total_time)
    print("total docs", len(scores))
    scores = sorted(scores.items(), key=lambda x: x[1]["score"], reverse=True)
    
    return scores    


def add_article(document, max_doc_id):
    document["title"] = word_tokenize(document["title"])
    document["abstract"] = word_tokenize(document["abstract"])
    
    # length = len(document["title"]) + len(document["abstract"]) + len(document["keywords"])
    
    for key in ["title", "abstract"]:
        document[key] =  preprocess(document[key])

    length = [
        len(document["title"]),
        len(document["abstract"]),
        len(document["keywords"]),
    ]
    
    # Frequency for title, abstract, and keywords
    frequency = [0] * 3  
    
    # Positions for abstract
    positions = []  

    # Calculate term frequencies and positions
    for idx, field in enumerate(["title", "abstract", "keywords"]):
        for pos, word in enumerate(document[field]):
            frequency[idx] += 1
            if field == "abstract":
                positions.append(pos)
    
    byte_offset = calculate_byte_offset()
    print("byte offset",byte_offset)
    
    words = set(document["title"] + document["abstract"] + document["keywords"])
    last_word_id = max(lexicon.values())
    base_path = "D:\\code\\DSAProject\\reSearch\\barrels\\"
    
    for word in words:
        word_id = lexicon.get(word)
        if not word_id:
            word_id = (last_word_id := last_word_id + 1)
            print(type(word_id))
            lexicon[word] = word_id
            barrel_index = word_id % 120
            barrel_path_parquet = os.path.join(base_path, f"barrel_{barrel_index}.parquet") 
            barrel_df = pd.read_parquet(barrel_path_parquet)
            new_row = {
                "WordId": str(word_id),
                "DocumentDetails": orjson.dumps([{
                    "DocumentID": max_doc_id,
                    "byte_offset": byte_offset,
                    "length": length,
                    "frequency": frequency,
                    "positions": positions,
                }]).decode("utf-8")
            }
            barrel_df = pd.concat([barrel_df, pd.DataFrame([new_row])], ignore_index=True)
        else:
            barrel_index = word_id % 120
            barrel_path_parquet = os.path.join(base_path, f"barrel_{barrel_index}.parquet")
            barrel_df = pd.read_parquet(barrel_path_parquet)
            term_row_no = math.floor(word_id / 120)
            document_details = orjson.loads(barrel_df.iloc[term_row_no]["DocumentDetails"])
            document_details.append({
                "DocumentID": max_doc_id,
                "byte_offset": byte_offset,
                "length": length,
                "frequency": frequency,
                "positions": positions,
            })
            barrel_df.at[term_row_no, "DocumentDetails"] = orjson.dumps(document_details).decode("utf-8")

        barrel_df.to_parquet(barrel_path_parquet, index=False)

    max_doc_id += 1



def search(query):
    """
    Perform a search for the given query and rank documents using BM25.
    """
    query_terms = word_tokenize(query)
    query_terms = preprocess(query_terms)
    
    ranked_results = compute_bm25(query_terms)
    
    return ranked_results

def count_lines_in_file(filepath):
    with open(filepath, 'rb') as f:
        return sum(1 for _ in f)

def calculate_byte_offset():
    csv_path = "D:\\code\\DSAProject\\reSearch\\cleaned_data_final.csv"
    if not os.path.exists(csv_path):
        return 0
    with open(csv_path, "rb") as f:
        f.seek(0, os.SEEK_END)
        return f.tell()

@app.route('/api/add_document', methods=['POST'])
def add_document():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        required_fields = ["title", "abstract", "year", "keywords", "n_citation", "url"]
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400


        start = time.perf_counter()
        doc_df = pd.DataFrame([data])
        
        # Add document to index
        add_article(data, max_doc_id)
        
        # Append to CSV
        doc_df.to_csv(csv_path, mode='a', index=False, header=False, sep="|")
        
        # Update lexicon file
        df = pd.DataFrame(list(lexicon.items()), columns=["Word", "WordId"])
        df.to_csv("D:\\code\\DSAProject\\reSearch\\lexicon.csv", index=False)
        
        end = time.perf_counter()
        
        return jsonify({
            "message": "Document added successfully",
            "time_taken": end - start
        }), 200

    except Exception as e:
        print(f"Error adding document: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/autocomplete', methods=['GET'])
def autocomplete_route():
    prefix = request.args.get('prefix', '').lower()
    print(prefix)
    return jsonify(autocomplete(lexicon_trie, prefix))

@app.route('/api/process', methods=['POST'])
def process_query():
    global query
    global all_results
    try:
        data = request.get_json()
        if not data or 'query' not in data:
            return jsonify({"error": "Missing 'query' in request body"}), 400
        
        start = time.perf_counter()
        current_query = data['query']
        page = data.get('page', 1)
        results_per_page = data.get('per_page', 10)
        
        if query != current_query:
            query = current_query
            all_results = search(query)
        
        start_idx = (page - 1) * results_per_page
        end_idx = page * results_per_page
        page_results = all_results[start_idx:end_idx]
        
        if len(all_results) == 0:
            page_results = top_10_results
        
        with open("D:\\code\\DSAProject\\reSearch\\cleaned_data_final.csv", "rb") as f:
            results = [
                read_row_by_byte_offset(f, doc_data["byte_offset"], doc_id)
                for doc_id, doc_data in page_results
            ]
        
        end = time.perf_counter()
        print(f"Processed query in {end - start} seconds")
            
        return jsonify({
            "input": query, 
            "output": results, 
            "total": len(all_results),
        }), 200

    except Exception as e:
        print(f"Error processing query: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    lexicon = load_lexicon()
    global lexicon_trie
    lexicon_trie = build_trie(load_lexicon_trie().keys())
    
    csv_path = "D:\\code\\DSAProject\\reSearch\\cleaned_data_final.csv"
    max_doc_id = count_lines_in_file(csv_path) - 1
    query = ""
    all_results = []

    app.run(debug=True)
