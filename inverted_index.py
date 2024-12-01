import pandas as pd
import json

# Path of the lexicon and forward_index CSVs
lexicon_csv_path = "lexicon.csv"
input_csv_path = "forward_index.csv"

# Loading the CSV's into a DataFrame
lexicon_df = pd.read_csv(lexicon_csv_path)
forward_index_df = pd.read_csv(input_csv_path)

# Convert the Lexicon's DataFrame back to lexicon (dict)
lexicon = dict(zip(lexicon_df["Word"], lexicon_df["WordId"]))

# Convert the Forward Index's DataFrame back to forward_index (nested dict)
forward_index = {}
forward_index_df['word_counts'] = forward_index_df['word_counts'].apply(eval)

for _, row in forward_index_df.iterrows():
    word_counts = row['word_counts']
    
    forward_index[row['DocumentID']] = word_counts

inverted_index = {}

def make_inverted_index():
    for word, word_id in lexicon.items():
        for doc_id, word_count in forward_index.items():
            if word_id in word_count:
                if str(word_id) not in inverted_index:
                    inverted_index[str(word_id)] = [doc_id]
                else:
                    inverted_index[str(word_id)].append(doc_id)
                
make_inverted_index()

# Converting inverted_index to a DataFrame for exporting
export_data = [
    {"WordID": word_id, "DocumentIDs": json.dumps(doc_ids)}
    for word_id, doc_ids in inverted_index.items()
]

# Creating a DataFrame
df = pd.DataFrame(export_data)

# Exporting the DataFrame to a CSV file
df.to_csv("inverted_index.csv", index=False)