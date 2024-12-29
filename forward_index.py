import pandas as pd
import time
from collections import Counter, defaultdict
import orjson

# Paths to the input and output files
processed_text_path = "D:\\code\\DSAProject\\reSearch\\processed_text_final.csv"
lexicon_path = "D:\\code\\DSAProject\\reSearch\\lexicon.csv"
original_text_path = "D:\\code\\DSAProject\\reSearch\\cleaned_data_final.csv"
output_path = "D:\\code\\DSAProject\\reSearch\\forward_index.csv"

# Load the lexicon into a dictionary
lexicon_df = pd.read_csv(lexicon_path)
lexicon = dict(zip(lexicon_df["Word"], lexicon_df["WordId"]))
total_docs_length = 0

def compute_byte_offsets(file_path):
    """
    Compute byte offsets for each row in a CSV file, excluding the header row.
    Returns a dictionary mapping row numbers (1-indexed) to byte offsets.
    """
    offsets = {}  # To store row number and byte offset
    with open(file_path, "r", encoding="utf-8") as f:
        header = f.readline()  # Read and skip the header row
        print(f"Skipped header: {header.strip()}")  # Optional: log the skipped header
        
        row_number = 0
        while True:
            position = f.tell()  # Get the current byte position
            line = f.readline()  # Read the next line
            if not line:  # End of file
                break
            if line.strip():  # Skip blank lines
                row_number += 1
                offsets[row_number] = position  # Map row number to byte offset

    return offsets

# Compute byte offsets for the original text
byte_offsets = compute_byte_offsets(original_text_path)

# Function to process a single batch and create the forward index
def process_batch(data, byte_offsets):
    forward_index = {}
    global total_docs_length
    for index, row in data.iterrows():
        doc_id = index + 1
        length = [0, 0, 0]
        # Fetch byte offset for the document
        byte_offset = byte_offsets.get(doc_id)

        title_words = row['title']
        abstract_words = row['abstract']
        keyword_words = row['keywords']

        title_word_counts = Counter(title_words)
        abstract_word_counts = Counter(abstract_words)
        keyword_word_counts = Counter(keyword_words)
        length[0] = len(title_words)
        length[1] = len(abstract_words)
        length[2] = len(keyword_words)

        total_docs_length += sum(length)

        word_scores = defaultdict(lambda: {"frequency": [0, 0, 0], "positions": []})

        # Add frequencies for title, abstract and keywords
        for word, count in title_word_counts.items():
            word_id = lexicon.get(word)
            if word_id:
                word_id = str(word_id)
                word_scores[word_id]["frequency"][0] += count  # Title index is 0
        
        for word, count in abstract_word_counts.items():
            word_id = lexicon.get(word)
            if word_id:
                word_id = str(word_id)
                word_scores[word_id]["frequency"][1] += count  # Abstract index is 1

        for word, count in keyword_word_counts.items():
            word_id = lexicon.get(word)
            if word_id:
                word_id = str(word_id)
                word_scores[word_id]["frequency"][2] += count  # Keywords index is 2

        # Add to the forward index
        forward_index[doc_id] = {
            "byte_offset": byte_offset,
            "length": length,
            "word_scores": {
                word_id: {
                    "frequency": scores["frequency"],
                }
                for word_id, scores in word_scores.items()
            }
        }

    return forward_index


if __name__ == "__main__":
    # Batch processing loop
    batch_size = 10000
    chunk_number = 0

    start_time = time.time()

    # Read the data in chunks
    for chunk in pd.read_csv(processed_text_path, chunksize=batch_size):
        chunk['title'] = chunk['title'].apply(str).apply(str.split)
        chunk['abstract'] = chunk['abstract'].apply(str).apply(str.split)
        chunk['keywords'] = chunk['keywords'].apply(str).apply(str.split)

        forward_index = process_batch(chunk, byte_offsets)

        export_data = [
            {
                "DocumentID": doc_id,
                "byte_offset": data["byte_offset"],
                "length": data["length"],
                "word_scores": orjson.dumps(data["word_scores"]).decode("utf-8")
            }
            for doc_id, data in forward_index.items()
        ]
        df = pd.DataFrame(export_data)

        mode = 'a' if chunk_number > 0 else 'w'
        header = chunk_number == 0
        df.to_csv(output_path, mode=mode, header=header, index=False)

        chunk_number += 1

    # some stats
    print("average doc length", total_docs_length/200000)
    end_time = time.time()
    print(f"Time taken to create forward index: {end_time - start_time:.2f} seconds")